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
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CourseCard, {
  type CourseForCard,
} from "@/components/dashboard/CourseCard";
import UserPlanCard from "@/components/dashboard/UserPlanCard";
import ManageSubscriptionButton from "@/components/dashboard/ManageSubscriptionButton";

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
}

interface SubscriptionWithPlan {
  is_active: boolean;
  stripe_subscription_id: string | null;
  plan_id: string;
  plans: Plan | null;
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
      "id, name, course_limit, price_cents, stripe_price_id, description, features"
    );

  if (plansError) console.error("Error fetching plans:", plansError.message);
  const plans: Plan[] = (allPlans || []).map((plan) => ({
    ...plan,
    stripe_price_id: plan.stripe_price_id || null,
  }));
  const freePlan = plans.find((p) => p.name === "Free");

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("course_limit, courses_created_count")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error(`Error fetching profile:`, profileError.message);
  }

  const coursesCreatedCount = profileData?.courses_created_count ?? 0;
  let courseLimit = profileData?.course_limit ?? (freePlan?.course_limit || 1);
  let planName = "Free Plan";
  let hasActivePaidSubscription = false;

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select(
      `is_active, stripe_subscription_id, plan_id, plans (name, course_limit)`
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
  };
  const isFreePlan = planName === (freePlan?.name || "Free Plan");

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12">
      {/* Enhanced Header */}
      <header className="px-4 md:px-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-3xl blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
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
                    Manage your courses and track progress
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Statistics Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-6">
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
              courses you have created
            </p>
            <Link
              href="/dashboard/courses/new"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 group/link"
            >
              Create New Course 
              <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-200" />
            </Link>
          </CardContent>
        </Card>

        {/* Average Progress Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Average Progress
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
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              across all courses with lessons
            </p>
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200 group/link"
            >
              View Analytics 
              <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-200" />
            </Link>
          </CardContent>
        </Card>

        {/* Enhanced User Plan Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl"></div>
          <UserPlanCard
            userPlan={userPlanForCard}
            hasActivePaidSubscription={hasActivePaidSubscription}
            ManageSubscriptionButton={ManageSubscriptionButton}
          />
        </div>
      </section>

      {/* Enhanced Courses Section */}
      <section className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 dark:from-slate-100 dark:to-purple-100 bg-clip-text text-transparent">
                My Courses
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Continue your learning journey
              </p>
            </div>
          </div>
          
          {userPlanForCard.coursesCreated < userPlanForCard.courseLimit ? (
            <Button
              asChild
              variant="default"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <Link href="/dashboard/courses/new" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                Create New Course
                <Sparkles className="h-3 w-3 text-yellow-300" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="default"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <Link href="/pricing" className="flex items-center gap-2">
                <Crown className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                Upgrade to Create More
                <Zap className="h-3 w-3 text-yellow-300" />
              </Link>
            </Button>
          )}
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isFreePlan={isFreePlan}
              />
            ))}
          </div>
        ) : (
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-400/5"></div>
            <CardContent className="relative flex flex-col items-center justify-center gap-6 p-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-20"></div>
                <AlertTriangle className="relative h-20 w-20 text-slate-400 dark:text-slate-500" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-blue-700 dark:from-slate-300 dark:to-blue-300 bg-clip-text text-transparent">
                  {searchQuery ? "No Courses Found" : "Ready to Start Learning?"}
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
                  {searchQuery
                    ? `Your search for "${searchQuery}" did not match any courses.`
                    : "Create your first course and begin an amazing learning journey!"}
                </p>
              </div>
              
              {!searchQuery &&
                (userPlanForCard.coursesCreated <
                userPlanForCard.courseLimit ? (
                  <Button
                    asChild
                    size="lg"
                    className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group px-8 py-3"
                  >
                    <Link href="/dashboard/courses/new" className="flex items-center gap-3">
                      <Rocket className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      Create Your First Course
                      <Sparkles className="h-4 w-4 text-yellow-300" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group px-8 py-3"
                  >
                    <Link href="/pricing" className="flex items-center gap-3">
                      <Crown className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      Upgrade to Create Courses
                      <Star className="h-4 w-4 text-yellow-300" />
                    </Link>
                  </Button>
                ))}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

