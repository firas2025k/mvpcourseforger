"use client";

import { useState, useEffect, useMemo } from "react";
import { FullCourseData, Chapter, Lesson, Quiz } from "@/types/course";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  CheckCircle,
  XCircle,
  Edit3,
  Eye,
  ArrowLeft,
  Award,
  Clock,
  Target,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useRouter } from "next/navigation";
import LessonEditor from "./LessonEditor";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CourseLayoutClientProps {
  courseData: FullCourseData;
}

interface FlattenedLesson {
  chapterId: string;
  chapterOrderIndex: number;
  lessonId: string;
  lessonOrderIndex: number;
  lesson: Lesson;
}

interface QuizFeedback {
  isCorrect: boolean;
  selectedAnswer: string;
}

export default function CourseLayoutClient({
  courseData,
}: CourseLayoutClientProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [accordionDefaultValue, setAccordionDefaultValue] = useState<
    string | undefined
  >(undefined);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [quizFeedback, setQuizFeedback] = useState<
    Record<string, QuizFeedback | null>
  >({});
  const [lessonCompletionStatus, setLessonCompletionStatus] = useState<
    Record<string, boolean>
  >({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [lessonContent, setLessonContent] = useState<Record<string, string>>(
    {}
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem("course-sidebar-collapsed");
    if (savedSidebarState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedSidebarState));
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "course-sidebar-collapsed",
      JSON.stringify(isSidebarCollapsed)
    );
  }, [isSidebarCollapsed]);

  useEffect(() => {
    setQuizFeedback({});
    setSelectedAnswers({});
  }, [selectedLessonId]);

  useEffect(() => {
    if (courseData?.chapters && courseData.chapters.length > 0) {
      const firstChapter = courseData.chapters[0];
      if (!selectedChapterId) setSelectedChapterId(firstChapter.id);
      if (!accordionDefaultValue)
        setAccordionDefaultValue(`chapter-${firstChapter.id}`);
      if (
        !selectedLessonId &&
        firstChapter.lessons &&
        firstChapter.lessons.length > 0
      ) {
        setSelectedLessonId(firstChapter.lessons[0].id);
      }
    }
  }, [courseData]);

  useEffect(() => {
    const fetchLessonProgress = async () => {
      if (!courseData?.id) return;
      setIsLoadingProgress(true);
      try {
        const response = await fetch(
          `/api/lesson-progress?courseId=${courseData.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch lesson progress");
        }
        const progressData: Record<string, boolean> = await response.json();
        setLessonCompletionStatus(progressData);
      } catch (error) {
        console.error("Error fetching lesson progress:", error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    fetchLessonProgress();
  }, [courseData?.id]);

  const handleLessonClick = (chapterId: string, lessonId: string) => {
    if (selectedLessonId !== lessonId || selectedChapterId !== chapterId) {
      setSelectedChapterId(chapterId);
      setSelectedLessonId(lessonId);
      if (selectedChapterId !== chapterId) {
        setAccordionDefaultValue(`chapter-${chapterId}`);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const truncateTitle = (title: string, maxLength: number = 45) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + "...";
  };

  const selectedChapter = courseData.chapters?.find(
    (c) => c.id === selectedChapterId
  );
  const selectedLesson = selectedChapter?.lessons?.find(
    (l) => l.id === selectedLessonId
  );

  const flattenedLessons: FlattenedLesson[] = useMemo(() => {
    if (!courseData.chapters) return [];
    const lessons: FlattenedLesson[] = [];
    courseData.chapters
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      .forEach((chapter) => {
        (chapter.lessons || [])
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .forEach((lesson) => {
            lessons.push({
              chapterId: chapter.id,
              chapterOrderIndex: chapter.order_index,
              lessonId: lesson.id,
              lessonOrderIndex: lesson.order_index,
              lesson: lesson,
            });
          });
      });
    return lessons;
  }, [courseData.chapters]);

  const currentFlattenedLessonIndex = useMemo(() => {
    if (!selectedLessonId || !selectedChapterId) return -1;
    return flattenedLessons.findIndex(
      (fl) =>
        fl.lessonId === selectedLessonId && fl.chapterId === selectedChapterId
    );
  }, [flattenedLessons, selectedChapterId, selectedLessonId]);

  const isLastLesson =
    currentFlattenedLessonIndex === flattenedLessons.length - 1;

  const handlePreviousLesson = () => {
    if (currentFlattenedLessonIndex > 0) {
      const previousFlattenedLesson =
        flattenedLessons[currentFlattenedLessonIndex - 1];
      handleLessonClick(
        previousFlattenedLesson.chapterId,
        previousFlattenedLesson.lessonId
      );
    }
  };

  const handleCompleteCourse = async () => {
    if (selectedLessonId && !lessonCompletionStatus[selectedLessonId]) {
      await handleToggleLessonComplete(selectedLessonId);
    }
    try {
      const response = await fetch("/api/complete-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: courseData.id }),
      });
      if (!response.ok) {
        console.error(
          "Failed to update course completion:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error updating course completion:", error);
    }
    router.push("/dashboard");
  };

  const handleNextLesson = async () => {
    if (
      currentFlattenedLessonIndex !== -1 &&
      currentFlattenedLessonIndex < flattenedLessons.length - 1
    ) {
      if (selectedLessonId && !lessonCompletionStatus[selectedLessonId]) {
        await handleToggleLessonComplete(selectedLessonId);
      }
      const nextFlattenedLesson =
        flattenedLessons[currentFlattenedLessonIndex + 1];
      handleLessonClick(
        nextFlattenedLesson.chapterId,
        nextFlattenedLesson.lessonId
      );
    }
  };

  const handleToggleLessonComplete = async (lessonId: string) => {
    const currentStatus = !!lessonCompletionStatus[lessonId];
    setLessonCompletionStatus((prev) => ({
      ...prev,
      [lessonId]: !currentStatus,
    }));
    try {
      const response = await fetch("/api/lesson-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          isCompleted: !currentStatus,
          courseId: courseData.id,
        }),
      });
      if (!response.ok) {
        setLessonCompletionStatus((prev) => ({
          ...prev,
          [lessonId]: currentStatus,
        }));
        console.error(
          "Failed to update lesson progress:",
          await response.text()
        );
      }
    } catch (error) {
      setLessonCompletionStatus((prev) => ({
        ...prev,
        [lessonId]: currentStatus,
      }));
      console.error("Error updating lesson progress:", error);
    }
  };

  const totalLessons = useMemo(() => {
    return (
      courseData.chapters?.reduce(
        (acc, chapter) => acc + (chapter.lessons?.length || 0),
        0
      ) || 0
    );
  }, [courseData.chapters]);

  const completedLessonsCount = useMemo(() => {
    return Object.values(lessonCompletionStatus).filter(
      (isCompleted) => isCompleted
    ).length;
  }, [lessonCompletionStatus]);

  const progressPercentage = useMemo(() => {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessonsCount / totalLessons) * 100);
  }, [completedLessonsCount, totalLessons]);

  const handleCheckAnswer = (quizId: string, correctAnswer: string) => {
    const selectedAnswer = selectedAnswers[quizId];
    if (selectedAnswer) {
      setQuizFeedback((prev) => ({
        ...prev,
        [quizId]: {
          isCorrect: selectedAnswer === correctAnswer,
          selectedAnswer: selectedAnswer,
        },
      }));
    }
  };

  return (
    <TooltipProvider>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-var(--header-height,64px))] w-full"
      >
        <ResizablePanel
          defaultSize={isSidebarCollapsed ? 6 : 25}
          minSize={isSidebarCollapsed ? 6 : 20}
          maxSize={isSidebarCollapsed ? 6 : 35}
          className={`transition-all duration-300 ${
            isSidebarCollapsed ? "min-w-[70px] max-w-[70px]" : ""
          }`}
        >
          <div
            className={`h-full border-r bg-slate-50/50 dark:bg-slate-900/50 relative transition-all duration-300 ${
              isSidebarCollapsed ? "w-[70px]" : "w-full"
            }`}
          >
            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="absolute top-4 right-2 z-10 h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            <ScrollArea
              className={`h-full ${isSidebarCollapsed ? "p-2" : "p-4"}`}
            >
              {isSidebarCollapsed ? (
                /* Collapsed Sidebar */
                <div className="flex flex-col items-center space-y-3 mt-10">
                  {/* Compact Progress */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {progressPercentage}%
                    </span>
                  </div>

                  {/* Compact Chapters */}
                  {courseData.chapters && courseData.chapters.length > 0 && (
                    <div className="space-y-3 w-full flex flex-col items-center">
                      {courseData.chapters
                        ?.sort(
                          (a, b) => (a.order_index || 0) - (b.order_index || 0)
                        )
                        ?.map((chapter) => (
                          <Tooltip key={chapter.id}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center space-y-1">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    selectedChapterId === chapter.id
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {chapter.order_index}
                                </div>
                                {/* Lesson indicators */}
                                <div className="flex flex-col space-y-1 items-center">
                                  {(chapter.lessons || [])
                                    ?.sort(
                                      (a, b) =>
                                        (a.order_index || 0) -
                                        (b.order_index || 0)
                                    )
                                    ?.map((lesson) => (
                                      <Tooltip key={lesson.id}>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() =>
                                              handleLessonClick(
                                                chapter.id,
                                                lesson.id
                                              )
                                            }
                                            className={`w-3 h-3 rounded-full transition-colors ${
                                              selectedLessonId === lesson.id
                                                ? "bg-blue-600"
                                                : lessonCompletionStatus[
                                                    lesson.id
                                                  ]
                                                ? "bg-green-500"
                                                : "bg-slate-300 dark:bg-slate-600"
                                            }`}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                          <p className="font-medium">
                                            Lesson {lesson.order_index}
                                          </p>
                                          <p className="text-sm text-white dark:text-white">
                                            {lesson.title}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="font-medium">
                                Chapter {chapter.order_index}
                              </p>
                              <p className="text-sm text-muted-foreground dark:text-white dark:font-medium">
                                {chapter.title.replace(
                                  /^Chapter\s*\d*:\s*/i,
                                  ""
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Expanded Sidebar */
                <>
                  {/* Course Header */}
                  <div className="mb-6 mt-8">
                    <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 leading-tight pr-8">
                      {courseData.title}
                    </h2>

                    {/* Progress Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Progress
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {progressPercentage}%
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={progressPercentage}
                        className="h-3 bg-slate-200 dark:bg-slate-700"
                      />
                      <div className="flex justify-between items-center mt-2 text-xs text-slate-600 dark:text-slate-400">
                        <span>
                          {completedLessonsCount} of {totalLessons} lessons
                        </span>
                        <span>
                          {totalLessons - completedLessonsCount} remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  {courseData.chapters && courseData.chapters.length > 0 ? (
                    <Accordion
                      type="single"
                      collapsible
                      value={accordionDefaultValue}
                      onValueChange={setAccordionDefaultValue}
                      key={accordionDefaultValue}
                    >
                      {courseData.chapters
                        ?.sort(
                          (a, b) => (a.order_index || 0) - (b.order_index || 0)
                        )
                        ?.map((chapter) => (
                          <AccordionItem
                            value={`chapter-${chapter.id}`}
                            key={chapter.id}
                            className="border-none"
                          >
                            <AccordionTrigger className="text-base font-semibold hover:no-underline px-4 py-4 bg-white dark:bg-slate-800 rounded-lg mb-2 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {chapter.order_index}
                                  </span>
                                </div>
                                <span className="text-left">
                                  {(() => {
                                    const cleanedTitle = chapter.title.replace(
                                      /^Chapter\s*\d*:\s*/i,
                                      ""
                                    );
                                    return truncateTitle(cleanedTitle, 35);
                                  })()}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pb-4">
                              <ul className="space-y-2 ml-2">
                                {(chapter.lessons || [])
                                  ?.sort(
                                    (a, b) =>
                                      (a.order_index || 0) -
                                      (b.order_index || 0)
                                  )
                                  ?.map((lesson) => {
                                    const fullTitle = `Lesson ${lesson.order_index}: ${lesson.title}`;
                                    const truncatedTitle = truncateTitle(
                                      fullTitle,
                                      40
                                    );
                                    const isCurrentLesson =
                                      selectedLessonId === lesson.id;

                                    return (
                                      <li key={lesson.id}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant={
                                                isCurrentLesson
                                                  ? "default"
                                                  : "ghost"
                                              }
                                              className={`w-full justify-start text-sm h-auto py-3 px-4 whitespace-normal text-left flex items-center rounded-lg transition-all duration-200 ${
                                                isCurrentLesson
                                                  ? "bg-blue-600 text-white shadow-md"
                                                  : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                              }`}
                                              onClick={() =>
                                                handleLessonClick(
                                                  chapter.id,
                                                  lesson.id
                                                )
                                              }
                                            >
                                              <div className="flex items-center gap-3 w-full">
                                                {lessonCompletionStatus[
                                                  lesson.id
                                                ] ? (
                                                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                ) : (
                                                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
                                                )}
                                                <div className="flex-grow min-w-0">
                                                  <div className="font-medium">
                                                    {truncatedTitle}
                                                  </div>
                                                </div>
                                              </div>
                                            </Button>
                                          </TooltipTrigger>
                                          {fullTitle !== truncatedTitle && (
                                            <TooltipContent>
                                              <p className="max-w-xs">
                                                {fullTitle}
                                              </p>
                                            </TooltipContent>
                                          )}
                                        </Tooltip>
                                      </li>
                                    );
                                  })}
                                {(!chapter.lessons ||
                                  chapter.lessons.length === 0) && (
                                  <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 italic">
                                    No lessons in this chapter.
                                  </li>
                                )}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No chapters in this course yet.
                      </p>
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={isSidebarCollapsed ? 94 : 75}>
          <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <Button variant="outline" size="sm" asChild className="mb-4">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/dashboard"
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/dashboard/courses/${courseData.id}`}
                      className="text-slate-900 dark:text-slate-100 font-medium"
                    >
                      {courseData.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-grow">
              {selectedLesson ? (
                <article className="max-w-4xl mx-auto px-8 py-8">
                  {/* Lesson Header */}
                  <div className="mb-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-grow">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
                          {selectedLesson.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              Chapter {selectedChapter?.order_index} • Lesson{" "}
                              {selectedLesson.order_index}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isEditMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsEditMode(!isEditMode)}
                        className="ml-6 flex-shrink-0"
                      >
                        {isEditMode ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Completion Checkbox */}
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Checkbox
                        id={`complete-${selectedLesson.id}`}
                        checked={!!lessonCompletionStatus[selectedLesson.id]}
                        onCheckedChange={() =>
                          handleToggleLessonComplete(selectedLesson.id)
                        }
                        disabled={isLoadingProgress}
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor={`complete-${selectedLesson.id}`}
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2"
                      >
                        {lessonCompletionStatus[selectedLesson.id] ? (
                          <>
                            <Award className="h-4 w-4 text-green-600" />
                            Lesson completed
                          </>
                        ) : (
                          "Mark lesson as complete"
                        )}
                      </Label>
                    </div>
                  </div>

                  {/* Content */}
                  {isEditMode ? (
                    <div className="mb-12">
                      <LessonEditor
                        lessonId={selectedLesson.id}
                        initialContent={
                          lessonContent[selectedLesson.id] ||
                          selectedLesson.content ||
                          ""
                        }
                        onContentChange={(content) => {
                          setLessonContent((prev) => ({
                            ...prev,
                            [selectedLesson.id]: content,
                          }));
                        }}
                      />
                    </div>
                  ) : (
                    <div className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700">
                      {lessonContent[selectedLesson.id] ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: lessonContent[selectedLesson.id],
                          }}
                        />
                      ) : selectedLesson.content ? (
                        selectedLesson.content.includes("<") &&
                        selectedLesson.content.includes(">") ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedLesson.content,
                            }}
                          />
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {selectedLesson.content.split(". ").join(".\n\n")}
                          </ReactMarkdown>
                        )
                      ) : (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                          <BookOpen className="h-16 w-16 mx-auto mb-6 text-slate-400" />
                          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            No content available
                          </h3>
                          <p className="text-slate-500 dark:text-slate-500">
                            Click "Edit" to add content to this lesson.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quiz Section */}
                  {selectedLesson.quizzes &&
                    selectedLesson.quizzes.length > 0 && (
                      <section className="mt-16 pt-8 border-t-2 border-slate-200 dark:border-slate-700">
                        <div className="mb-8">
                          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-4">
                              <HelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            Knowledge Check
                          </h2>
                          <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Test your understanding of the lesson content.
                          </p>
                        </div>

                        <div className="space-y-8">
                          {selectedLesson.quizzes.map((quiz, quizIndex) => {
                            const feedback = quizFeedback[quiz.id];
                            return (
                              <div
                                key={quiz.id}
                                className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700"
                              >
                                <div className="mb-6">
                                  <div className="flex items-start gap-4 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {quizIndex + 1}
                                      </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                                      {quiz.question}
                                    </h3>
                                  </div>
                                </div>

                                <RadioGroup
                                  value={selectedAnswers[quiz.id] || ""}
                                  onValueChange={(value) => {
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [quiz.id]: value,
                                    }));
                                    if (quizFeedback[quiz.id]) {
                                      setQuizFeedback((prev) => ({
                                        ...prev,
                                        [quiz.id]: null,
                                      }));
                                    }
                                  }}
                                  className="space-y-3 mb-6"
                                >
                                  {Array.isArray(quiz.options) &&
                                    quiz.options.map((option, index) => {
                                      let optionClasses =
                                        "group relative flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer";
                                      let iconElement = null;
                                      let labelClasses =
                                        "font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1";

                                      if (feedback) {
                                        if (
                                          option === feedback.selectedAnswer
                                        ) {
                                          if (feedback.isCorrect) {
                                            optionClasses +=
                                              " border-green-500 bg-green-50 dark:bg-green-900/20";
                                            iconElement = (
                                              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            );
                                            labelClasses =
                                              "font-medium text-green-800 dark:text-green-200 cursor-pointer flex-1";
                                          } else {
                                            optionClasses +=
                                              " border-red-500 bg-red-50 dark:bg-red-900/20";
                                            iconElement = (
                                              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                            );
                                            labelClasses =
                                              "font-medium text-red-800 dark:text-red-200 cursor-pointer flex-1";
                                          }
                                        } else if (
                                          option === quiz.correct_answer &&
                                          !feedback.isCorrect
                                        ) {
                                          optionClasses +=
                                            " border-green-500 bg-green-50 dark:bg-green-900/20";
                                          iconElement = (
                                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                          );
                                          labelClasses =
                                            "font-medium text-green-800 dark:text-green-200 cursor-pointer flex-1";
                                        } else {
                                          optionClasses +=
                                            " border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 opacity-75";
                                        }
                                      } else {
                                        optionClasses +=
                                          " border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20";
                                      }

                                      return (
                                        <div
                                          key={`${quiz.id}-option-${index}`}
                                          className={optionClasses}
                                        >
                                          <RadioGroupItem
                                            value={option}
                                            id={`${quiz.id}-option-${index}`}
                                            disabled={!!feedback}
                                            className="w-5 h-5"
                                          />
                                          <Label
                                            htmlFor={`${quiz.id}-option-${index}`}
                                            className={labelClasses}
                                          >
                                            {option}
                                          </Label>
                                          {iconElement && (
                                            <div className="ml-auto">
                                              {iconElement}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                </RadioGroup>

                                <div className="flex items-center justify-between">
                                  <Button
                                    onClick={() =>
                                      handleCheckAnswer(
                                        quiz.id,
                                        quiz.correct_answer
                                      )
                                    }
                                    disabled={
                                      !selectedAnswers[quiz.id] ||
                                      !!quizFeedback[quiz.id]
                                    }
                                    className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Check Answer
                                  </Button>

                                  {feedback && (
                                    <div
                                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                                        feedback.isCorrect
                                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                                      }`}
                                    >
                                      {feedback.isCorrect ? (
                                        <>
                                          <CheckCircle className="h-5 w-5" />
                                          <span>Correct!</span>
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="h-5 w-5" />
                                          <span>
                                            Incorrect - correct answer
                                            highlighted
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}
                </article>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="max-w-md">
                    <BookOpen className="w-20 h-20 mb-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <h2 className="text-2xl font-bold mb-4 text-slate-600 dark:text-slate-400">
                      No Lesson Selected
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-500 leading-relaxed">
                      {courseData.chapters && courseData.chapters.length > 0
                        ? "Select a lesson from the sidebar to view its content and start learning."
                        : "This course doesn't have any content yet. Start by adding chapters and lessons."}
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Navigation Footer */}
            {selectedLesson && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                  <Button
                    variant="outline"
                    onClick={handlePreviousLesson}
                    disabled={currentFlattenedLessonIndex <= 0}
                    className="flex items-center gap-2 px-6 py-2 font-medium"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous Lesson
                  </Button>

                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Chapter {selectedChapter?.order_index} • Lesson{" "}
                      {selectedLesson.order_index}
                    </span>
                  </div>

                  {isLastLesson ? (
                    <Button
                      onClick={handleCompleteCourse}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium"
                    >
                      Complete Course <Award className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextLesson}
                      disabled={
                        currentFlattenedLessonIndex === -1 ||
                        currentFlattenedLessonIndex >=
                          flattenedLessons.length - 1
                      }
                      className="flex items-center gap-2 px-6 py-2 font-medium"
                    >
                      Next Lesson <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
