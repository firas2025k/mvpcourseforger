// app/dashboard/courses/preview/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookCheck,
  FileText,
  Save,
  ChevronRight,
  File,
  Sparkles,
  Loader2,
  User,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
}

interface AiLesson {
  title: string;
  content: string;
  quiz?: {
    questions: QuizQuestion[];
  };
}

interface AiChapter {
  title: string;
  lessons: AiLesson[];
}

interface GeminiJsonOutput {
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  chapters: AiChapter[];
}

interface GeneratedCoursePayload {
  originalPrompt?: string;
  originalChapterCount?: number;
  originalLessonsPerChapter?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  sourceDocument?: {
    filename: string;
    title?: string;
    author?: string;
    pageCount: number;
  };
  aiGeneratedCourse?: GeminiJsonOutput;
  success?: boolean;
  courseId?: string;
  courseTitle?: string;
  creditCost?: number;
  chaptersGenerated?: number;
  lessonsGenerated?: number;
  redirectUrl?: string;
}

interface DatabaseCourse {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prompt: string;
  chapter_count: number;
  lessons_per_chapter: number;
  credit_cost: number;
  chapters: {
    id: string;
    title: string;
    order_index: number;
    lessons: {
      id: string;
      title: string;
      content: string;
      order_index: number;
      quizzes?: {
        id: string;
        question: string;
        correct_answer: string;
        wrong_answers: string[];
      }[];
    }[];
  }[];
}

