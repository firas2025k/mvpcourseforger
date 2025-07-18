// components/analytics/CompanionUsageChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Mic, TrendingUp, Star, Sparkles, Crown } from "lucide-react";

interface ChartData {
  companionName: string;
  sessions: number;
  subject: string;
}

interface CompanionUsageChartProps {
  data: ChartData[];
}

/**
 * A client component that renders a bar chart for companion usage statistics.
 */
export function CompanionUsageChart({ data }: CompanionUsageChartProps) {
  const totalSessions = data.reduce(
    (sum, companion) => sum + companion.sessions,
    0
  );
  const mostUsedCompanion =
    data.length > 0
      ? data.reduce((prev, current) =>
          prev.sessions > current.sessions ? prev : current
        )
      : null;

  if (data.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <div className="relative">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div className="absolute inset-0 bg-indigo-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            Companion Usage
          </CardTitle>
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            0
          </div>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center mx-auto">
              <Mic className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center">
              <Sparkles className="h-4 w-4" />
              No companion usage data to display
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const companion = data.find((d) => d.companionName === label);
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl rounded-lg px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {label}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">
                Subject:
              </span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {companion?.subject || "General"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">
                Sessions:
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {companion?.sessions}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <div className="relative">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div className="absolute inset-0 bg-indigo-400 rounded-full blur opacity-20 animate-pulse"></div>
          </div>
          Companion Usage
        </CardTitle>
        <div className="flex items-center gap-2">
          {mostUsedCompanion && <Crown className="h-5 w-5 text-yellow-500" />}
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalSessions}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient
                id="companionBarGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.3)"
              vertical={false}
            />
            <XAxis
              dataKey="companionName"
              tick={{ fontSize: 12, fill: "currentColor" }}
              angle={-20}
              textAnchor="end"
              height={60}
              interval={0}
              stroke="rgba(148, 163, 184, 0.5)"
            />
            <YAxis
              tick={{ fontSize: 12, fill: "currentColor" }}
              stroke="rgba(148, 163, 184, 0.5)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="sessions"
              fill="url(#companionBarGradient)"
              name="Sessions"
              radius={[4, 4, 0, 0]}
              strokeWidth={1}
              stroke="rgba(255,255,255,0.8)"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Usage summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Total Companions
              </span>
            </div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {data.length}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Most Used
              </span>
            </div>
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400 truncate">
              {mostUsedCompanion?.companionName || "N/A"}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-pink-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Total Sessions
              </span>
            </div>
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
              {totalSessions}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
