import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreditBalance from "@/components/dashboard/CreditBalance";
import { Suspense } from "react";
import { Loader2, Sparkles, Coins } from "lucide-react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Enhanced loading component
function DashboardLoading() {
  return (
    <div className="w-full h-32 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
        <div className="relative flex items-center gap-3 px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Loading your dashboard...
          </span>
          <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Credit loading component
function CreditLoading() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <Coins className="h-4 w-4 text-slate-400 animate-pulse" />
      <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
    </div>
  );
}

// Server component to fetch initial credit balance
async function CreditBalanceWrapper() {
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

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return <CreditLoading />;
    }

    // Fetch user's credit balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user credits:", profileError);
      return <CreditLoading />;
    }

    const credits = profile?.credits || 0;

    return (
      <CreditBalance
        initialCredits={credits}
        showTopUpButton={false}
        compact={true}
      />
    );
  } catch (error) {
    console.error("Error in CreditBalanceWrapper:", error);
    return <CreditLoading />;
  }
}

// Enhanced DashboardLayout wrapper with credit display
function DashboardLayoutWithCredits({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {/* Main Content */}
      <Suspense fallback={<DashboardLoading />}>
        <div className="animate-in fade-in duration-500">{children}</div>
      </Suspense>
    </DashboardLayout>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutWithCredits>{children}</DashboardLayoutWithCredits>;
}
