// components/analytics/VoiceAgentSessionChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Mic, TrendingUp, Calendar, Sparkles } from "lucide-react";

interface ChartData {
  date: string;
  sessions: number;
}

interface VoiceAgentSessionChartProps {
  data: ChartData[];
}

/**
 * A client component that renders a line chart for voice agent session history over time.
 */
export function VoiceAgentSessionChart({ data }: VoiceAgentSessionChartProps) {
  const totalSessions = data.reduce((sum, day) => sum + day.sessions, 0);
  const averageSessions =
    data.length > 0 ? Math.round(totalSessions / data.length) : 0;

  if (data.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] md:col-span-2">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <div className="relative">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div className="absolute inset-0 bg-orange-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            Voice Agent Sessions
          </CardTitle>
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            0
          </div>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center mx-auto">
              <Mic className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center">
              <Sparkles className="h-4 w-4" />
              No voice agent session data to display
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sessionData = payload[0];
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl rounded-lg px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {label}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">
                Sessions:
              </span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {sessionData.value}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] md:col-span-2">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <div className="relative">
            <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div className="absolute inset-0 bg-orange-400 rounded-full blur opacity-20 animate-pulse"></div>
          </div>
          Voice Agent Sessions Over Time
        </CardTitle>
        <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          {totalSessions}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
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
                id="sessionLineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.3)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "currentColor" }}
              stroke="rgba(148, 163, 184, 0.5)"
            />
            <YAxis
              tick={{ fontSize: 12, fill: "currentColor" }}
              stroke="rgba(148, 163, 184, 0.5)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="url(#sessionLineGradient)"
              strokeWidth={3}
              dot={{ fill: "#EA580C", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#EA580C", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Session summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Total Sessions
              </span>
            </div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {totalSessions}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Daily Average
              </span>
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {averageSessions}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Active Days
              </span>
            </div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {data.filter((day) => day.sessions > 0).length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
