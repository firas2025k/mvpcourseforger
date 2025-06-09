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
  AlertTriangle // For no courses message
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
import CourseCard, { CourseForCard } from '@/components/dashboard/CourseCard';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch user's courses
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, prompt') // Select fields needed for CourseForCard
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (coursesError) {
    console.error('Error fetching courses:', coursesError);
    // Handle error appropriately, maybe show an error message
  }

  const courses: CourseForCard[] = coursesData || [];

  // Placeholder data for stats - can be refined later
  const totalCourses = courses.length;
  const averageProgress = 0; // TODO: Calculate this based on actual progress
  const activeCourses = courses.length; // Assuming all fetched are active for now
  const userPlan = {
    name: "Free Plan", // TODO: Fetch actual user plan
    courseLimit: 1, // TODO: Fetch actual limit
    coursesCreated: courses.length, 
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
              across all active courses (placeholder)
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
               {userPlan.coursesCreated}/{userPlan.courseLimit} courses created (placeholder)
            </p>
            {/* <Button variant="outline" size="sm" className="mt-2">Upgrade</Button> */}
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
          <Button asChild variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/dashboard/courses/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
            </Link>
          </Button>
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
              {/* This button is only visible when no courses exist */}
              <Button asChild size="lg" className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/dashboard/courses/new">
                  <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
