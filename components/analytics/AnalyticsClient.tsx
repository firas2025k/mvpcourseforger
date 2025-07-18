"use client";

// Import UI components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
  Flame,
  Sliders,
  Mic,
  Presentation,
  MessageSquare,
} from "lucide-react";

// Import Chart Components
import { CourseProgressPieChart } from "@/components/analytics/CourseProgressPieChart";
import { LessonsCompletionBarChart } from "@/components/analytics/LessonsCompletionBarChart";
import { PresentationProgressPieChart } from "@/components/analytics/PresentationProgressPieChart";
import { SlidesCompletionBarChart } from "@/components/analytics/SlidesCompletionBarChart";
import { VoiceAgentSessionChart } from "@/components/analytics/VoiceAgentSessionChart";
import { CompanionUsageChart } from "@/components/analytics/CompanionUsageChart";
import { AnalyticsData } from "@/app/dashboard/analytics/page";


interface AnalyticsClientProps {
  data: AnalyticsData;
}

export default function AnalyticsClient({ data }: AnalyticsClientProps) {
  const {
    lessonsCompleted,
    totalLessons,
    lessonsPending,
    slidesViewed,
    totalSlides,
    slidesPending,
    totalSessions,
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
  } = data;

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12">
      {/* Enhanced Header */}
      <header className="px-4 md:px-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-3xl blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 via-purple-900 to-pink-900 dark:from-slate-100 dark:via-blue-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Track your learning progress across courses, presentations, and
                voice agents
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 md:px-0 grid gap-8">
        {/* Enhanced Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 rounded-2xl blur-xl"></div>
            <TabsList className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                <PieChart className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="presentations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Sliders className="h-4 w-4 mr-2" />
                Presentations
              </TabsTrigger>
              <TabsTrigger
                value="voice-agents"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice Agents
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="grid gap-8">
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {/* Courses Summary */}
              <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Courses
                  </CardTitle>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    {overallPercentage}%
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {lessonsCompleted}/{totalLessons} lessons
                      </span>
                    </div>
                    <Progress value={overallPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Presentations Summary */}
              <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Presentations
                  </CardTitle>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {presentationOverallPercentage}%
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {slidesViewed}/{totalSlides} slides
                      </span>
                    </div>
                    <Progress
                      value={presentationOverallPercentage}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Voice Agents Summary */}
              <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mic className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Voice Agents
                  </CardTitle>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {totalSessions}
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Sessions</span>
                      <span>{userCompanions.length} companions</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Recent activity across all voice agents
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overview Charts */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              <CourseProgressPieChart data={coursesPieChartData} />
              <PresentationProgressPieChart data={presentationsPieChartData} />
              <CompanionUsageChart data={companionUsageData} />
            </div>
          </TabsContent>

          <TabsContent value="courses" className="grid gap-8">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <CourseProgressPieChart data={coursesPieChartData} />
              <LessonsCompletionBarChart data={coursesBarChartData} />
            </div>

            {/* Lesson Details */}
            <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  Lesson Details
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-2"
                >
                  {allLessons.slice(0, 10).map((lesson) => {
                    const isCompleted = completedProgress.some(
                      (p) => p.lesson_id === lesson.id
                    );
                    return (
                      <AccordionItem
                        key={lesson.id}
                        value={lesson.id}
                        className="border border-slate-200/50 dark:border-slate-700/50 rounded-lg"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-700/50">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isCompleted ? "bg-green-500" : "bg-slate-300"
                              }`}
                            ></div>
                            <span className="font-medium">{lesson.title}</span>
                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50">
                          <Badge
                            className={
                              isCompleted
                                ? "bg-green-500 text-white"
                                : "bg-slate-200 text-slate-700"
                            }
                          >
                            {isCompleted ? "Completed" : "Not started"}
                          </Badge>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presentations" className="grid gap-8">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <PresentationProgressPieChart data={presentationsPieChartData} />
              <SlidesCompletionBarChart data={presentationsBarChartData} />
            </div>

            {/* Presentation Details */}
            <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-pink-900 dark:from-purple-100 dark:to-pink-100 bg-clip-text text-transparent flex items-center gap-3">
                  <Sliders className="h-6 w-6 text-purple-600" />
                  Presentation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid gap-4">
                  {userPresentations.map((presentation) => {
                    const slidesInPresentation = allSlides.filter(
                      (s) => s.presentation_id === presentation.id
                    );
                    const viewedSlides = viewedPresentationProgress.filter(
                      (p) =>
                        slidesInPresentation.some((s) => s.id === p.slide_id)
                    ).length;
                    const progress =
                      slidesInPresentation.length > 0
                        ? Math.round(
                            (viewedSlides / slidesInPresentation.length) * 100
                          )
                        : 0;

                    return (
                      <div
                        key={presentation.id}
                        className="p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">
                            {presentation.title}
                          </h3>
                          <Badge
                            className={
                              progress === 100
                                ? "bg-purple-500 text-white"
                                : "bg-slate-200 text-slate-700"
                            }
                          >
                            {progress}%
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>
                              {viewedSlides}/{slidesInPresentation.length}{" "}
                              slides
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice-agents" className="grid gap-8">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <VoiceAgentSessionChart data={sessionChartData} />
              <CompanionUsageChart data={companionUsageData} />
            </div>

            {/* Voice Agent Details */}
            <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-900 to-red-900 dark:from-orange-100 dark:to-red-100 bg-clip-text text-transparent flex items-center gap-3">
                  <Mic className="h-6 w-6 text-orange-600" />
                  Voice Agent Details
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid gap-4">
                  {userCompanions.map((companion) => {
                    const sessions = companionUsageData.find(
                      (c) => c.companionName === companion.name
                    )?.sessions || 0;
                    return (
                      <div
                        key={companion.id}
                        className="p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{companion.name}</h3>
                          <Badge className="bg-orange-500 text-white">
                            {sessions} sessions
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Subject: {companion.subject || "General"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

