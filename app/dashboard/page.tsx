import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  BookOpen,
  BarChart3,
  Activity,
  Crown,
  PlusCircle,
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

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Placeholder data - in a real app, this would come from the database
  const totalCourses = 0;
  const averageProgress = 0;
  const activeCourses = 0;
  const userPlan = {
    name: "Free Plan",
    courseLimit: 1,
    coursesCreated: 0, 
  };
  const courses = []; // Empty array for no courses

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
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4 md:px-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Courses you're enrolled in or created.
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
              Across all your active courses.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCourses}</div>
            <p className="text-xs text-muted-foreground">
              Courses you are currently working on.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{userPlan.name}</div>
            <p className="text-xs text-muted-foreground">
              {userPlan.coursesCreated}/{userPlan.courseLimit} courses created.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-2">
            <Button size="sm" variant="default">
              Upgrade Plan
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* My Courses Section */}
      <section className="px-4 md:px-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">My Courses</h2>
          {courses.length > 0 && (
            <Link href="/dashboard/courses/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
              </Button>
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm py-16 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-primary/70 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Your Learning Journey Awaits
            </h3>
            <p className="mt-3 mb-8 max-w-md text-muted-foreground">
              You haven't created or enrolled in any courses yet. Take the first step to expand your knowledge.
            </p>
            <Link href="/dashboard/courses/new" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Course
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for course cards when they exist */}
            <p>Course cards would go here. (Not implemented in this update)</p>
          </div>
        )}
      </section>
    </div>
  );
}
