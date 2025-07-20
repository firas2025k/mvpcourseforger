// app/dashboard/analytics/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";


// Type Definitions
interface Course {
  id: string;
  title: string;
}
interface Chapter {
  id: string;
  course_id: string;
}
interface Lesson {
  id: string;
  title: string;
  chapter_id: string;
}
interface ProgressRecord {
  lesson_id: string;
  completed_at: string;
}
interface Presentation {
  id: string;
  title: string;
  slide_count: number;
}
interface Slide {
  id: string;
  presentation_id: string;
  title: string;
}
interface PresentationProgress {
  slide_id: string;
  viewed_at: string;
}
interface Companion {
  id: string;
  name: string;
  subject: string;
  duration?: number; // Expected duration for companion sessions
}
interface SessionHistory {
  companion_id: string;
  created_at: string;
  duration?: number; // Actual duration of the session in seconds
}

// Chart Data Types
interface PieChartData {
  name: string;
  value: number;
}
interface BarChartData {
  courseTitle: string;
  completed: number;
  total: number;
  progress: number;
}
interface PresentationBarChartData {
  presentationTitle: string;
  viewed: number;
  total: number;
  progress: number;
}
interface SessionChartData {
  date: string;
  sessions: number;
  totalDuration: number; // Total duration for that day in minutes
  averageDuration: number; // Average duration per session in minutes
}
interface CompanionChartData {
  companionName: string;
  sessions: number;
  subject: string;
  totalDuration: number; // Total duration in minutes
  averageDuration: number; // Average duration per session in minutes
}

export interface AnalyticsData {
  // Summary data
  lessonsCompleted: number;
  totalLessons: number;
  lessonsPending: number;
  slidesViewed: number;
  totalSlides: number;
  slidesPending: number;
  totalSessions: number;
  totalSessionDuration: number; // Total duration across all sessions in minutes
  averageSessionDuration: number; // Average duration per session in minutes
  overallPercentage: number;
  presentationOverallPercentage: number;
  
  // Chart data
  coursesPieChartData: PieChartData[];
  coursesBarChartData: BarChartData[];
  presentationsPieChartData: PieChartData[];
  presentationsBarChartData: PresentationBarChartData[];
  sessionChartData: SessionChartData[];
  companionUsageData: CompanionChartData[];
  
  // Detail data
  allLessons: Lesson[];
  completedProgress: ProgressRecord[];
  userPresentations: Presentation[];
  allSlides: Slide[];
  viewedPresentationProgress: PresentationProgress[];
  userCompanions: Companion[];
}

