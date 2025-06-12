// app/dashboard/analytics/page.tsx
import { redirect } from "next/navigation";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Import necessary UI components (add more as needed)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Import DashboardLayout
// Assuming DashboardLayout is used to wrap content like in app/dashboard/page.tsx
// You might need to adjust the import path if necessary based on its actual location
// import DashboardLayout from '@/components/dashboard/DashboardLayout'; // If you have a specific layout component, uncomment this

// --- Type Definitions ---
interface Lesson {
  id: string;
  title: string;
  chapter_id: string;
  chapters: { course_id: string; title: string };
}

interface ProgressItem {
  lesson_id: string;
  is_completed: boolean;
  completed_at: string | null; // ISO timestamp
}

interface UserProgress {
  percentageCompleted: number;
  chaptersCompleted: number;
  totalChapters: number;
  lessonsCompleted: number;
  totalLessons: number;
  currentLesson: string;
  lastActivity: string | null;
}

interface LessonInteraction {
  id: string;
  title: string;
  status: 'Not started' | 'In progress' | 'Completed';
  timeSpent: string; // e.g., '15m'
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

  // --- Data Fetching for Analytics ---
  const { data: lessonsData, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title, chapter_id, chapters(course_id, title)')
    .order('order_index', { ascending: true });

  const { data: progressData, error: progressError } = await supabase
    .from('progress')
    .select('lesson_id, is_completed, completed_at')
    .eq('user_id', user.id);

  if (lessonsError) {
    console.error('Error fetching lessons:', lessonsError);
  }
  if (progressError) {
    console.error('Error fetching progress:', progressError);
  }

  const lessons: Lesson[] = (lessonsData as any[]) || [];
  const progressItems: ProgressItem[] = (progressData as any[]) || [];

  // --- Data Processing ---

  // Calculate Progress Overview Data
  const totalLessons = lessons.length;
  const completedLessons = progressItems.filter(item => item.is_completed).length;
  const percentageCompleted = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  //const chaptersCompleted = new Set(progressItems.filter(item => item.is_completed).map(item => lessons.find(lesson => lesson.id === item.lesson_id)?.chapter_id)).size;
  const completedLessonIds = new Set(progressItems.filter(item => item.is_completed).map(item => item.lesson_id));
  const chaptersCompleted = new Set(lessons
    .filter(lesson => completedLessonIds.has(lesson.id))
    .map(lesson => lesson.chapter_id)).size;

  const totalChapters = new Set(lessons.map(lesson => lesson.chapter_id)).size;

  const lastActivity = progressItems.reduce((latest: string | null, current) => {
    if (!latest || (current.completed_at && current.completed_at > latest)) {
      return current.completed_at || latest;
    }
    return latest;
  }, null);

  // Find the current lesson in progress
  const currentLessonInProgress = lessons.find(lesson => !progressItems.find(progress => progress.lesson_id === lesson.id && progress.is_completed));
  const currentLesson = currentLessonInProgress ? currentLessonInProgress.title : 'No lesson in progress';

  const userProgress: UserProgress = {
    percentageCompleted,
    chaptersCompleted,
    totalChapters,
    lessonsCompleted: completedLessons,
    totalLessons,
    currentLesson,
    lastActivity,
  };

  // Structure Lesson Interaction Data
  const lessonInteraction: LessonInteraction[] = lessons.map(lesson => {
    const progress = progressItems.find(item => item.lesson_id === lesson.id);
    let status: LessonInteraction['status'] = 'Not started';
    if (progress) {
      status = progress.is_completed ? 'Completed' : 'In progress';
    }

    // Placeholder for time spent (You'd need to track time spent per lesson separately)
    const timeSpent = 'N/A';

    return {
      id: lesson.id,
      title: lesson.title,
      status,
      timeSpent,
    };
  });

  const learningEngagement = {
    // Data for line chart (e.g., lessons completed per day)
    dailyActivity: [
      { date: '2023-10-20', lessons: 2 },
      { date: '2023-10-21', lessons: 3 },
      { date: '2023-10-22', lessons: 1 },
      // ... more data
    ],
    streakCount: 7,
    timeSpentTotal: "10h 30m",
    timeSpentAvgSession: "30m",
  };

  const milestones = [
    { id: 'milestone-1', name: 'First Chapter Completed', achieved: true },
    { id: 'milestone-2', name: '1 Hour Spent Learning', achieved: true },
    { id: 'milestone-3', name: 'Completed All Lessons', achieved: false },
    // ... more milestones
  ];

  return (
    // <DashboardLayout> // Uncomment if you have a specific DashboardLayout component to wrap this
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
            {/* Add more tabs if needed, e.g., for Engagement, Milestones */}
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
                  <p>Last Activity: {userProgress.lastActivity ? new Date(userProgress.lastActivity).toLocaleString() : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Learning Engagement Card (Placeholder) */}
            <Card className="md:col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Learning Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                {/* TODO: Implement Engagement Chart (e.g., Daily Activity) using Recharts */}
                <p className="text-muted-foreground">Engagement chart and stats go here (e.g., streak, total time).</p>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Learning Streak: <Badge>{learningEngagement.streakCount} days</Badge></p>
                  <p>Total Time Spent: {learningEngagement.timeSpentTotal}</p>
                  <p>Avg Session Length: {learningEngagement.timeSpentAvgSession}</p>
                </div>
              </CardContent>
            </Card>

            {/* Milestones Card (Placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                {/* TODO: Display user milestones/badges */}
                <div className="grid gap-2">
                  {milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center justify-between">
                      <span>{milestone.name}</span>
                      {milestone.achieved ? <Badge variant="default">Achieved</Badge> : <Badge variant="secondary">Not Achieved</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="lessons">
            {/* Lesson Interaction Section */}
            <Card>
              <CardHeader>
                <CardTitle>Lesson Details</CardTitle>
              </CardHeader>
              <CardContent>
                {/* TODO: Implement Lesson List with status and time spent using Accordion/Checkbox */}
                <Accordion type="single" collapsible className="w-full">
                  {lessonInteraction.map(lesson => (
                    <AccordionItem key={lesson.id} value={lesson.id}>
                      <AccordionTrigger>{lesson.title}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Status: <Badge>{lesson.status}</Badge></span>
                          <span>Time Spent: {lesson.timeSpent}</span>
                        </div>
                        {/* TODO: Add Checkbox for completion if needed here */}
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
    // </DashboardLayout> // Uncomment if you have a specific DashboardLayout component to wrap this
  );
}
