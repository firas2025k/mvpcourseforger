// app/dashboard/analytics/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Import UI components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// --- Type Definitions based on the correct, final schema ---
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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // --- Data Fetching for Analytics using the CORRECT Schema ---

  // 1. Fetch courses created by the user.
  const { data: userCoursesData, error: coursesError } = await supabase
    .from('courses')
    .select('id')
    .eq('user_id', user.id);
  
  if (coursesError) console.error('Error fetching courses:', coursesError.message);
  const userCourseIds = userCoursesData?.map(course => course.id) || [];

  let allChapters: Chapter[] = [];
  let allLessons: Lesson[] = [];
  let completedProgress: ProgressRecord[] = [];

  if (userCourseIds.length > 0) {
    // 2. Fetch all chapters for the user's courses.
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, course_id')
      .in('course_id', userCourseIds);
    if (chaptersError) console.error('Error fetching chapters:', chaptersError.message);
    allChapters = chaptersData || [];

    if (allChapters.length > 0) {
      const chapterIds = allChapters.map(c => c.id);
      // 3. Fetch all lessons for those chapters.
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, chapter_id')
        .in('chapter_id', chapterIds);
      if (lessonsError) console.error('Error fetching lessons:', lessonsError.message);
      allLessons = lessonsData || [];
    }

    if (allLessons.length > 0) {
      const lessonIds = allLessons.map(l => l.id);
      // 4. Fetch user's completion data from the 'progress' table.
      const { data: progressData, error: progressError } = await supabase
        .from('progress') // Using the correct 'progress' table
        .select('lesson_id, completed_at')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .in('lesson_id', lessonIds)
        .order('completed_at', { ascending: false });
      // This is the error you just received. This change fixes it.
      if (progressError) console.error('Error fetching user progress:', progressError.message);
      completedProgress = progressData || [];
    }
  }

  // --- Data Processing ---
  const totalChapters = allChapters.length;
  const totalLessons = allLessons.length;
  const lessonsCompleted = completedProgress.length;
  const percentageCompleted = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  const lastActivity = completedProgress.length > 0 ? new Date(completedProgress[0].completed_at).toLocaleString() : 'N/A';
  const completedLessonIds = new Set(completedProgress.map(p => p.lesson_id));

  // Calculate completed chapters
  const lessonsByChapter = allLessons.reduce((acc, lesson) => {
    if (!acc[lesson.chapter_id]) acc[lesson.chapter_id] = [];
    acc[lesson.chapter_id].push(lesson.id);
    return acc;
  }, {} as Record<string, string[]>);

  const chaptersCompleted = Object.values(lessonsByChapter).filter(lessonIds => 
    lessonIds.every(id => completedLessonIds.has(id))
  ).length;

  const isCourseCompleted = totalLessons > 0 && lessonsCompleted === totalLessons;
  let currentLesson = 'N/A';
  if (!isCourseCompleted && allLessons.length > 0) {
    currentLesson = allLessons.find(l => !completedLessonIds.has(l.id))?.title || 'N/A';
  } else if (isCourseCompleted && allLessons.length > 0) {
    currentLesson = 'All Completed!';
  }

  const userProgress = {
    percentageCompleted,
    chaptersCompleted,
    totalChapters,
    lessonsCompleted,
    totalLessons,
    currentLesson,
    lastActivity,
    isCourseCompleted
  };
  
  // (The rest of the component's return statement remains the same as the previous correct versions)
  // ...
  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12">
      {/* Header Section */}
      <header className="px-4 md:px-0">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your learning progress and engagement.
        </p>
      </header>

      {/* Main Analytics Content */}
      <section className="px-4 md:px-0 grid gap-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Progress Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span>Course Completion</span>
                    <span>{userProgress.percentageCompleted}%</span>
                  </div>
                  <Progress value={userProgress.percentageCompleted} className="w-full" />
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p>Chapters Completed: {userProgress.chaptersCompleted} / {userProgress.totalChapters}</p>
                  <p>Lessons Completed: {userProgress.lessonsCompleted} / {userProgress.totalLessons}</p>
                  <p>Current Lesson: {userProgress.currentLesson}</p>
                  <p>Last Activity: {userProgress.lastActivity}</p>
                  <p>Course Completed: {userProgress.isCourseCompleted ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Other placeholder cards would go here... */}

          </TabsContent>

          <TabsContent value="lessons">
            {/* Lesson Interaction Section */}
            <Card>
              <CardHeader>
                <CardTitle>Lesson Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {allLessons.map(lesson => (
                    <AccordionItem key={lesson.id} value={lesson.id}>
                      <AccordionTrigger>{lesson.title}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                           <span>Status: <Badge>{completedLessonIds.has(lesson.id) ? 'Completed' : 'Not started'}</Badge></span>
                           <span>Time Spent: N/A</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}