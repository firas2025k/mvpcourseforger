export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  CoursePageProps,
  FullCourseData,
  Chapter,
  Lesson,
  Quiz,
} from "@/types/course";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import CourseLayoutClient from "@/components/dashboard/courses/CourseLayoutClient";

async function getCourseData(
  courseId: string,
  userId: string
): Promise<FullCourseData | null> {
  const supabase = await createClient();

  // First, try to fetch the course WITHOUT user_id filter
  const { data: courses, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId);

  if (courseError) {
    console.error("Error fetching course:", courseError);
    return null;
  }

  // Check if course exists
  if (!courses || courses.length === 0) {
    console.error("Course not found:", courseId);
    return null;
  }

  const course = courses[0];

  // Check if course is archived
  if (course.is_archived) {
    console.error("Course is archived:", courseId);
    return null;
  }

  // Check permissions
  const isOwner = course.user_id === userId;
  let hasAccess = isOwner;

  if (!isOwner) {
    // Check if user is enrolled
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle(); // Use maybeSingle() instead of single()

    // If not enrolled and course is not published, deny access
    if (!enrollment && !course.is_published) {
      console.error("User not enrolled and course not published:", courseId);
      return null;
    }

    hasAccess = true;
  }

  if (!hasAccess) {
    console.error("User does not have access to course:", courseId);
    return null;
  }

  // Now fetch chapters and lessons
  const { data: chaptersData, error: chaptersError } = await supabase
    .from("chapters")
    .select("*, lessons(*, quizzes(*))")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (chaptersError) {
    console.error("Error fetching chapters and lessons:", chaptersError);
    return { ...course, chapters: [] };
  }

  // Process chapters and lessons
  const processedChapters = (chaptersData || ([] as Chapter[]))
    .map((ch: Chapter) => {
      return {
        ...ch,
        lessons: (ch.lessons || ([] as Lesson[]))
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map((l: Lesson) => ({
            ...l,
            quizzes: (l.quizzes || ([] as Quiz[]))
              .map(
                (
                  q: Quiz & { wrong_answers?: string[]; correct_answer: string }
                ) => {
                  const wrongAnswers = Array.isArray(q.wrong_answers)
                    ? q.wrong_answers
                    : [];
                  let allOptions = [q.correct_answer, ...wrongAnswers].filter(
                    (opt) => typeof opt === "string"
                  );

                  // Shuffle options (Fisher-Yates shuffle)
                  for (let i = allOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allOptions[i], allOptions[j]] = [
                      allOptions[j],
                      allOptions[i],
                    ];
                  }

                  return {
                    ...q,
                    options: allOptions,
                  };
                }
              )
              .sort((a, b) => a.id.localeCompare(b.id)),
          })),
      };
    })
    .sort(
      (a: Chapter, b: Chapter) => (a.order_index || 0) - (b.order_index || 0)
    );

  const fullCourseData: FullCourseData = {
    ...course,
    chapters: processedChapters as FullCourseData["chapters"],
  };

  return fullCourseData;
}

export default async function CourseDisplayPage({
  params,
  searchParams,
}: CoursePageProps) {
  // 1. Validate courseId immediately
  const courseId = params.courseId;
  if (typeof courseId !== "string") {
    console.error(
      "CourseDisplayPage: Critical error - courseId is not a string or is missing. Received:",
      courseId
    );
    notFound();
  }

  // 2. Then, proceed with async operations
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error or no user:", authError);
    redirect("/auth/login");
  }

  const courseData = await getCourseData(courseId, user.id);

  if (!courseData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <BookOpen className="relative w-20 h-20 mb-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          Course Not Found
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
          We couldn't find the course you're looking for, or you may not have
          permission to view it.
        </p>
        <div className="flex gap-4">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group hover:shadow-lg transition-all duration-300"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              Go to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Link href="/dashboard/courses" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              My Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Pass the fetched data to the client component
  return <CourseLayoutClient courseData={courseData} />;
}
