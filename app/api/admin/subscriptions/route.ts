import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const statusFilter = searchParams.get("status") || "all";
    const planFilter = searchParams.get("plan") || "all";

    const offset = (page - 1) * limit;

    // Build the query for subscriptions
    let query = supabase
      .from("subscriptions")
      .select(`
        id,
        user_id,
        is_active,
        start_date,
        end_date,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_current_period_end,
        created_at,
        plans (
          id,
          name,
          price_cents,
          course_limit,
          max_chapters,
          max_lessons_per_chapter,
          max_presentations,
          max_slides_per_presentation,
          credit_amount
        ),
        profiles (
          id,
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    // Apply status filter
    if (statusFilter !== "all") {
      query = query.eq("is_active", statusFilter === "active");
    }

    // Get total count for pagination
    const { count: totalSubscriptions } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true });

    // Get paginated results
    const { data: subscriptions, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Process subscriptions data
    const processedSubscriptions = subscriptions?.map(subscription => ({
      id: subscription.id,
      userId: subscription.user_id,
      userName: subscription.profiles?.full_name || "Unknown User",
      isActive: subscription.is_active,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      stripeCustomerId: subscription.stripe_customer_id,
      stripeSubscriptionId: subscription.stripe_subscription_id,
      currentPeriodEnd: subscription.stripe_current_period_end,
      createdAt: subscription.created_at,
      plan: subscription.plans ? {
        id: subscription.plans.id,
        name: subscription.plans.name,
        priceInCents: subscription.plans.price_cents,
        courseLimit: subscription.plans.course_limit,
        maxChapters: subscription.plans.max_chapters,
        maxLessonsPerChapter: subscription.plans.max_lessons_per_chapter,
        maxPresentations: subscription.plans.max_presentations,
        maxSlidesPerPresentation: subscription.plans.max_slides_per_presentation,
        creditAmount: subscription.plans.credit_amount,
      } : null,
    })) || [];

    // Apply plan filter after processing
    let filteredSubscriptions = processedSubscriptions;
    if (planFilter !== "all") {
      filteredSubscriptions = filteredSubscriptions.filter(sub => 
        sub.plan?.name.toLowerCase() === planFilter.toLowerCase()
      );
    }

    // Get plan performance analytics
    const { data: planStats } = await supabase
      .from("subscriptions")
      .select(`
        plans (
          name,
          price_cents
        ),
        is_active
      `);

    const planPerformance = planStats?.reduce((acc, sub) => {
      if (sub.plans) {
        const planName = sub.plans.name;
        if (!acc[planName]) {
          acc[planName] = {
            name: planName,
            priceInCents: sub.plans.price_cents,
            totalSubscriptions: 0,
            activeSubscriptions: 0,
            revenue: 0,
          };
        }
        acc[planName].totalSubscriptions++;
        if (sub.is_active) {
          acc[planName].activeSubscriptions++;
          acc[planName].revenue += sub.plans.price_cents;
        }
      }
      return acc;
    }, {} as Record<string, any>) || {};

    // Get failed payments (inactive subscriptions with Stripe IDs)
    const { data: failedPayments } = await supabase
      .from("subscriptions")
      .select(`
        id,
        user_id,
        stripe_subscription_id,
        stripe_current_period_end,
        profiles (
          full_name
        ),
        plans (
          name,
          price_cents
        )
      `)
      .eq("is_active", false)
      .not("stripe_subscription_id", "is", null);

    const processedFailedPayments = failedPayments?.map(payment => ({
      id: payment.id,
      userId: payment.user_id,
      userName: payment.profiles?.full_name || "Unknown User",
      stripeSubscriptionId: payment.stripe_subscription_id,
      currentPeriodEnd: payment.stripe_current_period_end,
      planName: payment.plans?.name || "Unknown Plan",
      planPrice: payment.plans?.price_cents || 0,
    })) || [];

    return NextResponse.json({
      subscriptions: filteredSubscriptions,
      pagination: {
        page,
        limit,
        total: totalSubscriptions || 0,
        totalPages: Math.ceil((totalSubscriptions || 0) / limit),
      },
      planPerformance: Object.values(planPerformance),
      failedPayments: processedFailedPayments,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { subscriptionId, action } = body;

    switch (action) {
      case "activate":
        const { error: activateError } = await supabase
          .from("subscriptions")
          .update({ is_active: true })
          .eq("id", subscriptionId);

        if (activateError) throw activateError;
        break;

      case "deactivate":
        const { error: deactivateError } = await supabase
          .from("subscriptions")
          .update({ is_active: false })
          .eq("id", subscriptionId);

        if (deactivateError) throw deactivateError;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

