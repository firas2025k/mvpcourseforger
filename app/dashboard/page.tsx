import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  BookOpen,
  BarChart3,
  Activity,
  Crown,
  PlusCircle,
  LayoutGrid, // For grid icon
  AlertTriangle, // For no courses message
  FileDown, // For PDF export icon
  Loader2 // For loading state
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CourseCard, { type CourseForCard } from '@/components/dashboard/CourseCard';
import ManageSubscriptionButton from '@/components/dashboard/ManageSubscriptionButton';

// --- Type Definitions ---
interface Course {
  id: string;
  title: string;
  prompt: string | null;
}

interface Plan {
  name: string;
  course_limit: number;
}

interface SubscriptionWithPlan {
  is_active: boolean;
  stripe_subscription_id: string | null;
  plans: Plan | null; // Supabase returns an object, not an array, for a to-one relationship
}

interface LessonForCount {
  id: string;
  chapters: { course_id: string } | null;
}

interface ProgressForCount {
  lesson_id: string;
  lessons: { id: string; chapters: { course_id: string } | null } | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // --- Refactored & Typed Data Fetching for Plan & Limits ---

  // 1. Fetch user profile first to get the universal courses_created_count and a baseline course_limit.
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('course_limit, courses_created_count')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error(`Error fetching profile for user ${user.id}:`, profileError.message);
  }

  const coursesCreatedCount = profileData?.courses_created_count ?? 0;
  let courseLimit = profileData?.course_limit ?? 1; // Default to 1 if no profile
  let planName = "Free Plan";
  let activeSubscription: SubscriptionWithPlan | null = null;
  let hasActivePaidSubscription = false;

  // 2. Fetch active subscription to override plan details if it exists.
  const { data, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select(`is_active, stripe_subscription_id, plans (name, course_limit)`)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  const subscriptionData = data as SubscriptionWithPlan | null;

  if (subscriptionError) {
    console.warn('Error fetching subscription:', subscriptionError.message);
  }

  if (subscriptionData?.plans) { // User has an active paid subscription
    activeSubscription = subscriptionData;
    planName = subscriptionData.plans.name;
    courseLimit = subscriptionData.plans.course_limit;
    hasActivePaidSubscription = !!subscriptionData.stripe_subscription_id;
  } else {
    // User is on the Free Plan, apply safeguard for the limit.
    if (courseLimit < 1) {
      console.warn(`User ${user.id} on Free Plan has profile course_limit of ${profileData?.course_limit}. Overriding to 1.`);
      courseLimit = 1;
    }
  }

  // 3. Fetch basic course data for the user
  const { data: rawCourses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, prompt')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const userCourses = (rawCourses as Course[] | null) || [];

  if (coursesError) {
    console.error('Error fetching courses:', coursesError.message); 
  }
  
  let courses: CourseForCard[] = [];
  const totalLessonsByCourse: Record<string, number> = {};
  const completedLessonsByCourse: Record<string, number> = {};

  if (userCourses.length > 0) {
    const courseIds = userCourses.map(c => c.id);

    // 4. Fetch all lessons for these courses to count total lessons per course
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, chapters!inner(course_id)')
      .in('chapters.course_id', courseIds);
    
    const lessonsInCoursesData = lessonsData as LessonForCount[] | null;

    if (lessonsError) {
      console.error('Error fetching lessons for courses:', lessonsError.message);
    } else if (lessonsInCoursesData) {
      for (const lesson of lessonsInCoursesData) {
        if (lesson.chapters?.course_id) {
          const courseId = lesson.chapters.course_id;
          totalLessonsByCourse[courseId] = (totalLessonsByCourse[courseId] || 0) + 1;
        }
      }
    }

    // 5. Fetch user's completed lessons for these courses
    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('lesson_id, lessons!inner(id, chapters!inner(course_id))')
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .in('lessons.chapters.course_id', courseIds);
    
    const userProgressData = progressData as ProgressForCount[] | null;

    if (progressError) {
      console.error('Error fetching user progress:', progressError.message);
    } else if (userProgressData) {
      for (const progressItem of userProgressData) {
        if (progressItem.lessons?.chapters?.course_id) {
          const courseId = progressItem.lessons.chapters.course_id;
          completedLessonsByCourse[courseId] = (completedLessonsByCourse[courseId] || 0) + 1;
        }
      }
    }
    
    // 6. Combine data to form CourseForCard objects
    courses = userCourses.map(course => {
      const totalLessons = totalLessonsByCourse[course.id] || 0;
      const completedLessons = completedLessonsByCourse[course.id] || 0;
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      return {
        id: course.id,
        title: course.title,
        prompt: course.prompt,
        totalLessons,
        completedLessons,
        progress,
      };
    });
  } else {
    console.log('No courses found for user:', user.id);
  }

  const totalCourses = coursesCreatedCount;
  const coursesWithLessons = courses.filter(c => c.totalLessons > 0);
  const averageProgress = coursesWithLessons.length > 0 
    ? Math.round(coursesWithLessons.reduce((sum, course) => sum + course.progress, 0) / coursesWithLessons.length)
    : 0;
  const activeCourses = courses.length; // Assuming all fetched are active for now

  const userPlan = {
    name: planName,
    courseLimit: courseLimit,
    coursesCreated: coursesCreatedCount,
    coursesRemaining: Math.max(0, courseLimit - coursesCreatedCount),
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12">
      {/* Header Section */}
      <header className="px-4 md:px-0">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your courses and track progress.
        </p>
      </header>

      {/* Statistic Cards Section */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
        <Card>
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
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Progress
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              across all courses with lessons
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Plan</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{userPlan.name}</div>
            <p className="text-xs text-muted-foreground">
              {`${userPlan.coursesRemaining} course${userPlan.coursesRemaining === 1 ? '' : 's'} remaining`}
            </p>
            {hasActivePaidSubscription && <ManageSubscriptionButton />}
          </CardContent>
        </Card>
      </section>

      {/* My Courses Section */}
      <section className="px-4 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center">
            <LayoutGrid className="mr-3 h-6 w-6 text-purple-600" /> My Courses
          </h2>
          {/* This button should always be visible */}
          {userPlan.coursesCreated < userPlan.courseLimit ? (
            <Button asChild variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/dashboard/courses/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
              </Link>
            </Button>
          ) : (
            <Button asChild variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" /> Upgrade to Create More
              </Link>
            </Button>
          )}
        </div>
        
        {courses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold">No Courses Yet!</h3>
              <p className="text-muted-foreground">
                It looks like you haven't created any courses. Get started by creating your first one.
              </p>
              {/* This button is only visible when no courses exist AND user has allowance */}
              {userPlan.coursesCreated < userPlan.courseLimit ? (
                <Button asChild size="lg" className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href="/dashboard/courses/new">
                    <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Course
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/pricing">
                    <Crown className="mr-2 h-5 w-5" /> Upgrade to Create Courses
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
