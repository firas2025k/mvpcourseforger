import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const typeFilter = searchParams.get("type") || "all";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const offset = (page - 1) * limit;

    // Build the query for credit transactions
    let query = supabase
      .from("credit_transactions")
      .select(`
        id,
        user_id,
        type,
        amount,
        related_entity_id,
        description,
        created_at,
        profiles (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }

    if (search) {
      query = query.or(`description.ilike.%${search}%,user_id.ilike.%${search}%`);
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endDate.toISOString());
    }

    // Get total count for pagination
    const { count: totalTransactions } = await supabase
      .from("credit_transactions")
      .select("*", { count: "exact", head: true });

    // Get paginated results
    const { data: transactions, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Process transactions data
    const processedTransactions = transactions?.map(transaction => ({
      id: transaction.id,
      userId: transaction.user_id,
      userName: transaction.profiles?.full_name || "Unknown User",
      type: transaction.type,
      amount: transaction.amount,
      relatedEntityId: transaction.related_entity_id,
      description: transaction.description,
      createdAt: transaction.created_at,
    })) || [];

    // Get credit analytics
    const { data: allTransactions } = await supabase
      .from("credit_transactions")
      .select(`
        type,
        amount,
        created_at,
        profiles (
          subscriptions (
            plans (
              name
            )
          )
        )
      `);

    // Calculate analytics
    const analytics = {
      totalPurchased: 0,
      totalConsumed: 0,
      totalAdjustments: 0,
      byPlan: {} as Record<string, { purchased: number; consumed: number; adjustments: number }>,
      dailyActivity: {} as Record<string, { purchased: number; consumed: number }>,
    };

    allTransactions?.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      
      // Overall totals
      if (transaction.type === "purchase") {
        analytics.totalPurchased += amount;
      } else if (transaction.type === "consumption") {
        analytics.totalConsumed += amount;
      } else if (transaction.type === "adjustment") {
        analytics.totalAdjustments += Math.abs(transaction.amount); // Keep sign for adjustments
      }

      // Daily activity
      if (!analytics.dailyActivity[date]) {
        analytics.dailyActivity[date] = { purchased: 0, consumed: 0 };
      }
      if (transaction.type === "purchase") {
        analytics.dailyActivity[date].purchased += amount;
      } else if (transaction.type === "consumption") {
        analytics.dailyActivity[date].consumed += amount;
      }

      // By plan
      const planName = transaction.profiles?.subscriptions?.[0]?.plans?.name || "Free";
      if (!analytics.byPlan[planName]) {
        analytics.byPlan[planName] = { purchased: 0, consumed: 0, adjustments: 0 };
      }
      if (transaction.type === "purchase") {
        analytics.byPlan[planName].purchased += amount;
      } else if (transaction.type === "consumption") {
        analytics.byPlan[planName].consumed += amount;
      } else if (transaction.type === "adjustment") {
        analytics.byPlan[planName].adjustments += Math.abs(transaction.amount);
      }
    });

    // Get current credit balances by plan
    const { data: creditBalances } = await supabase
      .from("profiles")
      .select(`
        credits,
        subscriptions (
          plans (
            name
          )
        )
      `);

    const balancesByPlan = creditBalances?.reduce((acc, profile) => {
      const planName = profile.subscriptions?.[0]?.plans?.name || "Free";
      if (!acc[planName]) {
        acc[planName] = { totalCredits: 0, userCount: 0 };
      }
      acc[planName].totalCredits += profile.credits || 0;
      acc[planName].userCount += 1;
      return acc;
    }, {} as Record<string, { totalCredits: number; userCount: number }>) || {};

    return NextResponse.json({
      transactions: processedTransactions,
      pagination: {
        page,
        limit,
        total: totalTransactions || 0,
        totalPages: Math.ceil((totalTransactions || 0) / limit),
      },
      analytics: {
        ...analytics,
        balancesByPlan,
      },
    });
  } catch (error) {
    console.error("Error fetching credit data:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { action, userIds, amount, description } = body;

    if (action === "bulk_credit_adjustment") {
      // Bulk credit operation
      const results = [];
      
      for (const userId of userIds) {
        // Get current credits
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", userId)
          .single();

        const newCredits = Math.max(0, (currentProfile?.credits || 0) + amount);

        // Update credits
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ credits: newCredits })
          .eq("id", userId);

        if (updateError) {
          results.push({ userId, success: false, error: updateError.message });
          continue;
        }

        // Log transaction
        const { error: transactionError } = await supabase
          .from("credit_transactions")
          .insert({
            user_id: userId,
            type: "adjustment",
            amount: amount,
            description: description || `Bulk credit adjustment: ${amount > 0 ? '+' : ''}${amount} credits`,
          });

        if (transactionError) {
          results.push({ userId, success: false, error: transactionError.message });
        } else {
          results.push({ userId, success: true });
        }
      }

      return NextResponse.json({ results });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}

