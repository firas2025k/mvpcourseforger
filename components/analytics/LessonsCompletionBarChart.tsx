// components/analytics/LessonsCompletionBarChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, BookOpen, TrendingUp, Target, Sparkles, Award } from 'lucide-react';

interface ChartData {
  courseTitle: string;
  completed: number;
  total: number;
  progress: number;
}

interface LessonsCompletionBarChartProps {
  data: ChartData[];
}

/**
 * A client component that renders a bar chart for progress per course.
 */
export function LessonsCompletionBarChart({ data }: LessonsCompletionBarChartProps) {
  const averageProgress = data.length > 0 
    ? Math.round(data.reduce((sum, course) => sum + course.progress, 0) / data.length)
    : 0;

  if (data.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] md:col-span-2">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <div className="relative">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            Progress by Course
          </CardTitle>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            0%
          </div>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center">
              <Sparkles className="h-4 w-4" />
              No course data to display
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const course = data.find(d => d.courseTitle === label);
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl rounded-lg px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">Completed:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {course?.completed}/{course?.total} lessons
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">Progress:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {course?.progress}%
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
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <div className="relative">
            <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-20 animate-pulse"></div>
          </div>
          Progress by Course
        </CardTitle>
        <div className="flex items-center gap-2">
          {averageProgress === 100 && <Award className="h-5 w-5 text-yellow-500" />}
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
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
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(148, 163, 184, 0.3)"
              vertical={false}
            />
            <XAxis 
              dataKey="courseTitle" 
              tick={{ fontSize: 12, fill: 'currentColor' }} 
              angle={-20} 
              textAnchor="end" 
              height={60} 
              interval={0}
              stroke="rgba(148, 163, 184, 0.5)"
            />
            <YAxis 
              unit="%" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              stroke="rgba(148, 163, 184, 0.5)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar 
              dataKey="progress" 
              fill="url(#barGradient)"
              name="Completion Progress"
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
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Average Progress</span>
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {averageProgress}%
            </div>
          </div>
          
          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Courses</span>
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {data.length}
            </div>
          </div>
          
          <div className="p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Completed Courses</span>
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {data.filter(course => course.progress === 100).length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

