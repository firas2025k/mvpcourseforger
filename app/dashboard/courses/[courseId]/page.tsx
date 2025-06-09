import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CoursePageProps, FullCourseData, Chapter, Lesson, Quiz } from '@/types/course';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import CourseLayoutClient from '@/components/dashboard/courses/CourseLayoutClient'; // Import the new client component

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
  const processedChapters = (chaptersData || []).map(ch => ({
    ...ch,
    lessons: (ch.lessons || []).map(l => ({
        ...l,
        quizzes: (l.quizzes || []).map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [] // Ensure options is an array
        })).sort((a,b) => a.id.localeCompare(b.id))
    })).sort((a,b) => a.lesson_number - b.lesson_number)
  })).sort((a,b) => a.chapter_number - b.chapter_number);

  const fullCourseData: FullCourseData = {
    ...course,
    chapters: processedChapters as FullCourseData['chapters'], // Cast after ensuring structure
  };

  return fullCourseData;
}

export default async function CourseDisplayPage({ params }: CoursePageProps) {
  // Defensive check for params and params.courseId
  if (!params || typeof params.courseId !== 'string') {
    console.error("CourseDisplayPage: Critical error - params or params.courseId is invalid. Params:", params);
    redirect('/dashboard?error=invalid_course_params');
    return null; // Ensure function exits after redirect
  }
  const { courseId } = params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
    return null; // Ensure function exits after redirect
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
