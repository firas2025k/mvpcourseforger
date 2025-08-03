"use client";

import { Shield, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";

export default function AdminDashboardPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Monitor and manage your Nexable platform
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            asChild
            className="h-auto p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <a href="/admin/users" className="flex flex-col items-center gap-2">
              <span className="font-semibold">Manage Users</span>
              <span className="text-xs opacity-90">View and edit user accounts</span>
            </a>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-auto p-4 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/20"
          >
            <a href="/admin/subscriptions" className="flex flex-col items-center gap-2">
              <span className="font-semibold">Subscriptions</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Monitor subscription status
              </span>
            </a>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-auto p-4 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:bg-yellow-950/20"
          >
            <a href="/admin/credits" className="flex flex-col items-center gap-2">
              <span className="font-semibold">Credit System</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Manage credit transactions
              </span>
            </a>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-auto p-4 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/20"
          >
            <a href="/dashboard/analytics" className="flex flex-col items-center gap-2">
              <span className="font-semibold">Analytics</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                View detailed analytics
              </span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

