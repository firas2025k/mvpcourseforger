import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

import {
  BookOpen,
  PlusCircle,
  TrendingUp,
  Trophy,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BarChart3,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CourseCard, {
  type CourseForCard,
} from "@/components/dashboard/CourseCard";
import CoursesSearchFilter from "@/components/dashboard/courses/CoursesSearchFilter";

interface Course {
  id: string;
  title: string;
  prompt: string | null;
  difficulty: string | null;
  is_published: boolean;
  is_archived: boolean;
  created_at: string;
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

export default async function CoursesPage({
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
  const difficultyFilter = searchParams?.difficulty || "";
  const statusFilter = searchParams?.status || "";
  const sortBy = searchParams?.sort || "created_at";

  // Get user plan information
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
    .select("course_limit, courses_created_count")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error(`Error fetching profile:`, profileError.message);
  }

  const coursesCreatedCount = profileData?.courses_created_count ?? 0;
  let courseLimit = profileData?.course_limit ?? (freePlan?.course_limit || 1);
  let planName = "Free Plan";
  let isFreePlan = true;

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
    isFreePlan = currentSubscription.plan_id === freePlan?.id;
  } else {
    planName = freePlan?.name || "Free Plan";
    courseLimit = freePlan?.course_limit || 1;
    isFreePlan = true;
  }

  // Build course query with filters
  let courseQuery = supabase
    .from("courses")
    .select(
      "id, title, prompt, difficulty, is_published, is_archived, created_at"
    )
    .eq("user_id", user.id)
    .eq("is_archived", false);

  if (searchQuery) {
    courseQuery = courseQuery.ilike("title", `%${searchQuery}%`);
  }

  if (difficultyFilter) {
    courseQuery = courseQuery.eq("difficulty", difficultyFilter);
  }

  if (statusFilter === "published") {
    courseQuery = courseQuery.eq("is_published", true);
  } else if (statusFilter === "draft") {
    courseQuery = courseQuery.eq("is_published", false);
  }

  // Apply sorting
  if (sortBy === "title") {
    courseQuery = courseQuery.order("title", { ascending: true });
  } else if (sortBy === "difficulty") {
    courseQuery = courseQuery.order("difficulty", { ascending: true });
  } else {
    courseQuery = courseQuery.order("created_at", { ascending: false });
  }

  const { data: rawCourses, error: coursesError } = await courseQuery;

  const userCourses = (rawCourses as Course[] | null) || [];
  if (coursesError)
    console.error("Error fetching courses:", coursesError.message);

  let courses: CourseForCard[] = [];
  const totalLessonsByCourse: Record<string, number> = {};
  const completedLessonsByCourse: Record<string, number> = {};

  if (userCourses.length > 0) {
    const courseIds = userCourses.map((c) => c.id);

    // Get lesson counts
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

    // Get progress data
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

  // Calculate statistics
  const totalCourses = courses.length;
  const completedCourses = courses.filter((c) => c.progress === 100).length;
  const inProgressCourses = courses.filter(
    (c) => c.progress > 0 && c.progress < 100
  ).length;
  const notStartedCourses = courses.filter((c) => c.progress === 0).length;
  const averageProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce((sum, course) => sum + course.progress, 0) /
            courses.length
        )
      : 0;

  // Convert empty filters to "all" for the Client Component
  const clientDifficultyFilter = difficultyFilter || "all";
  const clientStatusFilter = statusFilter || "all";

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12">
      {/* Enhanced Header */}
      <header className="px-8 mx-4 md:px-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-3xl blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6 m-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  My Courses
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {totalCourses} courses • {coursesCreatedCount}/{courseLimit}{" "}
                  created
                </p>
              </div>
            </div>

            <Link href="/dashboard/courses/new">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-4 md:px-6">
        {/* Total Courses */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Total Courses
            </CardTitle>
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {totalCourses}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              courses available
            </p>
          </CardContent>
        </Card>

        {/* Completed Courses */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Completed
            </CardTitle>
            <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {completedCourses}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              courses finished
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              In Progress
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {inProgressCourses}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              courses started
            </p>
          </CardContent>
        </Card>

        {/* Average Progress */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Avg Progress
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {averageProgress}%
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              completion rate
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Search and Filters - Now using Client Component with proper values */}
      <section className="px-4 md:px-6">
        <CoursesSearchFilter
          initialSearchQuery={searchQuery}
          initialDifficultyFilter={clientDifficultyFilter}
          initialStatusFilter={clientStatusFilter}
          initialSortBy={sortBy}
        />
      </section>

      {/* Courses Grid */}
      <section className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "All Courses"}
          </h2>
          <Badge
            variant="outline"
            className="text-slate-600 dark:text-slate-400"
          >
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </Badge>
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
                  ? `No courses match your search criteria. Try adjusting your filters or search terms.`
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
              <CourseCard
                key={course.id}
                course={course}
                isFreePlan={isFreePlan}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      {courses.length > 0 && (
        <section className="px-4 md:px-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Ready to learn more?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Create a new course or continue with your existing ones.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="border-blue-200 dark:border-blue-800"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Link href="/dashboard/courses/new">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create New Course
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
