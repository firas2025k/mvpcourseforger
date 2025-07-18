// components/analytics/PresentationProgressPieChart.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  PresentationIcon,
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
  Sliders,
} from "lucide-react";

interface ChartData {
  name: string;
  value: number;
}

interface PresentationProgressPieChartProps {
  data: ChartData[];
}

// Enhanced colors with gradients for the chart segments
const COLORS = ["#8B5CF6", "#E5E7EB"]; // Purple for completed, Gray for pending

/**
 * A client component that renders a pie chart for overall presentation slide progress.
 */
export function PresentationProgressPieChart({
  data,
}: PresentationProgressPieChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const completed = data.find((item) => item.name === "Completed")?.value || 0;
  const completionPercentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  // If there's no data, show a placeholder message.
  if (total === 0) {
    return (
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <div className="relative">
              <Sliders className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            Presentation Progress
          </CardTitle>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            0%
          </div>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center">
              <Sparkles className="h-4 w-4" />
              No presentation data to display
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl rounded-lg px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {data.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {data.value} slides ({Math.round((data.value / total) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <div className="relative">
            <Sliders className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-20 animate-pulse"></div>
          </div>
          Presentation Progress
        </CardTitle>
        <div className="flex items-center gap-2">
          {completionPercentage === 100 && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {completionPercentage}%
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="relative">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <defs>
                <linearGradient
                  id="presentationCompletedGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
                <linearGradient
                  id="presentationPendingGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#E5E7EB" />
                  <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={85}
                innerRadius={45}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                strokeWidth={2}
                stroke="rgba(255,255,255,0.8)"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? "url(#presentationCompletedGradient)"
                        : "url(#presentationPendingGradient)"
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {completed}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                of {total}
              </div>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        <div className="mt-4 p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Progress Summary
              </span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {completed} viewed, {total - completed} remaining
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