export default function EnhancedCoursePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [courseData, setCourseData] = useState<GeneratedCoursePayload | null>(null);
  const [databaseCourse, setDatabaseCourse] = useState<DatabaseCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourseData = async () => {
      setIsLoading(true);
      setError(null);
      console.log("Starting to load course data...");

      try {
        // Try to load from sessionStorage first
        const storedData = sessionStorage.getItem("generatedCourseData");
        console.log("SessionStorage data:", storedData);
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData) as GeneratedCoursePayload;
            console.log("Parsed course data:", parsedData);
            if (parsedData.aiGeneratedCourse || parsedData.courseTitle) {
              setCourseData(parsedData);
              console.log("Course data set from sessionStorage:", parsedData);
            } else {
              setError("Invalid course data found. Please generate a new course.");
              console.log("Invalid sessionStorage data structure");
            }
          } catch (parseError) {
            console.error("Parse error:", parseError);
            setError("Failed to parse course data. Please generate a new course.");
          }
        } else {
          console.log("No sessionStorage data found");
        }

        // Fallback to database if courseId is provided
        if (courseId && !courseData) {
          console.log("Fetching course from database with ID:", courseId);
          const response = await fetch(`/api/courses/${courseId}`);
          if (response.ok) {
            const dbCourse = await response.json() as DatabaseCourse;
            setDatabaseCourse(dbCourse);
            console.log("Database course loaded:", dbCourse);
          } else {
            console.error("Database fetch failed:", response.statusText);
            setError("Failed to load saved course data.");
          }
        }
      } catch (fetchError) {
        console.error("General fetch error:", fetchError);
        setError("Failed to load course data.");
      }

      setIsLoading(false);
      console.log("Loading complete, courseData:", courseData, "databaseCourse:", databaseCourse);
    };

    loadCourseData();
  }, [courseId]);

  const handleSaveCourse = async () => {
    if (!courseData || !courseData.aiGeneratedCourse) {
      toast.error("No course data to save.", {
        description: "Please generate a course first.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/save-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: courseData.originalPrompt,
          originalChapterCount: courseData.originalChapterCount,
          originalLessonsPerChapter: courseData.originalLessonsPerChapter,
          difficulty: courseData.aiGeneratedCourse.difficulty || "beginner",
          aiGeneratedCourse: courseData.aiGeneratedCourse,
          creditCost: courseData.creditCost,
          sourceDocument: courseData.sourceDocument,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Course saved successfully!`, { description: `Course ID: ${result.courseId}` });
        sessionStorage.removeItem("generatedCourseData");
        router.push(`/dashboard/courses/${result.courseId}`);
      } else {
        console.error("Save failed:", result);
        toast.error(`Error saving course:`, { description: result.error || "Unknown error" });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred", { description: "Please try again while saving." });
    }
    setIsSaving(false);
  };

  const getCourseTitle = (): string => {
    if (databaseCourse) return databaseCourse.title;
    return courseData?.aiGeneratedCourse?.title || courseData?.courseTitle || "Untitled Course";
  };

  const getCourseDifficulty = (): "beginner" | "intermediate" | "advanced" => {
    if (databaseCourse) return databaseCourse.difficulty;
    return courseData?.aiGeneratedCourse?.difficulty || courseData?.difficulty || "beginner";
  };

  const getCourseChapters = (): AiChapter[] => {
    if (databaseCourse) {
      return databaseCourse.chapters
        .sort((a, b) => a.order_index - b.order_index)
        .map(chapter => ({
          title: chapter.title,
          lessons: chapter.lessons
            .sort((a, b) => a.order_index - b.order_index)
            .map(lesson => ({
              title: lesson.title,
              content: lesson.content || "",
              quiz: lesson.quizzes && lesson.quizzes.length > 0 ? {
                questions: lesson.quizzes.map(quiz => ({
                  question: quiz.question,
                  choices: [quiz.correct_answer, ...quiz.wrong_answers],
                  answer: quiz.correct_answer,
                })),
              } : undefined,
            })),
        }));
    }
    return courseData?.aiGeneratedCourse?.chapters || [];
  };

  const getOriginalPrompt = (): string | null => {
    if (databaseCourse) return databaseCourse.prompt;
    return courseData?.originalPrompt || null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading course data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/courses/new">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create a New Course
          </Link>
        </Button>
      </div>
    );
  }

  if (!courseData && !databaseCourse) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
        <p>No course data available...</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/courses/new">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create a New Course
          </Link>
        </Button>
      </div>
    );
  }

  const courseTitle = getCourseTitle();
  const courseDifficulty = getCourseDifficulty();
  const courseChapters = getCourseChapters();
  const originalPrompt = getOriginalPrompt();
  const isPdfSourced = !!courseData?.sourceDocument;
  const isPromptSourced = !isPdfSourced && originalPrompt;
  const isFromDatabase = !!databaseCourse;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold tracking-tight">
                {courseTitle}
              </CardTitle>
              <div className="mt-3 space-y-2">
                {isPdfSourced && courseData?.sourceDocument && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <File className="h-4 w-4" />
                    <span>Generated from PDF: {courseData.sourceDocument.filename}</span>
                  </div>
                )}
                {isPromptSourced && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Generated from prompt</span>
                  </div>
                )}
                {isFromDatabase && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookCheck className="h-4 w-4" />
                    <span>Saved course</span>
                  </div>
                )}
              </div>
            </div>
            <Badge
              variant={
                courseDifficulty === "beginner"
                  ? "default"
                  : courseDifficulty === "intermediate"
                  ? "secondary"
                  : "destructive"
              }
              className="capitalize text-sm whitespace-nowrap"
            >
              {courseDifficulty}
            </Badge>
          </div>
          <CardDescription className="mt-1 text-muted-foreground">
            {isFromDatabase
              ? "This course has been saved and is ready for use."
              : "Review the generated course structure below. You can save it once you are satisfied."
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          {isPdfSourced && courseData?.sourceDocument && (
            <Card className="bg-muted/30 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Source Document
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Filename</p>
                      <p className="text-muted-foreground">{courseData.sourceDocument.filename}</p>
                    </div>
                  </div>
                  {courseData.sourceDocument.author && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Author</p>
                        <p className="text-muted-foreground">{courseData.sourceDocument.author}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Pages</p>
                      <p className="text-muted-foreground">{courseData.sourceDocument.pageCount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {originalPrompt && (
            <Card className="bg-muted/30 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Original Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground italic">"{originalPrompt}"</p>
              </CardContent>
            </Card>
          )}
          <Separator className="my-4" />
          <h3 className="text-xl font-semibold mb-3 text-foreground">Course Outline</h3>
          {courseChapters.length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-2">
              {courseChapters.map((chapter, chapterIndex) => (
                <AccordionItem
                  value={`chapter-${chapterIndex}`}
                  key={chapterIndex}
                  className="bg-muted/30 dark:bg-muted/20 rounded-lg border px-4"
                >
                  <AccordionTrigger className="text-lg font-medium hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-primary">Chapter {chapterIndex + 1}:</span>
                      <span>{chapter.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3 pl-2 pr-0">
                    <ul className="space-y-2 list-inside">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <li
                          key={lessonIndex}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground">Lesson {lessonIndex + 1}: {lesson.title}</span>
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No course content available.</p>
            </div>
          )}
          {courseChapters.length > 0 && (
            <Card className="bg-muted/30 mt-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{courseChapters.length}</p>
                    <p className="text-sm text-muted-foreground">Chapters</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {courseChapters.reduce((total, chapter) => total + chapter.lessons.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Lessons</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {courseChapters.reduce(
                        (total, chapter) =>
                          total + chapter.lessons.reduce(
                            (lessonTotal, lesson) => lessonTotal + (lesson.quiz?.questions.length || 0),
                            0
                          ),
                        0
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Quiz Questions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary capitalize">{courseDifficulty}</p>
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>

        <CardFooter className="border-t pt-6 mt-4 flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/courses/new")}
          >
            Generate New
          </Button>
          {!isFromDatabase && (
            <Button
              onClick={handleSaveCourse}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Course"}
            </Button>
          )}
          {isFromDatabase && (
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto"
            >
              <ChevronRight className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}