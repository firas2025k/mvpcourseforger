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

// Import icons
import {
  BarChart3,
  TrendingUp,
  Target,
  Trophy,
  Clock,
  BookOpen,
  CheckCircle,
  Star,
  Zap,
  Brain,
  Award,
  Activity,
  Calendar,
  Sparkles,
  PieChart,
  LineChart,
  Users,
  Flame
} from "lucide-react";

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
    { id: '1', name: 'First Chapter Completed', achieved: chaptersCompleted > 0, icon: BookOpen },
    { id: '2', name: 'First Course Completed', achieved: barChartData.some(c => c.progress === 100), icon: Trophy },
    { id: '3', name: 'Completed All Lessons', achieved: totalLessons > 0 && lessonsCompleted === totalLessons, icon: Star },
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12">
      {/* Enhanced Header */}
      <header className="px-4 md:px-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-3xl blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Track your learning progress and engagement
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 md:px-0 grid gap-8">
        {/* Enhanced Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-2xl blur-xl"></div>
            <TabsList className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <PieChart className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="lessons"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Lessons
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="grid gap-8">
            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <CourseProgressPieChart data={pieChartData} />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <LessonsCompletionBarChart data={barChartData} />
                </div>
              </div>
            </div>

            {/* Summary Cards Section */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {/* Progress Overview Card */}
              <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="relative">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-20 animate-pulse"></div>
                    </div>
                    Progress Overview
                  </CardTitle>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {overallPercentage}%
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Completion</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{overallPercentage}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={overallPercentage} className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-sm transition-all duration-500"
                        style={{ width: `${overallPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <Separator className="bg-slate-200/50 dark:bg-slate-700/50" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{chaptersCompleted}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Chapters</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{lessonsCompleted}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Lessons</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Engagement Card */}
              <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="relative">
                      <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-20 animate-pulse"></div>
                    </div>
                    Learning Engagement
                  </CardTitle>
                  <Flame className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Engagement stats are coming soon
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        Learning Streak
                      </span>
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                        {learningEngagement.streakCount} days
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Total Time
                      </span>
                      <span className="font-medium">{learningEngagement.timeSpentTotal}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-500" />
                        Avg Session
                      </span>
                      <span className="font-medium">{learningEngagement.timeSpentAvgSession}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones Card */}
              <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="relative">
                      <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-20 animate-pulse"></div>
                    </div>
                    Milestones
                  </CardTitle>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-3">
                    {milestones.map(milestone => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-slate-600/50">
                        <div className="flex items-center gap-3">
                          <milestone.icon className={`h-4 w-4 ${milestone.achieved ? 'text-green-500' : 'text-slate-400'}`} />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{milestone.name}</span>
                        </div>
                        {milestone.achieved ? (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Achieved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-slate-600 dark:text-slate-400">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lessons">
            <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-400/5"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  Lesson Details
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {lessonsCompleted} of {totalLessons} completed
                </div>
              </CardHeader>
              <CardContent className="relative">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {allLessons.map(lesson => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    return (
                      <AccordionItem 
                        key={lesson.id} 
                        value={lesson.id}
                        className="border border-slate-200/50 dark:border-slate-700/50 rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors duration-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                            <span className="font-medium">{lesson.title}</span>
                            {isCompleted && <Star className="h-4 w-4 text-yellow-500" />}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200/50 dark:border-slate-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                              <Badge className={isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}>
                                {isCompleted ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Not started
                                  </>
                                )}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Clock className="h-4 w-4" />
                              <span>Time Spent: N/A</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

