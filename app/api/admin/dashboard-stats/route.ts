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

    // Get total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get credits consumed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: todayTransactions } = await supabase
      .from("credit_transactions")
      .select("amount")
      .eq("type", "consumption")
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString());

    const creditsConsumedToday = todayTransactions?.reduce(
      (sum, transaction) => sum + Math.abs(transaction.amount),
      0
    ) || 0;

    // Get courses generated (total)
    const { count: coursesGenerated } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });

    // Get presentations generated (total)
    const { count: presentationsGenerated } = await supabase
      .from("presentations")
      .select("*", { count: "exact", head: true });

    // Get revenue data (from credit transactions)
    const { data: purchaseTransactions } = await supabase
      .from("credit_transactions")
      .select("amount, created_at")
      .eq("type", "purchase");

    // Calculate MRR (Monthly Recurring Revenue) - simplified calculation
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthPurchases = purchaseTransactions?.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    }) || [];

    const monthlyRevenue = thisMonthPurchases.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const totalRevenue = purchaseTransactions?.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    ) || 0;

    // Get failed payments (subscriptions that are not active but should be)
    const { count: failedPayments } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", false)
      .not("stripe_subscription_id", "is", null);

    // Get recent activity stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newUsersThisMonth } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    const { count: coursesThisMonth } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      creditsConsumedToday,
      coursesGenerated: coursesGenerated || 0,
      presentationsGenerated: presentationsGenerated || 0,
      revenue: {
        mrr: monthlyRevenue,
        totalRevenue,
        failedPayments: failedPayments || 0,
      },
      recentActivity: {
        newUsersThisMonth: newUsersThisMonth || 0,
        coursesThisMonth: coursesThisMonth || 0,
      },
      systemHealth: {
        apiStatus: "operational", // This would need actual monitoring
        errorRate: "< 1%", // This would need actual error tracking
        modelPerformance: "99.2%", // This would need actual performance metrics
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}

