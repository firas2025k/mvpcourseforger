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
      <header className="px-4 md:px-0">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {searchQuery
            ? `Showing results for "${searchQuery}"`
            : "Manage your courses and track progress."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-6">
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              courses you have created
            </p>
          </CardContent>
          <div className="p-4 pt-0">
            <Link
              href="/dashboard/courses/new"
              className="text-sm font-medium text-purple-600 hover:underline flex items-center"
            >
              Create New Course <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Progress
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Progress
                value={averageProgress}
                className="w-full h-2 bg-gray-200"
                indicatorClassName="bg-purple-600"
              />
              <span className="text-sm font-medium">{averageProgress}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              across all courses with lessons
            </p>
          </CardContent>
          <div className="p-4 pt-0">
            <Link
              href="/dashboard/analytics"
              className="text-sm font-medium text-purple-600 hover:underline flex items-center"
            >
              View Analytics <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </Card>
        <UserPlanCard
          userPlan={userPlanForCard}
          hasActivePaidSubscription={hasActivePaidSubscription}
          ManageSubscriptionButton={ManageSubscriptionButton}
        />
      </section>

      <section className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center">
            <LayoutGrid className="mr-3 h-6 w-6 text-purple-600" /> My Courses
          </h2>
          {userPlanForCard.coursesCreated < userPlanForCard.courseLimit ? (
            <Button
              asChild
              variant="default"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Link href="/dashboard/courses/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="default"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" /> Upgrade to Create More
              </Link>
            </Button>
          )}
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isFreePlan={isFreePlan}
              />
            ))}
          </div>
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold">
                {searchQuery ? "No Courses Found" : "No Courses Yet!"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `Your search for "${searchQuery}" did not match any courses.`
                  : "It looks like you haven't created any courses. Get started by creating your first one."}
              </p>
              {!searchQuery &&
                (userPlanForCard.coursesCreated <
                userPlanForCard.courseLimit ? (
                  <Button
                    asChild
                    size="lg"
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Link href="/dashboard/courses/new">
                      <PlusCircle className="mr-2 h-5 w-5" /> Create Your First
                      Course
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Link href="/pricing">
                      <Crown className="mr-2 h-5 w-5" /> Upgrade to Create
                      Courses
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
