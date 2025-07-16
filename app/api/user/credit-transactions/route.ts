import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
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

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const typeFilter = searchParams.get("type") || "all";
    const searchQuery = searchParams.get("search") || "";
    const isExport = searchParams.get("export") === "true";

    // Build query
    let query = supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }

    if (searchQuery) {
      query = query.ilike("description", `%${searchQuery}%`);
    }

    if (isExport) {
      // For export, get all matching records
      const { data: transactions, error } = await query;

      if (error) {
        console.error("Error fetching transactions for export:", error);
        return NextResponse.json(
          { error: "Failed to fetch transactions" },
          { status: 500 }
        );
      }

      // Convert to CSV
      const csvHeaders = [
        "Date",
        "Type",
        "Description",
        "Amount",
        "Related ID",
      ];
      const csvRows =
        transactions?.map((transaction) => [
          new Date(transaction.created_at).toLocaleString(),
          transaction.type,
          transaction.description || "",
          transaction.amount.toString(),
          transaction.related_entity_id || "",
        ]) || [];

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="credit-transactions-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    } else {
      // For regular requests, apply pagination
      const { data: transactions, error } = await query.range(
        offset,
        offset + limit - 1
      );

      if (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
          { error: "Failed to fetch transactions" },
          { status: 500 }
        );
      }

      // Get total count for pagination
      const { count: totalTransactions } = await supabase
        .from("credit_transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      return NextResponse.json({
        transactions: transactions || [],
        totalTransactions: totalTransactions || 0,
        currentPage: page,
        totalPages: Math.ceil((totalTransactions || 0) / limit),
      });
    }
  } catch (error) {
    console.error("Error in credit transactions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
