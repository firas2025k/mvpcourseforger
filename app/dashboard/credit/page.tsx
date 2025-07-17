import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

import {
  Coins,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Zap,
  BookOpen,
  LayoutGrid,
  Sparkles,
  Target,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreditBalance from "@/components/dashboard/CreditBalance";
import CreditUsageTable from "@/components/dashboard/CreditUsageTable";

interface CreditTransaction {
  id: string;
  type: "purchase" | "consumption" | "adjustment";
  amount: number;
  related_entity_id: string | null;
  description: string | null;
  created_at: string;
}

interface CreditStats {
  totalCredits: number;
  totalPurchased: number;
  totalConsumed: number;
  thisMonthPurchased: number;
  thisMonthConsumed: number;
}

export default async function CreditPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Get current user's credit balance
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
  }

  const currentCredits = profileData?.credits ?? 0;

  // Get credit transactions with pagination
  const page = parseInt(searchParams?.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const typeFilter = searchParams?.type || "all";
  const searchQuery = searchParams?.search || "";

  let transactionsQuery = supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (typeFilter !== "all") {
    transactionsQuery = transactionsQuery.eq("type", typeFilter as any);
  }

  if (searchQuery) {
    transactionsQuery = transactionsQuery.ilike(
      "description",
      `%${searchQuery}%`
    );
  }

  const { data: transactions, error: transactionsError } =
    await transactionsQuery.range(offset, offset + limit - 1);

  if (transactionsError) {
    console.error("Error fetching transactions:", transactionsError.message);
  }

  const creditTransactions: CreditTransaction[] = transactions || [];

  // Get total count for pagination
  const { count: totalTransactions } = await supabase
    .from("credit_transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalPages = Math.ceil((totalTransactions || 0) / limit);

  // Calculate credit statistics
  const { data: allTransactions } = await supabase
    .from("credit_transactions")
    .select("type, amount, created_at")
    .eq("user_id", user.id);

  const stats: CreditStats = {
    totalCredits: currentCredits,
    totalPurchased: 0,
    totalConsumed: 0,
    thisMonthPurchased: 0,
    thisMonthConsumed: 0,
  };

  if (allTransactions) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    allTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.created_at);
      const isThisMonth =
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;

      if (transaction.type === "purchase" && transaction.amount > 0) {
        stats.totalPurchased += transaction.amount;
        if (isThisMonth) stats.thisMonthPurchased += transaction.amount;
      } else if (transaction.type === "consumption" && transaction.amount < 0) {
        stats.totalConsumed += Math.abs(transaction.amount);
        if (isThisMonth)
          stats.thisMonthConsumed += Math.abs(transaction.amount);
      }
    });
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12">
      {/* Enhanced Header */}
      <header className="px-4 md:px-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-3xl blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-yellow-900 to-orange-900 dark:from-slate-100 dark:via-yellow-100 dark:to-orange-100 bg-clip-text text-transparent">
                  Credit Management
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Track your credit usage and purchase history
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-950/20"
              >
                <Link
                  href="/dashboard/credit/purchase"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Buy Credits
                </Link>
              </Button>
              <CreditBalance
                initialCredits={currentCredits}
                showTopUpButton={false}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Statistics Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-4 md:px-6">
        {/* Current Balance Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Current Balance
            </CardTitle>
            <div className="relative">
              <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
              {stats.totalCredits}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              credits available
            </p>
          </CardContent>
        </Card>

        {/* Total Purchased Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Total Purchased
            </CardTitle>
            <div className="relative">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {stats.totalPurchased}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              credits purchased all time
            </p>
          </CardContent>
        </Card>

        {/* Total Consumed Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Total Consumed
            </CardTitle>
            <div className="relative">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div className="absolute inset-0 bg-red-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {stats.totalConsumed}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              credits used all time
            </p>
          </CardContent>
        </Card>

        {/* This Month Activity Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              This Month
            </CardTitle>
            <div className="relative">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-bold text-green-600">
                +{stats.thisMonthPurchased}
              </div>
              <div className="text-lg font-bold text-red-600">
                -{stats.thisMonthConsumed}
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              purchased vs consumed
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Credit Usage Table */}
      <section className="px-4 md:px-6">
        <CreditUsageTable
          initialTransactions={creditTransactions}
          totalTransactions={totalTransactions || 0}
          currentPage={page}
          totalPages={totalPages}
          typeFilter={typeFilter}
          searchQuery={searchQuery}
        />
      </section>

      {/* Quick Actions */}
      <section className="px-4 md:px-6">
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200/50 dark:border-yellow-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                asChild
                className="h-auto p-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
              >
                <Link
                  href="/dashboard/credits/purchase"
                  className="flex flex-col items-center gap-2"
                >
                  <DollarSign className="h-6 w-6" />
                  <span className="font-semibold">Buy More Credits</span>
                  <span className="text-xs opacity-90">
                    Purchase credit packages
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20"
              >
                <Link
                  href="/dashboard/courses/new"
                  className="flex flex-col items-center gap-2"
                >
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold">Create Course</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Use credits to generate
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/20"
              >
                <Link
                  href="/dashboard/presentations/new"
                  className="flex flex-col items-center gap-2"
                >
                  <LayoutGrid className="h-6 w-6 text-purple-600" />
                  <span className="font-semibold">Create Presentation</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Generate slides with AI
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
