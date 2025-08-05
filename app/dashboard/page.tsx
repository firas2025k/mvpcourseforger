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
  UserPlus,
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
import JoinCourseDialog from "@/components/dashboard/JoinCourseDialog";

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

  // Fetch user's own courses
  let ownCourseQuery = supabase
    .from("courses")
    .select("id, title, prompt")
    .eq("user_id", user.id);

  if (searchQuery) {
    ownCourseQuery = ownCourseQuery.ilike("title", `%${searchQuery}%`);
  }

  const { data: rawOwnCourses, error: ownCoursesError } =
    await ownCourseQuery.order("created_at", { ascending: false });

  // Fetch enrolled courses (courses shared by others)
  let enrolledCourseQuery = supabase
    .from("enrollments")
    .select(
      `
      courses (
        id,
        title,
        prompt,
        user_id
      )
    `
    )
    .eq("user_id", user.id)
    .neq("courses.user_id", user.id); // Exclude own courses

  const { data: rawEnrolledCourses, error: enrolledCoursesError } =
    await enrolledCourseQuery;

  const userOwnCourses = (rawOwnCourses as Course[] | null) || [];
  const userEnrolledCourses = (rawEnrolledCourses || [])
    .map((enrollment) => enrollment.courses)
    .filter((course) => course !== null) as Course[];

  // Combine all courses
  const allUserCourses = [...userOwnCourses, ...userEnrolledCourses];

  if (ownCoursesError)
    console.error("Error fetching own courses:", ownCoursesError.message);
  if (enrolledCoursesError)
    console.error(
      "Error fetching enrolled courses:",
      enrolledCoursesError.message
    );

  let courses: CourseForCard[] = [];
  const totalLessonsByCourse: Record<string, number> = {};
  const completedLessonsByCourse: Record<string, number> = {};

  if (allUserCourses.length > 0) {
    const courseIds = allUserCourses.map((c) => c.id);

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

    courses = allUserCourses.map((course) => {
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

          {/* Join Course */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Join Course</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Join courses shared by others
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Enter an access code to join a course that someone has shared
                with you.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <UserPlus className="h-4 w-4" />
                  <span>Free to join</span>
                </div>
                <JoinCourseDialog>
                  <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                </JoinCourseDialog>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for third action */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">View Analytics</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track your learning progress
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Get insights into your learning journey and course completion
                rates.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Activity className="h-4 w-4" />
                  <span>Free feature</span>
                </div>
                <Link href="/dashboard/analytics">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
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
              {courses.length}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              courses available
            </p>
            <div className="flex items-center gap-2">
              <Progress
                value={(totalCourses / courseLimit) * 100}
                className="flex-1 h-2"
              />
              <span className="text-xs text-slate-500">
                {totalCourses}/{courseLimit} created
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

      {/* Recent Activity & Courses Section */}
      <section className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
            My Courses
          </h2>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="text-slate-600 dark:text-slate-400"
            >
              {courses.length} total
            </Badge>
            <Link href="/dashboard/courses">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {courses.length === 0 ? (
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-6">
                <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                No courses yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                Start your learning journey by creating your first course or
                joining one shared by others.
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard/courses/new">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </Link>
                <JoinCourseDialog>
                  <Button
                    variant="outline"
                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Course
                  </Button>
                </JoinCourseDialog>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => {
              // Check if this course is owned by the current user
              const isOwner = userOwnCourses.some(
                (ownCourse) => ownCourse.id === course.id
              );
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFreePlan={isFreePlan}
                  isOwner={isOwner}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
