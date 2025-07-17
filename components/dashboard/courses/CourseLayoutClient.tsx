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
  Sparkles,
  Star,
  TrendingUp,
  Zap,
  Brain,
  Lightbulb,
  Trophy,
  Bookmark,
  PlayCircle,
  FileText,
  GraduationCap,
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

// Import read aloud components
import { useReadAloud } from "@/hooks/useReadAloud";
import { ReadAloudButton } from "./ReadAloudButton";
import { ReadAloudControls } from "./ReadAloudControls";

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
  const [showReadAloudControls, setShowReadAloudControls] = useState(false);
  const router = useRouter();

  // Initialize read aloud hook
  const readAloud = useReadAloud();

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

  // Show/hide read aloud controls based on playback state
  useEffect(() => {
    setShowReadAloudControls(readAloud.isPlaying || readAloud.isPaused);
  }, [readAloud.isPlaying, readAloud.isPaused]);

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
      // Stop any current reading when switching lessons
      readAloud.stop();

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

  // Get lesson content for read aloud
  const getLessonContentForReading = () => {
    if (!selectedLesson) return "";

    // Use edited content if available, otherwise use original content
    const content =
      lessonContent[selectedLesson.id] || selectedLesson.content || "";

    // If it's HTML content, we'll let the hook handle the cleaning
    // If it's markdown, we'll also let the hook handle it
    return content;
  };

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
        className="h-[calc(100vh-var(--header-height,64px))] w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950"
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
            className={`h-full border-r border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative transition-all duration-300 ${
              isSidebarCollapsed ? "w-[70px]" : "w-full"
            }`}
          >
            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="absolute top-4 right-2 z-10 h-8 w-8 p-0 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:scale-110 transition-all duration-200 rounded-full"
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
                <div className="flex flex-col items-center space-y-4 mt-12">
                  {/* Compact Progress */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-xs font-bold text-white">
                        {progressPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Compact Chapters */}
                  {courseData.chapters && courseData.chapters.length > 0 && (
                    <div className="space-y-4 w-full flex flex-col items-center">
                      {courseData.chapters
                        ?.sort(
                          (a, b) => (a.order_index || 0) - (b.order_index || 0)
                        )
                        ?.map((chapter) => (
                          <Tooltip key={chapter.id}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center space-y-2">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110 ${
                                    selectedChapterId === chapter.id
                                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600"
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
                                            className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                                              selectedLessonId === lesson.id
                                                ? "bg-blue-600 shadow-lg"
                                                : lessonCompletionStatus[
                                                    lesson.id
                                                  ]
                                                ? "bg-green-500 shadow-md"
                                                : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
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
                  <div className="mb-8 mt-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              {courseData.title}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Interactive Learning Experience
                            </p>
                          </div>
                        </div>

                        {/* Enhanced Progress Section */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Learning Progress
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-yellow-500" />
                              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {progressPercentage}%
                              </span>
                            </div>
                          </div>

                          <div className="relative">
                            <Progress
                              value={progressPercentage}
                              className="h-3 bg-slate-200 dark:bg-slate-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{completedLessonsCount} completed</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>
                                {totalLessons - completedLessonsCount} remaining
                              </span>
                            </div>
                          </div>
                        </div>
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
                            className="border-none mb-3"
                          >
                            <AccordionTrigger className="text-base font-semibold hover:no-underline px-6 py-5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                  <span className="text-sm font-bold text-white">
                                    {chapter.order_index}
                                  </span>
                                </div>
                                <span className="text-left bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
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
                              <ul className="space-y-3 ml-2 mt-3">
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
                                    const isCompleted =
                                      lessonCompletionStatus[lesson.id];

                                    return (
                                      <li key={lesson.id}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              className={`w-full justify-start text-sm h-auto py-4 px-5 whitespace-normal text-left flex items-center rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                                                isCurrentLesson
                                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl"
                                                  : "hover:bg-slate-100/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:shadow-md"
                                              }`}
                                              onClick={() =>
                                                handleLessonClick(
                                                  chapter.id,
                                                  lesson.id
                                                )
                                              }
                                            >
                                              <div className="flex items-center gap-4 w-full">
                                                <div className="relative">
                                                  {isCompleted ? (
                                                    <div className="relative">
                                                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                                                      <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-30 animate-pulse"></div>
                                                    </div>
                                                  ) : (
                                                    <div
                                                      className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all duration-300 ${
                                                        isCurrentLesson
                                                          ? "border-white bg-white/20"
                                                          : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                                                      }`}
                                                    >
                                                      {isCurrentLesson && (
                                                        <PlayCircle className="h-4 w-4 text-white m-0.5" />
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                  <div className="font-medium flex items-center gap-2">
                                                    {truncatedTitle}
                                                    {isCurrentLesson && (
                                                      <Zap className="h-3 w-3 text-yellow-300 animate-pulse" />
                                                    )}
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
                                  <li className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="h-4 w-4" />
                                      No lessons in this chapter yet.
                                    </div>
                                  </li>
                                )}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  ) : (
                    <div className="px-4 py-12 text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20"></div>
                        <BookOpen className="relative h-16 w-16 mx-auto text-slate-400" />
                      </div>
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

        <ResizableHandle
          withHandle
          className="bg-slate-200/60 dark:bg-slate-700/60 hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors duration-200"
        />

        <ResizablePanel defaultSize={isSidebarCollapsed ? 94 : 75}>
          <div className="flex flex-col h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            {/* Enhanced Header */}
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mb-4 hover:shadow-md transition-all duration-200 group"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  Back to Dashboard
                </Link>
              </Button>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/dashboard"
                      className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
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

            {/* Read Aloud Controls - Show when active */}
            {showReadAloudControls && selectedLesson && (
              <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/80">
                <ReadAloudControls
                  readAloud={readAloud}
                  content={getLessonContentForReading()}
                />
              </div>
            )}

            {/* Enhanced Content Area */}
            <ScrollArea className="flex-grow">
              {selectedLesson ? (
                <article className="max-w-5xl mx-auto px-8 py-10">
                  {/* Enhanced Lesson Header */}
                  <div className="mb-12">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                              Chapter {selectedChapter?.order_index}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                              Lesson {selectedLesson.order_index}
                            </span>
                          </div>
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight mb-6">
                          {selectedLesson.title}
                        </h1>
                        <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Estimated reading: 5-10 min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            <span>Interactive content</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 flex-shrink-0 flex items-center gap-3">
                        {/* Read Aloud Button */}
                        <ReadAloudButton
                          readAloud={readAloud}
                          content={getLessonContentForReading()}
                          variant="outline"
                          size="sm"
                        />

                        {/* Edit Button */}
                        <Button
                          variant={isEditMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsEditMode(!isEditMode)}
                          className="hover:shadow-lg transition-all duration-300 group"
                        >
                          {isEditMode ? (
                            <>
                              <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                              Preview
                            </>
                          ) : (
                            <>
                              <Edit3 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                              Edit
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Enhanced Completion Checkbox */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl blur-xl"></div>
                      <div className="relative flex items-center space-x-4 p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <Checkbox
                          id={`complete-${selectedLesson.id}`}
                          checked={!!lessonCompletionStatus[selectedLesson.id]}
                          onCheckedChange={() =>
                            handleToggleLessonComplete(selectedLesson.id)
                          }
                          disabled={isLoadingProgress}
                          className="w-6 h-6 border-2"
                        />
                        <Label
                          htmlFor={`complete-${selectedLesson.id}`}
                          className="text-base font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-3"
                        >
                          {lessonCompletionStatus[selectedLesson.id] ? (
                            <>
                              <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-semibold">
                                  Lesson completed! Great job!
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Target className="h-5 w-5 text-blue-500" />
                              <span>Mark lesson as complete</span>
                            </div>
                          )}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Content */}
                  {isEditMode ? (
                    <div className="mb-16">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-3xl blur-xl"></div>
                        <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
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
                      </div>
                    </div>
                  ) : (
                    <div className="mb-16">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-3xl blur-2xl"></div>
                        <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl p-10 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                          <div className="prose prose-xl dark:prose-invert max-w-none prose-headings:bg-gradient-to-r prose-headings:from-slate-900 prose-headings:to-blue-900 dark:prose-headings:from-slate-100 dark:prose-headings:to-blue-100 prose-headings:bg-clip-text prose-headings:text-transparent prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:text-lg prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30 prose-code:px-3 prose-code:py-1 prose-code:rounded-lg prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700 prose-pre:rounded-xl prose-pre:shadow-lg prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:rounded-r-lg">
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
                                  {selectedLesson.content
                                    .split(". ")
                                    .join(".\n\n")}
                                </ReactMarkdown>
                              )
                            ) : (
                              <div className="text-center py-20">
                                <div className="relative mb-8">
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20"></div>
                                  <BookOpen className="relative h-20 w-20 mx-auto text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-400 mb-3">
                                  Ready to add content?
                                </h3>
                                <p className="text-lg text-slate-500 dark:text-slate-500 mb-6">
                                  Click "Edit" to start creating engaging lesson
                                  content.
                                </p>
                                <Button
                                  onClick={() => setIsEditMode(true)}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Start Editing
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Quiz Section */}
                  {selectedLesson.quizzes &&
                    selectedLesson.quizzes.length > 0 && (
                      <section className="mt-20">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-3xl blur-2xl"></div>
                          <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl p-10 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                            <div className="mb-10">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                  <Brain className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                    Knowledge Check
                                  </h2>
                                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                                    Test your understanding and reinforce your
                                    learning.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-10">
                              {selectedLesson.quizzes.map((quiz, quizIndex) => {
                                const feedback = quizFeedback[quiz.id];
                                return (
                                  <div key={quiz.id} className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-2xl blur-xl"></div>
                                    <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
                                      <div className="mb-8">
                                        <div className="flex items-start gap-5 mb-6">
                                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <span className="text-lg font-bold text-white">
                                              {quizIndex + 1}
                                            </span>
                                          </div>
                                          <div className="flex-grow">
                                            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                                              {quiz.question}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-3">
                                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                                Choose the best answer
                                              </span>
                                            </div>
                                          </div>
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
                                        className="space-y-4 mb-8"
                                      >
                                        {Array.isArray(quiz.options) &&
                                          quiz.options.map((option, index) => {
                                            let optionClasses =
                                              "group relative flex items-center space-x-5 p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02]";
                                            let iconElement = null;
                                            let labelClasses =
                                              "font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1 text-lg";

                                            if (feedback) {
                                              if (
                                                option ===
                                                feedback.selectedAnswer
                                              ) {
                                                if (feedback.isCorrect) {
                                                  optionClasses +=
                                                    " border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg";
                                                  iconElement = (
                                                    <div className="relative">
                                                      <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                                                      <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-30 animate-pulse"></div>
                                                    </div>
                                                  );
                                                  labelClasses =
                                                    "font-semibold text-green-800 dark:text-green-200 cursor-pointer flex-1 text-lg";
                                                } else {
                                                  optionClasses +=
                                                    " border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 shadow-lg";
                                                  iconElement = (
                                                    <div className="relative">
                                                      <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                                                      <div className="absolute inset-0 bg-red-400 rounded-full blur opacity-30 animate-pulse"></div>
                                                    </div>
                                                  );
                                                  labelClasses =
                                                    "font-semibold text-red-800 dark:text-red-200 cursor-pointer flex-1 text-lg";
                                                }
                                              } else if (
                                                option ===
                                                  quiz.correct_answer &&
                                                !feedback.isCorrect
                                              ) {
                                                optionClasses +=
                                                  " border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg";
                                                iconElement = (
                                                  <div className="relative">
                                                    <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                                                    <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-30 animate-pulse"></div>
                                                  </div>
                                                );
                                                labelClasses =
                                                  "font-semibold text-green-800 dark:text-green-200 cursor-pointer flex-1 text-lg";
                                              } else {
                                                optionClasses +=
                                                  " border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 opacity-75";
                                              }
                                            } else {
                                              optionClasses +=
                                                " border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:shadow-md";
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
                                                  className="w-6 h-6 border-2"
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
                                          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105"
                                        >
                                          <HelpCircle className="h-4 w-4 mr-2" />
                                          Check Answer
                                        </Button>

                                        {feedback && (
                                          <div
                                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg ${
                                              feedback.isCorrect
                                                ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200"
                                                : "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-200"
                                            }`}
                                          >
                                            {feedback.isCorrect ? (
                                              <>
                                                <Star className="h-5 w-5 text-yellow-500" />
                                                <span>
                                                  Excellent! Correct answer!
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <Lightbulb className="h-5 w-5" />
                                                <span>
                                                  Not quite - see the correct
                                                  answer above
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </section>
                    )}
                </article>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="max-w-lg">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-20"></div>
                      <BookOpen className="relative w-24 h-24 text-slate-300 dark:text-slate-600 mx-auto" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-600 to-blue-600 dark:from-slate-400 dark:to-blue-400 bg-clip-text text-transparent">
                      Ready to start learning?
                    </h2>
                    <p className="text-xl text-slate-500 dark:text-slate-500 leading-relaxed mb-8">
                      {courseData.chapters && courseData.chapters.length > 0
                        ? "Select a lesson from the sidebar to begin your learning journey."
                        : "This course is being prepared. Check back soon for exciting content!"}
                    </p>
                    {courseData.chapters && courseData.chapters.length > 0 && (
                      <Button
                        onClick={() => {
                          const firstChapter = courseData.chapters[0];
                          const firstLesson = firstChapter.lessons?.[0];
                          if (firstLesson) {
                            handleLessonClick(firstChapter.id, firstLesson.id);
                          }
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
                      >
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Start First Lesson
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Enhanced Navigation Footer */}
            {selectedLesson && (
              <div className="p-6 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
                <div className="flex justify-between items-center max-w-5xl mx-auto">
                  <Button
                    variant="outline"
                    onClick={handlePreviousLesson}
                    disabled={currentFlattenedLessonIndex <= 0}
                    className="flex items-center gap-3 px-8 py-3 font-medium hover:shadow-lg transition-all duration-300 group disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                    Previous Lesson
                  </Button>

                  <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900 rounded-xl shadow-md">
                    <Bookmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Chapter {selectedChapter?.order_index} • Lesson{" "}
                      {selectedLesson.order_index}
                    </span>
                  </div>

                  {isLastLesson ? (
                    <Button
                      onClick={handleCompleteCourse}
                      className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      Complete Course
                      <div className="relative">
                        <Trophy className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-30 animate-pulse"></div>
                      </div>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextLesson}
                      disabled={
                        currentFlattenedLessonIndex === -1 ||
                        currentFlattenedLessonIndex >=
                          flattenedLessons.length - 1
                      }
                      className="flex items-center gap-3 px-8 py-3 font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group disabled:opacity-50"
                    >
                      Next Lesson
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
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