export default async function AnalyticsPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // --- COURSES DATA FETCHING ---
  const { data: userCoursesData, error: coursesError } = await supabase
    .from("courses")
    .select("id, title")
    .eq("user_id", user.id);

  if (coursesError)
    console.error("Error fetching courses:", coursesError.message);
  const userCourses: Course[] = userCoursesData || [];
  const userCourseIds = userCourses.map((course) => course.id);

  let allChapters: Chapter[] = [];
  let allLessons: Lesson[] = [];
  let completedProgress: ProgressRecord[] = [];

  if (userCourseIds.length > 0) {
    const { data: chaptersData, error: chaptersError } = await supabase
      .from("chapters")
      .select("id, course_id")
      .in("course_id", userCourseIds);
    if (chaptersError)
      console.error("Error fetching chapters:", chaptersError.message);
    allChapters = chaptersData || [];

    if (allChapters.length > 0) {
      const chapterIds = allChapters.map((c) => c.id);
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, title, chapter_id")
        .in("chapter_id", chapterIds);
      if (lessonsError)
        console.error("Error fetching lessons:", lessonsError.message);
      allLessons = lessonsData || [];
    }

    if (allLessons.length > 0) {
      const lessonIds = allLessons.map((l) => l.id);
      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .select("lesson_id, completed_at")
        .eq("user_id", user.id)
        .eq("is_completed", true)
        .in("lesson_id", lessonIds)
        .order("completed_at", { ascending: false });
      if (progressError)
        console.error("Error fetching user progress:", progressError.message);
      completedProgress = progressData || [];
    }
  }

  // --- PRESENTATIONS DATA FETCHING ---
  const { data: userPresentationsData, error: presentationsError } =
    await supabase
      .from("presentations")
      .select("id, title, slide_count")
      .eq("user_id", user.id);

  if (presentationsError)
    console.error("Error fetching presentations:", presentationsError.message);
  const userPresentations: Presentation[] = userPresentationsData || [];
  const userPresentationIds = userPresentations.map((p) => p.id);

  let allSlides: Slide[] = [];
  let viewedPresentationProgress: PresentationProgress[] = [];

  if (userPresentationIds.length > 0) {
    const { data: slidesData, error: slidesError } = await supabase
      .from("slides")
      .select("id, presentation_id, title")
      .in("presentation_id", userPresentationIds);
    if (slidesError)
      console.error("Error fetching slides:", slidesError.message);
    allSlides = slidesData || [];

    if (allSlides.length > 0) {
      const slideIds = allSlides.map((s) => s.id);
      const {
        data: presentationProgressData,
        error: presentationProgressError,
      } = await supabase
        .from("presentation_progress")
        .select("slide_id, viewed_at")
        .eq("user_id", user.id)
        .eq("is_viewed", true)
        .in("slide_id", slideIds)
        .order("viewed_at", { ascending: false });
      if (presentationProgressError)
        console.error(
          "Error fetching presentation progress:",
          presentationProgressError.message
        );
      viewedPresentationProgress = presentationProgressData || [];
    }
  }

  // --- VOICE AGENTS DATA FETCHING ---
  // Enhanced: Query companions table with duration field
  const { data: userCompanionsData, error: companionsError } = await supabase
    .from("companions")
    .select("id, name, subject, duration")
    .eq("author", user.id);

  if (companionsError)
    console.error("Error fetching companions:", companionsError.message);
  const userCompanions: Companion[] = userCompanionsData || [];
  const userCompanionIds = userCompanions.map((c) => c.id);

  let sessionHistory: SessionHistory[] = [];

  // Enhanced: Fetch session history with duration data
  const { data: sessionHistoryData, error: sessionHistoryError } =
    await supabase
      .from("session_history")
      .select("companion_id, created_at, duration")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
  
  if (sessionHistoryError)
    console.error(
      "Error fetching session history:",
      sessionHistoryError.message
    );
  sessionHistory = sessionHistoryData || [];

  // Filter session history to only include sessions for existing companions
  const filteredSessionHistory = userCompanionIds.length > 0 
    ? sessionHistory.filter(session => userCompanionIds.includes(session.companion_id))
    : sessionHistory;

  // --- DATA PROCESSING ---

  // Courses Data
  const lessonsCompleted = completedProgress.length;
  const totalLessons = allLessons.length;
  const lessonsPending = totalLessons - lessonsCompleted;

  const coursesPieChartData: PieChartData[] = [
    { name: "Completed", value: lessonsCompleted },
    { name: "Pending", value: lessonsPending },
  ];

  const coursesBarChartData: BarChartData[] = userCourses
    .map((course) => {
      const chaptersInCourse = allChapters.filter(
        (c) => c.course_id === course.id
      );
      const chapterIdsInCourse = chaptersInCourse.map((c) => c.id);
      const lessonsInCourse = allLessons.filter((l) =>
        chapterIdsInCourse.includes(l.chapter_id)
      );
      const lessonIdsInCourse = lessonsInCourse.map((l) => l.id);

      const completedLessonsInCourse = completedProgress.filter((p) =>
        lessonIdsInCourse.includes(p.lesson_id)
      ).length;
      const totalLessonsInCourse = lessonsInCourse.length;
      const progress =
        totalLessonsInCourse > 0
          ? Math.round((completedLessonsInCourse / totalLessonsInCourse) * 100)
          : 0;

      return {
        courseTitle: course.title,
        completed: completedLessonsInCourse,
        total: totalLessonsInCourse,
        progress: progress,
      };
    })
    .filter((d) => d.total > 0);

  // Presentations Data
  const slidesViewed = viewedPresentationProgress.length;
  const totalSlides = allSlides.length;
  const slidesPending = totalSlides - slidesViewed;

  const presentationsPieChartData: PieChartData[] = [
    { name: "Completed", value: slidesViewed },
    { name: "Pending", value: slidesPending },
  ];

  const presentationsBarChartData: PresentationBarChartData[] =
    userPresentations
      .map((presentation) => {
        const slidesInPresentation = allSlides.filter(
          (s) => s.presentation_id === presentation.id
        );
        const slideIdsInPresentation = slidesInPresentation.map((s) => s.id);

        const viewedSlidesInPresentation = viewedPresentationProgress.filter(
          (p) => slideIdsInPresentation.includes(p.slide_id)
        ).length;
        const totalSlidesInPresentation = slidesInPresentation.length;
        const progress =
          totalSlidesInPresentation > 0
            ? Math.round(
                (viewedSlidesInPresentation / totalSlidesInPresentation) * 100
              )
            : 0;

        return {
          presentationTitle: presentation.title,
          viewed: viewedSlidesInPresentation,
          total: totalSlidesInPresentation,
          progress: progress,
        };
      })
      .filter((d) => d.total > 0);

  // Enhanced Voice Agents Data with Duration Tracking
  const sessionsByDate = filteredSessionHistory.reduce((acc, session) => {
    const date = new Date(session.created_at).toLocaleDateString();
    const durationInMinutes = session.duration ? Math.round(session.duration / 60) : 0;
    
    if (!acc[date]) {
      acc[date] = { sessions: 0, totalDuration: 0 };
    }
    
    acc[date].sessions += 1;
    acc[date].totalDuration += durationInMinutes;
    
    return acc;
  }, {} as Record<string, { sessions: number; totalDuration: number }>);

  const sessionChartData: SessionChartData[] = Object.entries(sessionsByDate)
    .map(([date, data]) => ({
      date,
      sessions: data.sessions,
      totalDuration: data.totalDuration,
      averageDuration: data.sessions > 0 ? Math.round(data.totalDuration / data.sessions) : 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Last 7 days

  // Enhanced: Show all companions with duration data
  const companionUsageData: CompanionChartData[] = userCompanions
    .map((companion) => {
      const companionSessions = filteredSessionHistory.filter(
        (s) => s.companion_id === companion.id
      );
      const sessions = companionSessions.length;
      const totalDurationSeconds = companionSessions.reduce(
        (sum, session) => sum + (session.duration || 0), 0
      );
      const totalDurationMinutes = Math.round(totalDurationSeconds / 60);
      const averageDurationMinutes = sessions > 0 
        ? Math.round(totalDurationMinutes / sessions) 
        : 0;

      return {
        companionName: companion.name,
        sessions: sessions,
        subject: companion.subject || "General",
        totalDuration: totalDurationMinutes,
        averageDuration: averageDurationMinutes,
      };
    });

  // Enhanced Summary calculations with duration
  const overallPercentage =
    totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  const presentationOverallPercentage =
    totalSlides > 0 ? Math.round((slidesViewed / totalSlides) * 100) : 0;
  const totalSessions = filteredSessionHistory.length;
  
  // Calculate total and average session duration
  const totalSessionDurationSeconds = filteredSessionHistory.reduce(
    (sum, session) => sum + (session.duration || 0), 0
  );
  const totalSessionDuration = Math.round(totalSessionDurationSeconds / 60); // Convert to minutes
  const averageSessionDuration = totalSessions > 0 
    ? Math.round(totalSessionDuration / totalSessions) 
    : 0;

  const analyticsData: AnalyticsData = {
    lessonsCompleted,
    totalLessons,
    lessonsPending,
    slidesViewed,
    totalSlides,
    slidesPending,
    totalSessions,
    totalSessionDuration,
    averageSessionDuration,
    overallPercentage,
    presentationOverallPercentage,
    coursesPieChartData,
    coursesBarChartData,
    presentationsPieChartData,
    presentationsBarChartData,
    sessionChartData,
    companionUsageData,
    allLessons,
    completedProgress,
    userPresentations,
    allSlides,
    viewedPresentationProgress,
    userCompanions,
  };

  return <AnalyticsClient data={analyticsData} />;
}

