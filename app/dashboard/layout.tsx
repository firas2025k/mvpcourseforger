import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Suspense } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

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

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardLoading />}>
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </Suspense>
    </DashboardLayout>
  );
}

