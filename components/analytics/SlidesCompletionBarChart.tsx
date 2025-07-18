// components/analytics/SlidesCompletionBarChart.tsx
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
import {
  BarChart3,
  Sliders,
  TrendingUp,
  Target,
  Sparkles,
  Award,
} from "lucide-react";

interface ChartData {
  presentationTitle: string;
  viewed: number;
  total: number;
  progress: number;
}

interface SlidesCompletionBarChartProps {
  data: ChartData[];
}

/**
 * A client component that renders a bar chart for progress per presentation.
 */
export function SlidesCompletionBarChart({
  data,
}: SlidesCompletionBarChartProps) {
  const averageProgress =
    data.length > 0
      ? Math.round(
          data.reduce((sum, presentation) => sum + presentation.progress, 0) /
            data.length
        )
      : 0;

  if (data.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] md:col-span-2">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <div className="relative">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            Progress by Presentation
          </CardTitle>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            0%
          </div>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center mx-auto">
              <Sliders className="h-8 w-8 text-slate-400" />
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
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const presentation = data.find((d) => d.presentationTitle === label);
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl rounded-lg px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {label}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">
                Viewed:
              </span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {presentation?.viewed}/{presentation?.total} slides
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">
                Progress:
              </span>
              <span className="font-bold text-pink-600 dark:text-pink-400">
                {presentation?.progress}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
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
    <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] md:col-span-2">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <div className="relative">
            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-20 animate-pulse"></div>
          </div>
          Progress by Presentation
        </CardTitle>
        <div className="flex items-center gap-2">
          {averageProgress === 100 && (
            <Award className="h-5 w-5 text-yellow-500" />
          )}
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {averageProgress}%
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
                id="presentationBarGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.3)"
              vertical={false}
            />
            <XAxis
              dataKey="presentationTitle"
              tick={{ fontSize: 12, fill: "currentColor" }}
              angle={-20}
              textAnchor="end"
              height={60}
              interval={0}
              stroke="rgba(148, 163, 184, 0.5)"
            />
            <YAxis
              unit="%"
              tick={{ fontSize: 12, fill: "currentColor" }}
              stroke="rgba(148, 163, 184, 0.5)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="progress"
              fill="url(#presentationBarGradient)"
              name="Viewing Progress"
              radius={[4, 4, 0, 0]}
              strokeWidth={1}
              stroke="rgba(255,255,255,0.8)"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Progress summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Average Progress
              </span>
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {averageProgress}%
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="h-4 w-4 text-pink-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Total Presentations
              </span>
            </div>
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
              {data.length}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Completed Presentations
              </span>
            </div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {
                data.filter((presentation) => presentation.progress === 100)
                  .length
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
