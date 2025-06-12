// components/analytics/LessonsCompletionBarChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
  if (data.length === 0) {
    return (
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Progress by Course</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No course data to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Progress by Course</CardTitle>
      </CardHeader>
      <CardContent>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="courseTitle" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={50} interval={0} />
            <YAxis unit="%" />
            <Tooltip
  formatter={(value: number) => [`${value}%`, "Progress"]}
  content={({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const course = data.find(d => d.courseTitle === label);
      return (
        <div className="bg-white shadow-md rounded-md px-3 py-2 border border-gray-200">
          <p className="font-semibold text-sm mb-1">{label}</p>
          <p className="text-xs text-muted-foreground">
            {course?.completed}/{course?.total} lessons completed
          </p>
          <p className="text-xs">
            <span className="font-medium">Progress:</span> {course?.progress}%
          </p>
        </div>
      );
    }
    return null;
  }}
/>
            <Legend />
            <Bar dataKey="progress" fill="#4F46E5" name="Completion Progress" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
