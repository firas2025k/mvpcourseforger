import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

import {
  BookOpen,
  BarChart3,
  Crown,
  PlusCircle,
  LayoutGrid,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Star,
  Trophy,
  Zap,
  GraduationCap,
  Brain,
  Lightbulb,
  Rocket,
  Coins,
  Calculator,
  ShoppingCart,
  Mic,
  Volume2,
  MessageSquare,
  Headphones,
  Award,
  Clock,
  Users,
  Play,
  Pause,
  BarChart,
  TrendingDown,
  Activity,
  Calendar,
  CheckCircle,
  Circle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CourseCard, {
  type CourseForCard,
} from "@/components/dashboard/CourseCard";
import UserPlanCard from "@/components/dashboard/UserPlanCard";
import ManageSubscriptionButton from "@/components/dashboard/ManageSubscriptionButton";
import CreditBalance from "@/components/dashboard/CreditBalance";

interface Course {
  id: string;
  title: string;
  prompt: string | null;
}

interface Plan {
  id: string;
  name: string;
  course_limit: number;
  price_cents: number;
  stripe_price_id: string | null;
  description: string | null;
  features: string[] | null;
  credit_amount: number | null;
}

interface SubscriptionWithPlan {
  is_active: boolean;
  stripe_subscription_id: string | null;
  plan_id: string;
  plans: Plan | null;
}

// Credit cost calculation functions
function calculateCourseCreditCost(
  chapters: number,
  lessonsPerChapter: number
): number {
  const lessonCost = chapters * lessonsPerChapter;
  const chapterCost = chapters;
  const totalCost = lessonCost + chapterCost;
  return Math.max(totalCost, 3);
}

function calculatePresentationCreditCost(slideCount: number): number {
  if (slideCount <= 5) return 1;
  if (slideCount <= 15) return 2;
  if (slideCount <= 30) return 3;
  return 4;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
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

  const searchQuery = searchParams?.q || "";

  const { data: allPlans, error: plansError } = await supabase
    .from("plans")
    .select(
      "id, name, course_limit, price_cents, stripe_price_id, description, features, credit_amount"
    );

  if (plansError) console.error("Error fetching plans:", plansError.message);
  const plans: Plan[] = (allPlans || []).map((plan) => ({
    ...plan,
    stripe_price_id: plan.stripe_price_id || null,
    credit_amount: plan.credit_amount || null,
  }));
  const freePlan = plans.find((p) => p.name === "Free");

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("course_limit, courses_created_count, credits")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error(`Error fetching profile:`, profileError.message);
  }

  const coursesCreatedCount = profileData?.courses_created_count ?? 0;
  const userCredits = profileData?.credits ?? 0;
  let courseLimit = profileData?.course_limit ?? (freePlan?.course_limit || 1);
  let planName = "Free Plan";
  let hasActivePaidSubscription = false;

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select(
      `is_active, stripe_subscription_id, plan_id, plans (name, course_limit, credit_amount)`
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const currentSubscription = subscriptionData as SubscriptionWithPlan | null;

  if (subscriptionError && subscriptionError.code !== "PGRST116") {
    console.warn("Error fetching subscription:", subscriptionError.message);
  }

  if (currentSubscription && currentSubscription.is_active) {
    if (currentSubscription.plans) {
      planName = currentSubscription.plans.name;
      courseLimit = currentSubscription.plans.course_limit;
    }
    hasActivePaidSubscription = currentSubscription.plan_id !== freePlan?.id;
  } else {
    planName = freePlan?.name || "Free Plan";
    courseLimit = freePlan?.course_limit || 1;
    hasActivePaidSubscription = false;
  }

  if (
    planName === (freePlan?.name || "Free Plan") &&
    courseLimit < (freePlan?.course_limit || 1)
  ) {
    courseLimit = freePlan?.course_limit || 1;
  }

  let courseQuery = supabase
    .from("courses")
    .select("id, title, prompt")
    .eq("user_id", user.id);

  if (searchQuery) {
    courseQuery = courseQuery.ilike("title", `%${searchQuery}%`);
  }

  const { data: rawCourses, error: coursesError } = await courseQuery.order(
    "created_at",
    { ascending: false }
  );

  const userCourses = (rawCourses as Course[] | null) || [];
  if (coursesError)
    console.error("Error fetching courses:", coursesError.message);

  let courses: CourseForCard[] = [];
  const totalLessonsByCourse: Record<string, number> = {};
  const completedLessonsByCourse: Record<string, number> = {};

  if (userCourses.length > 0) {
    const courseIds = userCourses.map((c) => c.id);

    const { data: lessonsData, error: lessonsError } = await supabase
      .from("lessons")
      .select("id, chapters(course_id)")
      .in("chapters.course_id", courseIds);

    if (lessonsError) {
      console.error("Error fetching lessons:", lessonsError.message);
    } else if (lessonsData) {
      for (const lesson of lessonsData) {
        if (lesson.chapters?.course_id) {
          const courseId = lesson.chapters.course_id;
          totalLessonsByCourse[courseId] =
            (totalLessonsByCourse[courseId] || 0) + 1;
        }
      }
    }

    const { data: progressData, error: progressError } = await supabase
      .from("progress")
      .select("lessons(id, chapters(course_id))")
      .eq("user_id", user.id)
      .eq("is_completed", true)
      .in("lessons.chapters.course_id", courseIds);

    if (progressError) {
      console.error("Error fetching progress:", progressError.message);
    } else if (progressData) {
      for (const progressItem of progressData) {
        if (progressItem.lessons?.chapters?.course_id) {
          const courseId = progressItem.lessons.chapters.course_id;
          completedLessonsByCourse[courseId] =
            (completedLessonsByCourse[courseId] || 0) + 1;
        }
      }
    }

    courses = userCourses.map((course) => {
      const totalLessons = totalLessonsByCourse[course.id] || 0;
      const completedLessons = completedLessonsByCourse[course.id] || 0;
      return {
        id: course.id,
        title: course.title,
        prompt: course.prompt,
        totalLessons,
        completedLessons,
        progress:
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
      };
    });
  }

  const totalCourses = coursesCreatedCount;
  const coursesWithLessons = courses.filter((c) => c.totalLessons > 0);
  const averageProgress =
    coursesWithLessons.length > 0
      ? Math.round(
          coursesWithLessons.reduce((sum, course) => sum + course.progress, 0) /
            coursesWithLessons.length
        )
      : 0;

  const userPlanForCard = {
    name: planName,
    courseLimit: courseLimit,
    coursesCreated: coursesCreatedCount,
    coursesRemaining: Math.max(0, courseLimit - coursesCreatedCount),
    credits: userCredits,
  };
  const isFreePlan = planName === (freePlan?.name || "Free Plan");

  // Calculate credit costs for different generation types
  const basicCourseCost = calculateCourseCreditCost(3, 2); // 3 chapters, 2 lessons each
  const basicPresentationCost = calculatePresentationCreditCost(10); // 10 slides

  // Credit status for UI decisions
  const hasInsufficientCreditsForCourse = userCredits < basicCourseCost;
  const hasInsufficientCreditsForPresentation =
    userCredits < basicPresentationCost;

  return (
    <div className="flex-1 w-full flex flex-col mr-2 ml-2 gap-8 py-8 md:py-12">
      {/* Enhanced Header */}
      <header className="px-8 mx-4 md:px-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-3xl blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6 m-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  {searchQuery ? (
                    <>
                      <Target className="h-4 w-4" />
                      Showing results for "{searchQuery}"
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Welcome back! Ready to learn?
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Credit Balance Display */}
            <div className="hidden md:block">
              <CreditBalance
                initialCredits={userCredits}
                showTopUpButton={true}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Live Voice Coach Feature Card */}
      <section className="px-4 md:px-6">
        <Card className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-500/20 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>

          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <Badge className="bg-white/20 text-white border-white/30 mb-2">
                      NEW FEATURE
                    </Badge>
                    <h2 className="text-3xl font-bold">Live Voice Coach</h2>
                  </div>
                </div>

                <p className="text-xl text-white/90 mb-6 max-w-2xl">
                  Practice speaking with our AI-powered voice coach. Get
                  real-time feedback on pronunciation, fluency, and confidence.
                  Perfect for presentations, interviews, and language learning.
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-white/80" />
                    <span className="text-white/80">Real-time feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-white/80" />
                    <span className="text-white/80">AI-powered analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-white/80" />
                    <span className="text-white/80">Progress tracking</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Link href="/dashboard/voice/new">
                    <Button
                      size="lg"
                      className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Voice Session
                    </Button>
                  </Link>
                  <Link href="/dashboard/voice">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-black hover:bg-white/10 font-semibold px-6 py-3 rounded-xl backdrop-blur-sm"
                    >
                      View All Sessions
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-48 h-48 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Headphones className="h-16 w-16 text-white/80" />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-green-400 flex items-center justify-center animate-pulse">
                    <Mic className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Statistics Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-4 md:px-6">
        {/* Total Courses Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Total Courses
            </CardTitle>
            <div className="relative">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {totalCourses}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              courses created
            </p>
            <div className="flex items-center gap-2">
              <Progress
                value={(totalCourses / courseLimit) * 100}
                className="flex-1 h-2"
              />
              <span className="text-xs text-slate-500">
                {totalCourses}/{courseLimit}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Average Progress Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Learning Progress
            </CardTitle>
            <div className="relative">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1">
                <Progress
                  value={averageProgress}
                  className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-full opacity-20 blur-sm transition-all duration-500"
                  style={{ width: `${averageProgress}%` }}
                ></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {averageProgress}%
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              average completion rate
            </p>
          </CardContent>
        </Card>

        {/* Credit Balance Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Credit Balance
            </CardTitle>
            <div className="relative">
              <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
              {userCredits}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              credits available
            </p>
            <Link
              href="/dashboard/credit/purchase"
              className="inline-flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-200 group/link"
            >
              Top Up Credits
              <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-200" />
            </Link>
          </CardContent>
        </Card>

        {/* Enhanced User Plan Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl pointer-events-none"></div>
          <UserPlanCard
            userPlan={userPlanForCard}
            hasActivePaidSubscription={hasActivePaidSubscription}
            ManageSubscriptionButton={ManageSubscriptionButton}
          />
        </div>
      </section>

      {/* Quick Actions Panel */}
      <section className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <Badge
            variant="outline"
            className="text-slate-600 dark:text-slate-400"
          >
            Get started quickly
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Course */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Create Course</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Generate AI-powered courses
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Create comprehensive courses with AI assistance. Perfect for
                structured learning paths.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calculator className="h-4 w-4" />
                  <span>{basicCourseCost} credits</span>
                </div>
                <Link href="/dashboard/courses/new">
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={hasInsufficientCreditsForCourse}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Voice Session */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Voice Session</h3>
                    <Badge className="bg-orange-500 text-white text-xs">
                      NEW
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Practice with AI voice coach
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Improve your speaking skills with real-time AI feedback and
                personalized coaching.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span>2 credits/session</span>
                </div>
                <Link href="/dashboard/voice/new">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Mic className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Create Presentation */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Presentation</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Create slide presentations
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Generate professional presentations with AI-powered content and
                design.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calculator className="h-4 w-4" />
                  <span>{basicPresentationCost} credits</span>
                </div>
                <Link href="/dashboard/presentations/new">
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={hasInsufficientCreditsForPresentation}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity & Courses Section */}
      <section className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
            {searchQuery ? "Search Results" : "Your Courses"}
          </h2>
          <div className="flex items-center gap-4">
            {!searchQuery && (
              <Badge
                variant="outline"
                className="text-slate-600 dark:text-slate-400"
              >
                {courses.length} total
              </Badge>
            )}
            <Link href="/dashboard/courses/new">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Course
              </Button>
            </Link>
          </div>
        </div>

        {courses.length === 0 ? (
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {searchQuery ? "No courses found" : "No courses yet"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-8">
                {searchQuery
                  ? `No courses match "${searchQuery}". Try a different search term.`
                  : "Start your learning journey by creating your first course with AI assistance."}
              </p>
              {!searchQuery && (
                <Link href="/dashboard/courses/new">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create Your First Course
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Credit Cost Information */}
      <section className="px-4 md:px-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-blue-600" />
              Generation Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold">Course Generation</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {basicCourseCost} credits for basic course
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold">Presentation</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {basicPresentationCost} credits for 10 slides
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                <Mic className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-semibold">Voice Session</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    2 credits per session
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
