// app/api/course/[courseId]/generate-access-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

// Function to generate a unique access code
function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "NEX-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
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

    const { courseId } = params;

    // Verify that the user owns the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, user_id, title, access_code")
      .eq("id", courseId)
      .eq("user_id", user.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 }
      );
    }

    // If course already has an access code, return it
    if (course.access_code) {
      return NextResponse.json({
        success: true,
        access_code: course.access_code,
      });
    }

    // Generate a unique access code
    let accessCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      accessCode = generateAccessCode();

      // Check if the code is unique
      const { data: existingCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("access_code", accessCode)
        .single();

      if (!existingCourse) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Failed to generate unique access code. Please try again." },
        { status: 500 }
      );
    }

    // Update the course with the access code
    const { error: updateError } = await supabase
      .from("courses")
      .update({ access_code: accessCode! })
      .eq("id", courseId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating course with access code:", updateError);
      return NextResponse.json(
        { error: "Failed to generate access code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      access_code: accessCode!,
    });
  } catch (error) {
    console.error("Error in generate-access-code API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
