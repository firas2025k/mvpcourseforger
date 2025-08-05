// app/api/course/join-by-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function POST(request: NextRequest) {
  try {
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

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { access_code } = body;

    if (!access_code || typeof access_code !== "string") {
      return NextResponse.json(
        { error: "Access code is required" },
        { status: 400 }
      );
    }

    // Validate access code format (NEX-XXXXXX)
    const accessCodeRegex = /^NEX-[A-Z0-9]{6}$/;
    if (!accessCodeRegex.test(access_code)) {
      return NextResponse.json(
        { error: "Invalid access code format" },
        { status: 400 }
      );
    }

    // Find the course by access code
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, user_id, title, prompt, is_published")
      .eq("access_code", access_code)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Invalid access code" },
        { status: 404 }
      );
    }

    // Check if the course is published
    if (!course.is_published) {
      return NextResponse.json(
        { error: "Course is not available for sharing" },
        { status: 400 }
      );
    }

    // Check if user is trying to join their own course
    if (course.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot join your own course" },
        { status: 400 }
      );
    }

    // Check if user is already enrolled in this course
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .single();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "You are already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment record
    const { error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: course.id,
        enrolled_at: new Date().toISOString(),
        is_completed: false,
      });

    if (enrollmentError) {
      console.error("Error creating enrollment:", enrollmentError);
      return NextResponse.json(
        { error: "Failed to join course" },
        { status: 500 }
      );
    }

    // Return success with course details
    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.prompt || "No description available",
      },
    });
  } catch (error) {
    console.error("Error in join-by-code API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
