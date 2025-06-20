"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  User,
  Hash,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Enhanced interfaces to support PDF-sourced courses
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

// Enhanced interface to support PDF source information
interface GeneratedCoursePayload {
  originalPrompt: string;
  originalChapterCount: number;
  originalLessonsPerChapter: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  sourceDocument?: {
    filename: string;
    title?: string;
    author?: string;
    pageCount: number;
  };
  aiGeneratedCourse: GeminiJsonOutput;
}

export default function EnhancedCoursePreviewPage() {
  const router = useRouter();
  const [courseData, setCourseData] = useState<GeneratedCoursePayload | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem("generatedCourseData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as GeneratedCoursePayload;
        setCourseData(parsedData);
      } catch (error) {
        console.error(
          "Failed to parse course data from sessionStorage:",
          error
        );
        setCourseData(null);
      }
    } else {
      console.warn("No course data found in sessionStorage.");
    }
  }, []);

  const handleSaveCourse = async () => {
    if (!courseData) {
      toast.error("No course data to save.", {
        description: "Please generate a course first.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/save-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Course saved successfully!`, {
          description: `Course ID: ${result.courseId}`,
        });
        sessionStorage.removeItem("generatedCourseData");
        router.push("/dashboard");
      } else {
        console.error("Failed to save course:", result);
        toast.error(`Error saving course:`, {
          description: result.error || "Unknown error occurred.",
        });
      }
    } catch (error) {
      console.error("Error during save operation:", error);
      toast.error("An unexpected error occurred", {
        description: "Please try again while saving the course.",
      });
    }
    setIsSaving(false);
  };

  const isPdfSourced = courseData?.sourceDocument !== undefined;
  const isPromptSourced = !isPdfSourced;

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
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold tracking-tight">
                {courseData.aiGeneratedCourse.title}
              </CardTitle>

              {/* Source Information */}
              <div className="mt-3 space-y-2">
                {isPdfSourced && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <File className="h-4 w-4" />
                    <span>
                      Generated from PDF: {courseData.sourceDocument!.filename}
                    </span>
                  </div>
                )}

                {isPromptSourced && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Generated from prompt</span>
                  </div>
                )}
              </div>
            </div>

            <Badge
              variant={
                courseData.difficulty === "beginner"
                  ? "default"
                  : courseData.difficulty === "intermediate"
                  ? "secondary"
                  : "destructive"
              }
              className="capitalize text-sm whitespace-nowrap"
            >
              {courseData.difficulty}
            </Badge>
          </div>

          <CardDescription className="mt-1 text-muted-foreground">
            Review the generated course structure below. You can save it once
            you are satisfied.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          {/* PDF Source Metadata */}
          {isPdfSourced && courseData.sourceDocument && (
            <>
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
                        <p className="text-muted-foreground">
                          {courseData.sourceDocument.filename}
                        </p>
                      </div>
                    </div>

                    {courseData.sourceDocument.author && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Author</p>
                          <p className="text-muted-foreground">
                            {courseData.sourceDocument.author}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pages</p>
                        <p className="text-muted-foreground">
                          {courseData.sourceDocument.pageCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Original Prompt for prompt-based courses */}
          {isPromptSourced && (
            <>
              <Card className="bg-muted/30 mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Original Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground italic">
                    "{courseData.originalPrompt}"
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          <Separator className="my-4" />
          <h3 className="text-xl font-semibold mb-3 text-foreground">
            Course Outline
          </h3>
          <Accordion type="multiple" className="w-full space-y-2">
            {courseData.aiGeneratedCourse.chapters.map(
              (chapter, chapterIndex) => (
                <AccordionItem
                  value={`chapter-${chapterIndex}`}
                  key={chapterIndex}
                  className="bg-muted/30 dark:bg-muted/20 rounded-lg border px-4"
                >
                  <AccordionTrigger className="text-lg font-medium hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-primary">
                        Chapter {chapterIndex + 1}:
                      </span>
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
              )
            )}
          </Accordion>

          {/* Course Statistics */}
          <Card className="bg-muted/30 mt-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {courseData.aiGeneratedCourse.chapters.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Chapters</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {courseData.aiGeneratedCourse.chapters.reduce(
                      (total, chapter) => total + chapter.lessons.length,
                      0
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {courseData.aiGeneratedCourse.chapters.reduce(
                      (total, chapter) =>
                        total +
                        chapter.lessons.reduce(
                          (lessonTotal, lesson) =>
                            lessonTotal + (lesson.quiz?.questions.length || 0),
                          0
                        ),
                      0
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quiz Questions
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary capitalize">
                    {courseData.difficulty}
                  </p>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>

        <CardFooter className="border-t pt-6 mt-4 flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/courses/new")}
          >
            Generate New
          </Button>
          <Button
            onClick={handleSaveCourse}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Course"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
