// app/api/presentation-details/[presentationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(
  request: NextRequest,
  { params }: { params: { presentationId: string } }
) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );

  try {
    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated." },
        { status: 401 }
      );
    }

    const { presentationId } = params;

    if (!presentationId) {
      return NextResponse.json(
        { error: "Presentation ID is required." },
        { status: 400 }
      );
    }

    // 2. Fetch presentation with slides
    const { data: presentation, error: presentationError } = await supabase
      .from("presentations")
      .select(
        `
        *,
        slides (
          id,
          title,
          content,
          type,
          layout,
          background_image_url,
          order_index,
          speaker_notes,
          animation_type,
          created_at,
          image_url,
          image_alt,
          image_keywords
        )
      `
      )
      .eq("id", presentationId)
      .eq("user_id", user.id)
      .single();

    if (presentationError) {
      console.error("Error fetching presentation:", presentationError.message);
      if (presentationError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Presentation not found." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch presentation." },
        { status: 500 }
      );
    }

    // 3. Sort slides by order_index
    if (presentation.slides) {
      presentation.slides.sort(
        (a: any, b: any) => a.order_index - b.order_index
      );
    }

    // 4. Get presentation progress for the user
    const { data: progress, error: progressError } = await supabase
      .from("presentation_progress")
      .select("slide_id, is_viewed, viewed_at")
      .eq("user_id", user.id)
      .in("slide_id", presentation.slides?.map((slide: any) => slide.id) || []);

    if (progressError) {
      console.warn(
        "Error fetching presentation progress:",
        progressError.message
      );
      // Don't fail the request for progress data
    }

    // 5. Add progress information to slides
    if (presentation.slides && progress) {
      presentation.slides = presentation.slides.map((slide: any) => {
        const slideProgress = progress.find(
          (p: any) => p.slide_id === slide.id
        );
        return {
          ...slide,
          is_viewed: slideProgress?.is_viewed || false,
          viewed_at: slideProgress?.viewed_at || null,
        };
      });
    }

    return NextResponse.json({ presentation }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/presentation-details:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to fetch presentation details: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { presentationId: string } }
) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );

  try {
    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated." },
        { status: 401 }
      );
    }

    const { presentationId } = params;

    if (!presentationId) {
      return NextResponse.json(
        { error: "Presentation ID is required." },
        { status: 400 }
      );
    }

    // 2. Verify presentation ownership
    const { data: presentation, error: presentationError } = await supabase
      .from("presentations")
      .select("id, user_id")
      .eq("id", presentationId)
      .eq("user_id", user.id)
      .single();

    if (presentationError) {
      console.error(
        "Error fetching presentation for deletion:",
        presentationError.message
      );
      if (presentationError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Presentation not found." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to verify presentation ownership." },
        { status: 500 }
      );
    }

    // 3. Delete presentation (slides will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from("presentations")
      .delete()
      .eq("id", presentationId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting presentation:", deleteError.message);
      return NextResponse.json(
        { error: "Failed to delete presentation." },
        { status: 500 }
      );
    }

    // 4. Update user's presentation count
    const { count: remainingCount, error: countError } = await supabase
      .from("presentations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!countError && remainingCount !== null) {
      await supabase
        .from("profiles")
        .update({ presentations_created_count: remainingCount })
        .eq("id", user.id);
    }

    return NextResponse.json(
      { message: "Presentation deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/presentation-details:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to delete presentation: ${errorMessage}` },
      { status: 500 }
    );
  }
}
