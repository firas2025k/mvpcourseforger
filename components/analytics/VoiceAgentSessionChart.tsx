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
  ComposedChart,
  Bar,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Mic, TrendingUp, Calendar, Sparkles, Timer, Clock } from "lucide-react";

interface ChartData {
  date: string;
  sessions: number;
  totalDuration: number; // in minutes
  averageDuration: number; // in minutes
}

interface VoiceAgentSessionChartProps {
  data: ChartData[];
}

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * A client component that renders a combined chart for voice agent session history and duration over time.
 */
export function VoiceAgentSessionChart({ data }: VoiceAgentSessionChartProps) {
  const totalSessions = data.reduce((sum, day) => sum + day.sessions, 0);
  const totalDuration = data.reduce((sum, day) => sum + day.totalDuration, 0);
  const averageSessions =
    data.length > 0 ? Math.round(totalSessions / data.length) : 0;
  const averageDailyDuration =
    data.length > 0 ? Math.round(totalDuration / data.length) : 0;

  // Fixed: Better handling of empty data states
  if (data.length === 0 || totalSessions === 0) {
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
              No voice agent sessions recorded
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Start using your voice agents to see session trends
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fixed: Generate a complete 7-day dataset with zeros for missing days
  const generateLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toLocaleDateString();
      
      const existingData = data.find(d => d.date === dateString);
      days.push({
        date: dateString,
        sessions: existingData ? existingData.sessions : 0,
        totalDuration: existingData ? existingData.totalDuration : 0,
        averageDuration: existingData ? existingData.averageDuration : 0
      });
    }
    
    return days;
  };

  const chartData = generateLast7Days();

  // Custom tooltip component with duration information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sessionData = payload.find((p: any) => p.dataKey === 'sessions');
      const durationData = payload.find((p: any) => p.dataKey === 'totalDuration');
      const avgDurationData = payload.find((p: any) => p.dataKey === 'averageDuration');
      
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
                {sessionData?.value || 0}
              </span>
            </div>
            {durationData && durationData.value > 0 && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600 dark:text-slate-400">
                    Total Time:
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatDuration(durationData.value)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600 dark:text-slate-400">
                    Avg Session:
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatDuration(avgDurationData?.value || 0)}
                  </span>
                </div>
              </>
            )}
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
          Voice Agent Sessions & Duration
        </CardTitle>
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-blue-500" />
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {totalSessions}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart
            data={chartData}
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
              <linearGradient
                id="durationBarGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E40AF" />
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
              yAxisId="sessions"
              tick={{ fontSize: 12, fill: "currentColor" }}
              stroke="rgba(148, 163, 184, 0.5)"
              domain={[0, 'dataMax']}
            />
            <YAxis
              yAxisId="duration"
              orientation="right"
              tick={{ fontSize: 12, fill: "currentColor" }}
              stroke="rgba(148, 163, 184, 0.5)"
              domain={[0, 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="duration"
              dataKey="totalDuration"
              fill="url(#durationBarGradient)"
              name="Duration (min)"
              radius={[2, 2, 0, 0]}
              opacity={0.7}
            />
            <Line
              yAxisId="sessions"
              type="monotone"
              dataKey="sessions"
              stroke="url(#sessionLineGradient)"
              strokeWidth={3}
              dot={{ fill: "#EA580C", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#EA580C", strokeWidth: 2 }}
              name="Sessions"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Enhanced session summary with duration */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
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
              <Timer className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Total Time
              </span>
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatDuration(totalDuration)}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Daily Avg Sessions
              </span>
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {averageSessions}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Daily Avg Time
              </span>
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatDuration(averageDailyDuration)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

