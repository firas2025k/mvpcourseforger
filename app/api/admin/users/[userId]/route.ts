import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params;

    // Get user profile with subscription details
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        credits,
        created_at,
        courses_created_count,
        presentations_created_count,
        course_limit,
        presentation_limit,
        subscriptions (
          id,
          is_active,
          start_date,
          end_date,
          stripe_customer_id,
          stripe_subscription_id,
          stripe_current_period_end,
          plans (
            name,
            price_cents,
            course_limit,
            max_chapters,
            max_lessons_per_chapter,
            max_presentations,
            max_slides_per_presentation,
            credit_amount
          )
        )
      `)
      .eq("id", userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get user's credit transactions
    const { data: creditTransactions, error: transactionsError } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (transactionsError) {
      throw transactionsError;
    }

    // Get user's courses
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, title, created_at, is_published, is_archived")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (coursesError) {
      throw coursesError;
    }

    // Get user's presentations
    const { data: presentations, error: presentationsError } = await supabase
      .from("presentations")
      .select("id, title, created_at, is_published, is_archived")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (presentationsError) {
      throw presentationsError;
    }

    // Get user's progress statistics
    const { data: progressStats } = await supabase
      .from("progress")
      .select("is_completed")
      .eq("user_id", userId);

    const completedLessons = progressStats?.filter(p => p.is_completed).length || 0;
    const totalLessons = progressStats?.length || 0;

    const userDetails = {
      id: profile.id,
      fullName: profile.full_name || "Unknown User",
      credits: profile.credits || 0,
      createdAt: profile.created_at,
      coursesCreated: profile.courses_created_count || 0,
      presentationsCreated: profile.presentations_created_count || 0,
      courseLimit: profile.course_limit || 0,
      presentationLimit: profile.presentation_limit || 0,
      subscription: profile.subscriptions?.[0] ? {
        id: profile.subscriptions[0].id,
        isActive: profile.subscriptions[0].is_active,
        startDate: profile.subscriptions[0].start_date,
        endDate: profile.subscriptions[0].end_date,
        stripeCustomerId: profile.subscriptions[0].stripe_customer_id,
        stripeSubscriptionId: profile.subscriptions[0].stripe_subscription_id,
        currentPeriodEnd: profile.subscriptions[0].stripe_current_period_end,
        plan: profile.subscriptions[0].plans ? {
          name: profile.subscriptions[0].plans.name,
          priceInCents: profile.subscriptions[0].plans.price_cents,
          courseLimit: profile.subscriptions[0].plans.course_limit,
          maxChapters: profile.subscriptions[0].plans.max_chapters,
          maxLessonsPerChapter: profile.subscriptions[0].plans.max_lessons_per_chapter,
          maxPresentations: profile.subscriptions[0].plans.max_presentations,
          maxSlidesPerPresentation: profile.subscriptions[0].plans.max_slides_per_presentation,
          creditAmount: profile.subscriptions[0].plans.credit_amount,
        } : null,
      } : null,
      creditTransactions: creditTransactions || [],
      recentCourses: courses || [],
      recentPresentations: presentations || [],
      progressStats: {
        completedLessons,
        totalLessons,
        completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
      },
    };

    return NextResponse.json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

