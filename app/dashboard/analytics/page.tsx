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

// --- NEW: Import Chart Components ---
import { CourseProgressPieChart } from "@/components/analytics/CourseProgressPieChart";
import { LessonsCompletionBarChart } from "@/components/analytics/LessonsCompletionBarChart";


// --- Type Definitions based on the correct, final schema ---
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

// --- NEW: Type Definitions for Chart Data ---
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

  // 1. Fetch courses created by the user (now with titles).
  const { data: userCoursesData, error: coursesError } = await supabase
    .from('courses')
    .select('id, title') // Fetch title for the bar chart
    .eq('user_id', user.id);
  
  if (coursesError) console.error('Error fetching courses:', coursesError.message);
  const userCourses: Course[] = userCoursesData || [];
  const userCourseIds = userCourses.map(course => course.id);

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
        .from('progress')
        .select('lesson_id, completed_at')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .in('lesson_id', lessonIds)
        .order('completed_at', { ascending: false });
      if (progressError) console.error('Error fetching user progress:', progressError.message);
      completedProgress = progressData || [];
    }
  }

  // --- Data Processing for UI, Charts & Summary Cards ---
  
  const lessonsCompleted = completedProgress.length;
  const totalLessons = allLessons.length;
  const lessonsPending = totalLessons - lessonsCompleted;
  
  // Data for the Pie Chart
  const pieChartData: PieChartData[] = [
    { name: 'Completed', value: lessonsCompleted },
    { name: 'Pending', value: lessonsPending },
  ];

  // Data for the Bar Chart
  const barChartData: BarChartData[] = userCourses.map(course => {
    const chaptersInCourse = allChapters.filter(c => c.course_id === course.id);
    const chapterIdsInCourse = chaptersInCourse.map(c => c.id);
    const lessonsInCourse = allLessons.filter(l => chapterIdsInCourse.includes(l.chapter_id));
    const lessonIdsInCourse = lessonsInCourse.map(l => l.id);
    
    const completedLessonsInCourse = completedProgress.filter(p => lessonIdsInCourse.includes(p.lesson_id)).length;
    const totalLessonsInCourse = lessonsInCourse.length;
    const progress = totalLessonsInCourse > 0 ? Math.round((completedLessonsInCourse / totalLessonsInCourse) * 100) : 0;

    return {
      courseTitle: course.title,
      completed: completedLessonsInCourse,
      total: totalLessonsInCourse,
      progress: progress,
    }
  }).filter(d => d.total > 0); // Only show courses that have lessons

  // Data for the summary cards
  const completedLessonIds = new Set(completedProgress.map(p => p.lesson_id));
  const totalChapters = allChapters.length;

  const lessonsByChapter = allLessons.reduce((acc, lesson) => {
    if (!acc[lesson.chapter_id]) acc[lesson.chapter_id] = [];
    acc[lesson.chapter_id].push(lesson.id);
    return acc;
  }, {} as Record<string, string[]>);

  const chaptersCompleted = Object.values(lessonsByChapter).filter(lessonIds => 
    lessonIds.every(id => completedLessonIds.has(id))
  ).length;

  const overallPercentage = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  
  // Placeholder data for cards that don't have schema support yet
  const learningEngagement = { streakCount: 0, timeSpentTotal: '0h 0m', timeSpentAvgSession: '0m' };
  const milestones = [
    { id: '1', name: 'First Chapter Completed', achieved: chaptersCompleted > 0 },
    { id: '2', name: 'First Course Completed', achieved: barChartData.some(c => c.progress === 100) },
    { id: '3', name: 'Completed All Lessons', achieved: totalLessons > 0 && lessonsCompleted === totalLessons },
  ];


  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12">
      <header className="px-4 md:px-0">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your learning progress and engagement.
        </p>
      </header>

      <section className="px-4 md:px-0 grid gap-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {/* --- CHARTS ON THE FIRST ROW --- */}
            <CourseProgressPieChart data={pieChartData} />
            <LessonsCompletionBarChart data={barChartData} />

            {/* --- SUMMARY CARDS ON THE SECOND ROW --- */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span>Overall Completion</span>
                    <span>{overallPercentage}%</span>
                  </div>
                  <Progress value={overallPercentage} className="w-full" />
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p>Chapters Completed: {chaptersCompleted} / {totalChapters}</p>
                  <p>Lessons Completed: {lessonsCompleted} / {totalLessons}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Learning Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Engagement stats are coming soon.</p>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Learning Streak: <Badge>{learningEngagement.streakCount} days</Badge></p>
                  <p>Total Time Spent: {learningEngagement.timeSpentTotal}</p>
                  <p>Avg Session Length: {learningEngagement.timeSpentAvgSession}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center justify-between text-sm">
                      <span>{milestone.name}</span>
                      {milestone.achieved ? <Badge variant="default">Achieved</Badge> : <Badge variant="secondary">Not Achieved</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </TabsContent>
          <TabsContent value="lessons">
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
