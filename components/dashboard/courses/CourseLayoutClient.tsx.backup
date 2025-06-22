"use client";

import { useState, useEffect, useMemo } from 'react';
import { FullCourseData, Chapter, Lesson, Quiz } from '@/types/course';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, BookOpen, HelpCircle, CheckCircle, XCircle, Edit3, Eye, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useRouter } from 'next/navigation';
import LessonEditor from './LessonEditor';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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

export default function CourseLayoutClient({ courseData }: CourseLayoutClientProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [accordionDefaultValue, setAccordionDefaultValue] = useState<string | undefined>(undefined);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<string, QuizFeedback | null>>({});
  const [lessonCompletionStatus, setLessonCompletionStatus] = useState<Record<string, boolean>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [lessonContent, setLessonContent] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    setQuizFeedback({});
    setSelectedAnswers({});
  }, [selectedLessonId]);

  useEffect(() => {
    if (courseData?.chapters && courseData.chapters.length > 0) {
      const firstChapter = courseData.chapters[0];
      if (!selectedChapterId) setSelectedChapterId(firstChapter.id);
      if (!accordionDefaultValue) setAccordionDefaultValue(`chapter-${firstChapter.id}`);
      if (!selectedLessonId && firstChapter.lessons && firstChapter.lessons.length > 0) {
        setSelectedLessonId(firstChapter.lessons[0].id);
      }
    }
  }, [courseData]);

  useEffect(() => {
    const fetchLessonProgress = async () => {
      if (!courseData?.id) return;
      setIsLoadingProgress(true);
      try {
        const response = await fetch(`/api/lesson-progress?courseId=${courseData.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch lesson progress');
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

  const selectedChapter = courseData.chapters?.find(c => c.id === selectedChapterId);
  const selectedLesson = selectedChapter?.lessons?.find(l => l.id === selectedLessonId);

  const flattenedLessons: FlattenedLesson[] = useMemo(() => {
    if (!courseData.chapters) return [];
    const lessons: FlattenedLesson[] = [];
    courseData.chapters
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      .forEach(chapter => {
        (chapter.lessons || [])
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .forEach(lesson => {
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
      fl => fl.lessonId === selectedLessonId && fl.chapterId === selectedChapterId
    );
  }, [flattenedLessons, selectedChapterId, selectedLessonId]);

  const isLastLesson = currentFlattenedLessonIndex === flattenedLessons.length - 1;

  const handlePreviousLesson = () => {
    if (currentFlattenedLessonIndex > 0) {
      const previousFlattenedLesson = flattenedLessons[currentFlattenedLessonIndex - 1];
      handleLessonClick(previousFlattenedLesson.chapterId, previousFlattenedLesson.lessonId);
    }
  };

  const handleCompleteCourse = async () => {
    if (selectedLessonId && !lessonCompletionStatus[selectedLessonId]) {
      await handleToggleLessonComplete(selectedLessonId);
    }
    try {
      const response = await fetch('/api/complete-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseData.id }),
      });
      if (!response.ok) {
        console.error('Failed to update course completion:', await response.text());
      }
    } catch (error) {
      console.error('Error updating course completion:', error);
    }
    router.push('/dashboard');
  };

  const handleNextLesson = async () => {
    if (currentFlattenedLessonIndex !== -1 && currentFlattenedLessonIndex < flattenedLessons.length - 1) {
      if (selectedLessonId && !lessonCompletionStatus[selectedLessonId]) {
        await handleToggleLessonComplete(selectedLessonId);
      }
      const nextFlattenedLesson = flattenedLessons[currentFlattenedLessonIndex + 1];
      handleLessonClick(nextFlattenedLesson.chapterId, nextFlattenedLesson.lessonId);
    }
  };

  const handleToggleLessonComplete = async (lessonId: string) => {
    const currentStatus = !!lessonCompletionStatus[lessonId];
    setLessonCompletionStatus(prev => ({ ...prev, [lessonId]: !currentStatus }));
    try {
      const response = await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, isCompleted: !currentStatus, courseId: courseData.id }),
      });
      if (!response.ok) {
        setLessonCompletionStatus(prev => ({ ...prev, [lessonId]: currentStatus }));
        console.error('Failed to update lesson progress:', await response.text());
      }
    } catch (error) {
      setLessonCompletionStatus(prev => ({ ...prev, [lessonId]: currentStatus }));
      console.error('Error updating lesson progress:', error);
    }
  };

  const totalLessons = useMemo(() => {
    return courseData.chapters?.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0) || 0;
  }, [courseData.chapters]);

  const completedLessonsCount = useMemo(() => {
    return Object.values(lessonCompletionStatus).filter(isCompleted => isCompleted).length;
  }, [lessonCompletionStatus]);

  const progressPercentage = useMemo(() => {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessonsCount / totalLessons) * 100);
  }, [completedLessonsCount, totalLessons]);

  const handleCheckAnswer = (quizId: string, correctAnswer: string) => {
    const selectedAnswer = selectedAnswers[quizId];
    if (selectedAnswer) {
      setQuizFeedback(prev => ({
        ...prev,
        [quizId]: {
          isCorrect: selectedAnswer === correctAnswer,
          selectedAnswer: selectedAnswer,
        }
      }));
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-var(--header-height,64px))] w-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
        <ScrollArea className="h-full p-4 border-r">
          <h2 className="text-xl font-semibold mb-2 px-2">{courseData.title}</h2>
          <div className="px-2 mb-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-muted-foreground">Progress</p>
              <p className="text-sm font-semibold text-primary">{progressPercentage}%</p>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          {courseData.chapters && courseData.chapters.length > 0 ? (
            <Accordion type="single" collapsible value={accordionDefaultValue} onValueChange={setAccordionDefaultValue} key={accordionDefaultValue}>
              {courseData.chapters
                ?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                ?.map((chapter) => (
                <AccordionItem value={`chapter-${chapter.id}`} key={chapter.id}>
                  <AccordionTrigger className="text-md font-medium hover:no-underline px-2 py-3">
                    {(() => {
                      const cleanedTitle = chapter.title.replace(/^Chapter\s*\d*:\s*/i, '');
                      return `Chapter ${chapter.order_index}: ${cleanedTitle}`;
                    })()}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {(chapter.lessons || [])
                        ?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                        ?.map((lesson) => (
                        <li key={lesson.id}>
                          <Button
                            variant={selectedLessonId === lesson.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start text-sm h-auto py-2 px-3 whitespace-normal text-left flex items-center"
                            onClick={() => handleLessonClick(chapter.id, lesson.id)}
                          >
                            {lessonCompletionStatus[lesson.id] && (
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                            )}
                            <span className="flex-grow">
                              Lesson {lesson.order_index}: {lesson.title}
                            </span>
                          </Button>
                        </li>
                      ))}
                      {(!chapter.lessons || chapter.lessons.length === 0) && (
                        <li className="px-3 py-2 text-sm text-muted-foreground">No lessons in this chapter.</li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No chapters in this course yet.</div>
          )}
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Breadcrumb className='mt-4 text-black'>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/dashboard/courses/${courseData.id}`}>{courseData.title}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ScrollArea className="flex-grow p-6">
            {selectedLesson ? (
              <article>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold pb-2 border-b flex-grow">{selectedLesson.title}</h1>
                  <Button
                    variant={isEditMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="ml-4"
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
                
                <div className="flex items-center space-x-2 mb-4 pt-2">
                  <Checkbox 
                    id={`complete-${selectedLesson.id}`}
                    checked={!!lessonCompletionStatus[selectedLesson.id]}
                    onCheckedChange={() => handleToggleLessonComplete(selectedLesson.id)}
                    disabled={isLoadingProgress}
                  />
                  <Label htmlFor={`complete-${selectedLesson.id}`} className="text-sm font-medium text-muted-foreground cursor-pointer">
                    Mark lesson as complete
                  </Label>
                </div>

                {isEditMode ? (
                  <div className="mb-8">
                    <LessonEditor
                      lessonId={selectedLesson.id}
                      initialContent={lessonContent[selectedLesson.id] || selectedLesson.content || ''}
                      onContentChange={(content) => {
                        setLessonContent(prev => ({
                          ...prev,
                          [selectedLesson.id]: content
                        }));
                      }}
                    />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none mb-8">
                    {lessonContent[selectedLesson.id] ? (
                      <div dangerouslySetInnerHTML={{ __html: lessonContent[selectedLesson.id] }} />
                    ) : selectedLesson.content ? (
                      selectedLesson.content.includes('<') && selectedLesson.content.includes('>') ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                          {selectedLesson.content.split('. ').join('.\n\n')}
                        </ReactMarkdown>
                      )
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No content available for this lesson.</p>
                        <p className="text-sm">Click "Edit" to add content.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedLesson.quizzes && selectedLesson.quizzes.length > 0 && (
                  <section className="mt-10 pt-6 border-t">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center">
                      <HelpCircle className="mr-3 h-6 w-6 text-purple-600" /> Quiz
                    </h2>
                    <div className="space-y-8">
                      {selectedLesson.quizzes.map((quiz) => {
                        const feedback = quizFeedback[quiz.id];
                        return (
                          <div key={quiz.id} className="p-4 border rounded-lg shadow-sm bg-card">
                            <p className="font-medium mb-3 text-card-foreground">{quiz.question}</p>
                            <RadioGroup
                              value={selectedAnswers[quiz.id] || ""}
                              onValueChange={(value) => {
                                setSelectedAnswers(prev => ({ ...prev, [quiz.id]: value }));
                                if (quizFeedback[quiz.id]) {
                                  setQuizFeedback(prev => ({ ...prev, [quiz.id]: null }));
                                }
                              }}
                              className="space-y-2 mb-4"
                            >
                              {Array.isArray(quiz.options) && quiz.options.map((option, index) => {
                                let optionStyle = "border rounded-md hover:bg-muted/50 transition-colors";
                                let icon = null;

                                if (feedback) {
                                  if (option === feedback.selectedAnswer) {
                                    optionStyle = feedback.isCorrect 
                                      ? "border-2 border-green-500 bg-green-500/10 rounded-md transition-colors" 
                                      : "border-2 border-red-500 bg-red-500/10 rounded-md transition-colors";
                                    icon = feedback.isCorrect 
                                      ? <CheckCircle className="h-5 w-5 text-green-500 ml-auto" /> 
                                      : <XCircle className="h-5 w-5 text-red-500 ml-auto" />;
                                  } else if (option === quiz.correct_answer && !feedback.isCorrect) {
                                    optionStyle = "border-2 border-green-500 bg-green-500/10 rounded-md transition-colors";
                                  }
                                }
                                return (
                                <div key={`${quiz.id}-option-${index}`} className={`flex items-center space-x-3 p-3 ${optionStyle}`}>
                                  <RadioGroupItem value={option} id={`${quiz.id}-option-${index}`} disabled={!!feedback} />
                                  <Label htmlFor={`${quiz.id}-option-${index}`} className={`font-normal cursor-pointer flex-1 ${feedback ? 'opacity-75' : ''}`}>
                                    {option}
                                  </Label>
                                  {icon}
                                </div>
                              );
                            })}
                            </RadioGroup>
                            <Button
                              onClick={() => handleCheckAnswer(quiz.id, quiz.correct_answer)}
                              disabled={!selectedAnswers[quiz.id] || !!quizFeedback[quiz.id]}
                              className="w-full sm:w-auto"
                            >
                              Check Answer
                            </Button>
                            {feedback && (
                                <p className={`mt-3 text-sm font-medium ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {feedback.isCorrect ? 'Correct!' : `Incorrect. The correct answer is highlighted.`}
                                </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </article>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <BookOpen className="w-16 h-16 mb-6 text-muted-foreground/70" />
                <h2 className="text-xl font-semibold mb-2 text-muted-foreground">No Lesson Selected</h2>
                <p className="text-md text-muted-foreground max-w-xs">
                  {courseData.chapters && courseData.chapters.length > 0 ? "Select a lesson from the sidebar to view its content." : "This course doesn't have any content yet. Start by adding chapters and lessons."}
                </p>
              </div>
            )}
          </ScrollArea>
          {selectedLesson && (
            <div className="p-4 border-t bg-background flex justify-between items-center sticky bottom-0">
              <Button 
                variant="outline" 
                onClick={handlePreviousLesson}
                disabled={currentFlattenedLessonIndex <= 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Chapter {selectedChapter?.order_index} - Lesson {selectedLesson.order_index}
              </span>
              {isLastLesson ? (
                <Button variant="outline" onClick={handleCompleteCourse}>
                  Finish <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleNextLesson}
                  disabled={currentFlattenedLessonIndex === -1 || currentFlattenedLessonIndex >= flattenedLessons.length - 1}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}