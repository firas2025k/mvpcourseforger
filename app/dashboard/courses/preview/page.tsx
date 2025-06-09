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

// Interfaces matching the structure from /api/generate-course
interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
}

interface AiLesson {
  title: string;
  content: string; // We might not display full content here, but it's part of the structure
  quiz?: { // Quiz is optional
    questions: QuizQuestion[];
  };
}

interface AiChapter {
  title: string;
  lessons: AiLesson[];
}

// This is the structure of the AI-generated part of the course
interface GeminiJsonOutput {
  title: string; // Title from AI
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Difficulty from AI (echoed)
  chapters: AiChapter[];
}

// This is the full payload expected from sessionStorage
interface GeneratedCoursePayload {
  originalPrompt: string;
  originalChapterCount: number;
  originalLessonsPerChapter: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Original difficulty from user form
  aiGeneratedCourse: GeminiJsonOutput;
}

// Mock data has been removed as the page now fetches data from sessionStorage.

export default function CoursePreviewPage() {
  const router = useRouter();
  // In a real scenario, this data would come from props, context, or a store
  const [courseData, setCourseData] = useState<GeneratedCoursePayload | null>(null); // Initialize with null
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Retrieve course data from sessionStorage
    const storedData = sessionStorage.getItem('generatedCourseData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as GeneratedCoursePayload;
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

  const handleSaveCourse = async () => {
    if (!courseData) {
      alert('No course data to save.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/save-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Course saved successfully! Course ID: ${result.courseId}`);
        // Optionally, redirect the user, e.g., to the dashboard or the new course page
        // router.push('/dashboard/courses'); 
        // Or clear sessionStorage and allow generating a new course
        sessionStorage.removeItem('generatedCourseData');
        router.push('/dashboard/courses/new'); // Redirect to create new after saving
      } else {
        console.error('Failed to save course:', result);
        alert(`Error saving course: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during save operation:', error);
      alert('An unexpected error occurred while saving the course.');
    }
    setIsSaving(false);
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
            <CardTitle className="text-3xl font-bold tracking-tight">{courseData.aiGeneratedCourse.title}</CardTitle>
            <Badge 
              variant={courseData.difficulty === 'beginner' ? 'default' : courseData.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
              className="capitalize text-sm whitespace-nowrap"
            >
              {courseData.difficulty} {/* Displaying original difficulty from form */}
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
            {courseData.aiGeneratedCourse.chapters.map((chapter, chapterIndex) => (
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
          <Button onClick={handleSaveCourse} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Course'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
