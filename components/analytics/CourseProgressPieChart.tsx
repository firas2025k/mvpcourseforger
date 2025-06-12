// components/analytics/CourseProgressPieChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ChartData {
  name: string;
  value: number;
}

interface CourseProgressPieChartProps {
  data: ChartData[];
}

// Define colors for the chart segments
const COLORS = ['#4F46E5', '#E5E7EB']; // Indigo for completed, Gray for pending

/**
 * A client component that renders a pie chart for overall lesson progress.
 */
export function CourseProgressPieChart({ data }: CourseProgressPieChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  // If there's no data, show a placeholder message.
  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No lesson data to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value} lessons`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
