"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Or next/router if using Pages Router
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BookCheck, FileText, Save, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Re-defining interfaces here for clarity, or import from a shared types file
interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
}

interface Lesson {
  title: string;
  content: string; // We might not display full content here, but it's part of the structure
  quiz?: { // Quiz is optional
    questions: QuizQuestion[];
  };
}

interface Chapter {
  title: string;
  lessons: Lesson[];
}

interface CourseStructure {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  chapters: Chapter[];
}

// Placeholder data for UI development
const MOCK_COURSE_DATA: CourseStructure = {
  title: 'Advanced JavaScript Concepts',
  difficulty: 'advanced',
  chapters: [
    {
      title: 'Asynchronous JavaScript',
      lessons: [
        { title: 'Callbacks and Promises', content: '...' },
        { title: 'Async/Await', content: '...', quiz: { questions: [{ question: 'What is async?', choices: ['A', 'B'], answer: 'A' }] } },
      ],
    },
    {
      title: 'Modern JavaScript Features',
      lessons: [
        { title: 'ES6 Modules', content: '...' },
        { title: 'Destructuring and Spread Operator', content: '...' },
        { title: 'Advanced Array Methods', content: '...', quiz: { questions: [] } },
      ],
    },
    {
      title: 'Performance Optimization',
      lessons: [
        { title: 'Memoization', content: '...' },
        { title: 'Code Splitting', content: '...' },
      ],
    },
  ],
};

export default function CoursePreviewPage() {
  const router = useRouter();
  // In a real scenario, this data would come from props, context, or a store
  const [courseData, setCourseData] = useState<CourseStructure | null>(null); // Initialize with null

  useEffect(() => {
    // Retrieve course data from sessionStorage
    const storedData = sessionStorage.getItem('generatedCourseData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as CourseStructure;
        setCourseData(parsedData);
        // Optional: Clean up sessionStorage after retrieving the data
        // sessionStorage.removeItem('generatedCourseData');
      } catch (error) {
        console.error('Failed to parse course data from sessionStorage:', error);
        // Handle error, e.g., redirect or show an error message
        setCourseData(null); // Or set to MOCK_COURSE_DATA for fallback during dev
      }
    } else {
      // Handle case where no data is found, maybe redirect or show placeholder
      console.warn('No course data found in sessionStorage. Displaying mock data or empty state.');
      // setCourseData(MOCK_COURSE_DATA); // Fallback to mock data if needed for development
    }
  }, []);

  const handleSaveCourse = () => {
    // TODO: Implement save course logic (e.g., API call to Supabase)
    console.log('Saving course:', courseData);
    alert('Save functionality not implemented yet.');
  };

  if (!courseData) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
        <p>Loading course data or no data available...</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/courses/new">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create a New Course
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {/* Add other actions if needed, e.g., Edit button */}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <CardTitle className="text-3xl font-bold tracking-tight">{courseData.title}</CardTitle>
            <Badge 
              variant={courseData.difficulty === 'beginner' ? 'default' : courseData.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
              className="capitalize text-sm whitespace-nowrap"
            >
              {courseData.difficulty}
            </Badge>
          </div>
          <CardDescription className="mt-1 text-muted-foreground">
            Review the generated course structure below. You can save it once you are satisfied.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-2">
          <Separator className="my-4" />
          <h3 className="text-xl font-semibold mb-3 text-foreground">Course Outline</h3>
          <Accordion type="multiple" className="w-full space-y-2">
            {courseData.chapters.map((chapter, chapterIndex) => (
              <AccordionItem value={`chapter-${chapterIndex}`} key={chapterIndex} className="bg-muted/30 dark:bg-muted/20 rounded-lg border px-4">
                <AccordionTrigger className="text-lg font-medium hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-primary">Chapter {chapterIndex + 1}:</span>
                    <span>{chapter.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 pl-2 pr-0">
                  <ul className="space-y-2 list-inside">
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <li key={lessonIndex} className="flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground">
                            Lesson {lessonIndex + 1}: {lesson.title}
                          </span>
                        </div>
                        {lesson.quiz && lesson.quiz.questions.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <BookCheck className="mr-1 h-3 w-3" /> Quiz
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>

        <CardFooter className="border-t pt-6 mt-4 flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => router.push('/dashboard/courses/new')}>Generate New</Button>
          <Button onClick={handleSaveCourse} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="mr-2 h-4 w-4" />
            Save Course
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
