import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Placeholder for progress
import { BookOpen } from 'lucide-react';

// Define the expected shape of a course object for this component
// Ideally, this would come from a shared types/index.ts file
export interface CourseForCard {
  id: string;
  title: string;
  prompt: string | null; // Using prompt as description for now
  // Add other relevant fields like difficulty, image_url if available and needed for card
}

interface CourseCardProps {
  course: CourseForCard;
}

export default function CourseCard({ course }: CourseCardProps) {
  const description = course.prompt 
    ? (course.prompt.length > 100 ? course.prompt.substring(0, 97) + '...' : course.prompt)
    : 'No description available.';

  // Placeholder progress value
  const progressValue = 0; // Later, this would come from user's progress data

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold leading-tight flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-purple-600" />
          {course.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground h-16 overflow-hidden">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Progress Bar Placeholder */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          {/* Link to a dynamic course page - this page needs to be created later */}
          <Link href={`/dashboard/courses/${course.id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
