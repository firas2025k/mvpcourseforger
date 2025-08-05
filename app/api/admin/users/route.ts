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
    const search = searchParams.get("search") || "";
    const planFilter = searchParams.get("plan") || "";
    const statusFilter = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        credits,
        created_at,
        courses_created_count,
        presentations_created_count,
        subscriptions (
          id,
          is_active,
          plans (
            name,
            price_cents
          )
        )
      `)
      .order(sortBy, { ascending: sortOrder === "asc" });

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,id.ilike.%${search}%`);
    }

    // Get total count for pagination
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get paginated results
    const { data: users, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Process users data
    const processedUsers = users?.map(user => ({
      id: user.id,
      fullName: user.full_name || "Unknown User",
      email: user.id, // In this case, we're using the user ID as email placeholder
      credits: user.credits || 0,
      createdAt: user.created_at,
      coursesCreated: user.courses_created_count || 0,
      presentationsCreated: user.presentations_created_count || 0,
      subscription: user.subscriptions?.[0] ? {
        isActive: user.subscriptions[0].is_active,
        planName: user.subscriptions[0].plans?.name || "Free",
        planPrice: user.subscriptions[0].plans?.price_cents || 0,
      } : {
        isActive: false,
        planName: "Free",
        planPrice: 0,
      },
    })) || [];

    // Apply filters after processing
    let filteredUsers = processedUsers;

    if (planFilter && planFilter !== "all") {
      filteredUsers = filteredUsers.filter(user => 
        user.subscription.planName.toLowerCase() === planFilter.toLowerCase()
      );
    }

    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "active") {
        filteredUsers = filteredUsers.filter(user => user.subscription.isActive);
      } else if (statusFilter === "inactive") {
        filteredUsers = filteredUsers.filter(user => !user.subscription.isActive);
      }
    }

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: totalUsers || 0,
        totalPages: Math.ceil((totalUsers || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
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
    const { userId, action, value } = body;

    switch (action) {
      case "add_credits":
        // Add credits to user
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", userId)
          .single();

        const newCredits = (currentProfile?.credits || 0) + value;

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ credits: newCredits })
          .eq("id", userId);

        if (updateError) throw updateError;

        // Log the credit transaction
        const { error: transactionError } = await supabase
          .from("credit_transactions")
          .insert({
            user_id: userId,
            type: "adjustment",
            amount: value,
            description: `Admin credit adjustment: +${value} credits`,
          });

        if (transactionError) throw transactionError;
        break;

      case "suspend_account":
        // Deactivate subscription
        const { error: suspendError } = await supabase
          .from("subscriptions")
          .update({ is_active: false })
          .eq("user_id", userId);

        if (suspendError) throw suspendError;
        break;

      case "activate_account":
        // Activate subscription
        const { error: activateError } = await supabase
          .from("subscriptions")
          .update({ is_active: true })
          .eq("user_id", userId);

        if (activateError) throw activateError;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

