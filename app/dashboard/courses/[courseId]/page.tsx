export const dynamic = "force-dynamic";

import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { CoursePageProps, FullCourseData, Chapter, Lesson, Quiz } from '@/types/course';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import CourseLayoutClient from '@/components/dashboard/courses/CourseLayoutClient';

async function getCourseData(courseId: string, userId: string): Promise<FullCourseData | null> {
  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('user_id', userId) // Ensure the user owns the course
    .single();

  if (courseError || !course) {
    console.error('Error fetching course or course not found:', courseError);
    return null;
  }

  const { data: chaptersData, error: chaptersError } = await supabase
    .from('chapters')
    .select('*, lessons(*, quizzes(*))') // Nested select for lessons and quizzes
    .eq('course_id', courseId);

  if (chaptersError) {
    console.error('Error fetching chapters and lessons:', chaptersError);
    // Decide if we should return partial data or null
    return { ...course, chapters: [] }; 
  }

  // Ensure lessons within chapters and quizzes within lessons are sorted if not guaranteed by DB
  // Also, ensure that the structure matches FullCourseData by providing empty arrays if relations are null
  const processedChapters = (chaptersData || [] as Chapter[]).map((ch: Chapter) => {
      
      return {
    ...ch,
    lessons: (ch.lessons || [] as Lesson[]).map((l: Lesson) => ({
        ...l,
        quizzes: (l.quizzes || [] as Quiz[]).map((q: Quiz & { wrong_answers?: string[], correct_answer: string }) => {
          const wrongAnswers = Array.isArray(q.wrong_answers) ? q.wrong_answers : [];
          let allOptions = [q.correct_answer, ...wrongAnswers].filter(opt => typeof opt === 'string'); // Ensure all are strings
          
          // Shuffle options (Fisher-Yates shuffle)
          for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
          }
          
          return {
            ...q,
            options: allOptions,
            // correct_answer is already part of ...q
          };
        }).sort((a,b) => a.id.localeCompare(b.id))
    })).sort((a,b) => a.lesson_number - b.lesson_number)
  };}).sort((a: Chapter, b: Chapter) => (a.order_index || 0) - (b.order_index || 0));

  const fullCourseData: FullCourseData = {
    ...course,
    chapters: processedChapters as FullCourseData['chapters'], // Cast after ensuring structure
  };

  return fullCourseData;
}

export default async function CourseDisplayPage({ params, searchParams }: CoursePageProps) {
  // 1. Validate courseId immediately
  const courseId = params.courseId;
  if (typeof courseId !== 'string') {
    console.error("CourseDisplayPage: Critical error - courseId is not a string or is missing. Received:", courseId);
    notFound(); // Use notFound for invalid resource identifier
    // notFound() does not require a 'return null;' as it throws an error that Next.js handles.
  }

  // 2. Then, proceed with async operations
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login'); // For auth failure, redirect is appropriate
    return null; 
  }

  const courseData = await getCourseData(courseId, user.id);

  if (!courseData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <BookOpen className="w-16 h-16 mb-4 text-destructive" />
        <h1 className="text-2xl font-semibold mb-2">Course Not Found</h1>
        <p className="text-muted-foreground mb-4">
          We couldn't find the course you're looking for, or you may not have permission to view it.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Pass the fetched data to the client component
  return <CourseLayoutClient courseData={courseData} />;
}
