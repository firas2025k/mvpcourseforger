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

interface Lesson {
  id: string;
  title: string;
  content: string;
  lesson_number: number;
  quizzes: Quiz[];
}

interface Quiz {
  id: string;
  question: string;
  choices: string[];
  correct_answer: string;
}

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  lessons: Lesson[];
}

interface CourseDetail extends Course {
  chapters: Chapter[];
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch active subscription and plan details
  let activeSubscription: any = null;
  let planName = "Free Plan"; // Default plan name
  let courseLimit = 1; // Default course limit, especially for Free Plan or if profile fetch fails
  let hasActivePaidSubscription = false;

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select(`
      is_active,
      stripe_subscription_id,
      plans (
        name,
        course_limit
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle(); // Use maybeSingle as user might not have an active subscription

  if (subscriptionError) {
    console.error('Error fetching subscription:', subscriptionError.message);
    // Proceed with default plan details, or handle error as preferred
  }

  if (subscriptionData && subscriptionData.plans) { // User has an active paid subscription
    activeSubscription = subscriptionData;
    planName = subscriptionData.plans.name;
    courseLimit = subscriptionData.plans.course_limit;
    if (subscriptionData.stripe_subscription_id) {
      hasActivePaidSubscription = true;
    }
  } else { // User does NOT have an active paid subscription, so they are on Free tier
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('course_limit')
      .eq('id', user.id)
      .single();

    if (profileData && !profileError) {
      // Profile exists, use its course_limit.
      courseLimit = profileData.course_limit;
      // Safeguard: If it's the Free Plan and profile somehow has limit < 1, set to 1.
      // This handles misconfiguration in new user profile creation for the free tier.
      if (planName === "Free Plan" && courseLimit < 1) {
        console.warn(`User ${user.id} on Free Plan has profile course_limit of ${profileData.course_limit}. Overriding to 1. Please check 'handle_new_user' SQL trigger to set a proper default (e.g., 1).`);
        courseLimit = 1;
      }
    } else if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 'single' row not found (expected for new users if trigger hasn't run or profile deleted)
      console.error(`Error fetching profile for user ${user.id}:`, profileError.message);
      // courseLimit remains the initial default (1) if profile fetch fails for other reasons.
    }
    // If profileData is null (no profile row, e.g. PGRST116) and no other error, 
    // courseLimit remains the initial default (1), which is suitable for a new Free Plan user.
  }

  // 1. Fetch basic course data for the user
  const { data: rawCoursesData, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, prompt')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (coursesError) {
    console.error('Error fetching courses:', coursesError.message); 
    // courses will be an empty array if rawCoursesData is null due to error
  }
  
  const userCourses = rawCoursesData || [];
  let courses: CourseForCard[] = [];
  const totalLessonsByCourse: Record<string, number> = {};
  const completedLessonsByCourse: Record<string, number> = {};

  if (userCourses.length > 0) {
    const courseIds = userCourses.map(c => c.id);

    // 2. Fetch all lessons for these courses to count total lessons per course
    const { data: lessonsInCoursesData, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, chapters!inner(course_id)') // We need course_id to group lessons
      .in('chapters.course_id', courseIds);

    if (lessonsError) {
      console.error('Error fetching lessons for courses:', lessonsError.message);
    } else if (lessonsInCoursesData) {
      for (const lesson of lessonsInCoursesData) {
        const courseId = lesson.chapters?.course_id;
        if (courseId) {
          totalLessonsByCourse[courseId] = (totalLessonsByCourse[courseId] || 0) + 1;
        }
      }
    }

    // 3. Fetch user's completed lessons for these courses
    const { data: userProgressData, error: progressError } = await supabase
      .from('progress')
      .select('lesson_id, lessons!inner(id, chapters!inner(course_id))')
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .in('lessons.chapters.course_id', courseIds); // Only fetch progress for the user's courses

    if (progressError) {
      console.error('Error fetching user progress:', progressError.message);
    } else if (userProgressData) {
      for (const progressItem of userProgressData) {
        const courseId = progressItem.lessons?.chapters?.course_id;
        if (courseId) {
          completedLessonsByCourse[courseId] = (completedLessonsByCourse[courseId] || 0) + 1;
        }
      }
    }
    
    // 4. Combine data to form CourseForCard objects
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
    // No courses found for the user, courses array will remain empty
    console.log('No courses found for user:', user.id);
  }

  const totalCourses = courses.length;
  const coursesWithLessons = courses.filter(c => c.totalLessons > 0);
  const averageProgress = coursesWithLessons.length > 0 
    ? Math.round(coursesWithLessons.reduce((sum, course) => sum + course.progress, 0) / coursesWithLessons.length)
    : 0;
  const activeCourses = courses.length; // Assuming all fetched are active for now
  const userPlan = {
    name: planName,
    coursesCreated: totalCourses,
    courseLimit: courseLimit,
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
              {userPlan.name !== 'Free Plan' ? 
                `${userPlan.courseLimit} course${userPlan.courseLimit === 1 ? '' : 's'} limit` :
                `${userPlan.coursesCreated}/${userPlan.courseLimit} courses created` // Or a different message for free plan
              }
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
          {totalCourses < userPlan.courseLimit ? (
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
              <CourseCard key={course.id} course={course}>
                <div className="flex items-center justify-between">
                </div>
              </CourseCard>
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
              {/* This button is only visible when no courses exist */}
              {userPlan.courseLimit > 0 ? (
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
