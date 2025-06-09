// components/dashboard/courses/CourseLayoutClient.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { FullCourseData, Chapter, Lesson, Quiz } from '@/types/course'; // Added Quiz
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, BookOpen, HelpCircle, CheckCircle, XCircle } from 'lucide-react'; // Added CheckCircle, XCircle
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface CourseLayoutClientProps {
  courseData: FullCourseData;
}

interface FlattenedLesson {
  chapterId: string;
  chapterOrderIndex: number;
  lessonId: string;
  lessonNumber: number;
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
  const [quizFeedback, setQuizFeedback] = useState<Record<string, QuizFeedback | null>>({}); // State for quiz feedback
  const [lessonCompletionStatus, setLessonCompletionStatus] = useState<Record<string, boolean>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  useEffect(() => {
    // Reset feedback and selected answers when the selected lesson changes
    setQuizFeedback({});
    setSelectedAnswers({});
  }, [selectedLessonId]); // Only depends on selectedLessonId

   useEffect(() => {
    // Initialize with the first chapter/lesson or handle empty course
    if (courseData?.chapters && courseData.chapters.length > 0) {
      const firstChapter = courseData.chapters[0];
      if (!selectedChapterId) setSelectedChapterId(firstChapter.id);
      if (!accordionDefaultValue) setAccordionDefaultValue(`chapter-${firstChapter.id}`);
      if (!selectedLessonId && firstChapter.lessons && firstChapter.lessons.length > 0) {
        setSelectedLessonId(firstChapter.lessons[0].id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseData]); // Run once on mount or when courseData changes

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
        // Optionally, set some error state to display to the user
      } finally {
        setIsLoadingProgress(false);
      }
    };

    fetchLessonProgress();
  }, [courseData?.id]);

  const handleLessonClick = (chapterId: string, lessonId: string) => {
    if (selectedLessonId !== lessonId || selectedChapterId !== chapterId) {
        setSelectedChapterId(chapterId);
        setSelectedLessonId(lessonId); // This will trigger the useEffect above to reset feedback
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
      .sort((a, b) => a.order_index - b.order_index)
      .forEach(chapter => {
        (chapter.lessons || [])
          .sort((a, b) => a.lesson_number - b.lesson_number)
          .forEach(lesson => {
            lessons.push({
              chapterId: chapter.id,
              chapterOrderIndex: chapter.order_index,
              lessonId: lesson.id,
              lessonNumber: lesson.lesson_number,
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

  const handlePreviousLesson = () => {
    if (currentFlattenedLessonIndex > 0) {
      const previousFlattenedLesson = flattenedLessons[currentFlattenedLessonIndex - 1];
      // setSelectedChapterId(previousFlattenedLesson.chapterId); // Handled by handleLessonClick
      // setSelectedLessonId(previousFlattenedLesson.lessonId); // Handled by handleLessonClick
      handleLessonClick(previousFlattenedLesson.chapterId, previousFlattenedLesson.lessonId);
    }
  };

  const handleNextLesson = () => {
    if (currentFlattenedLessonIndex !== -1 && currentFlattenedLessonIndex < flattenedLessons.length - 1) {
      const nextFlattenedLesson = flattenedLessons[currentFlattenedLessonIndex + 1];
      // setSelectedChapterId(nextFlattenedLesson.chapterId); // Handled by handleLessonClick
      // setSelectedLessonId(nextFlattenedLesson.lessonId); // Handled by handleLessonClick
      handleLessonClick(nextFlattenedLesson.chapterId, nextFlattenedLesson.lessonId);
    }
  };

  const handleToggleLessonComplete = async (lessonId: string) => {
    const currentStatus = !!lessonCompletionStatus[lessonId];
    const newStatus = !currentStatus;

    // Optimistic update
    setLessonCompletionStatus(prev => ({
      ...prev,
      [lessonId]: newStatus
    }));

    try {
      const response = await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId, isCompleted: newStatus, courseId: courseData.id }),
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setLessonCompletionStatus(prev => ({
          ...prev,
          [lessonId]: currentStatus 
        }));
        console.error('Failed to update lesson progress:', await response.text());
        // Optionally, show an error to the user
      }
      // Success: local state is already updated optimistically
    } catch (error) {
      // Revert optimistic update on network error
      setLessonCompletionStatus(prev => ({
        ...prev,
        [lessonId]: currentStatus
      }));
      console.error('Error updating lesson progress:', error);
      // Optionally, show an error to the user
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
              {courseData.chapters?.map((chapter) => (
                <AccordionItem value={`chapter-${chapter.id}`} key={chapter.id}>
                  <AccordionTrigger className="text-md font-medium hover:no-underline px-2 py-3">
                    {(() => {
                      const cleanedTitle = chapter.title.replace(/^Chapter\s*\d*:\s*/i, '');
                      return `Chapter ${chapter.order_index}: ${cleanedTitle}`;
                    })()}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {(chapter.lessons || [])?.map((lesson) => (
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
                              Lesson {lesson.lesson_number}: {lesson.title}
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
          <ScrollArea className="flex-grow p-6">
            {selectedLesson ? (
              <article>
                <h1 className="text-3xl font-bold mb-2 pb-2 border-b">{selectedLesson.title}</h1>
                <div className="flex items-center space-x-2 mb-4 pt-2">
                  <Checkbox 
                    id={`complete-${selectedLesson.id}`}
                    checked={!!lessonCompletionStatus[selectedLesson.id]}
                    onCheckedChange={() => handleToggleLessonComplete(selectedLesson.id)}
                    disabled={isLoadingProgress} // Disable while initially loading progress
                  />
                  <Label htmlFor={`complete-${selectedLesson.id}`} className="text-sm font-medium text-muted-foreground cursor-pointer">
                    Mark lesson as complete
                  </Label>
                </div>
                <div className="prose dark:prose-invert max-w-none mb-8 prose-p:my-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {selectedLesson.content || '*No content available for this lesson.*'}
                  </ReactMarkdown>
                </div>
                
                {selectedLesson.quizzes && selectedLesson.quizzes.length > 0 && (
                  <section className="mt-10 pt-6 border-t">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center">
                      <HelpCircle className="mr-3 h-6 w-6 text-purple-600" /> Quiz
                    </h2>
                    <div className="space-y-8"> {/* Increased space-y for better separation */}
                      {selectedLesson.quizzes.map((quiz) => {
                        const feedback = quizFeedback[quiz.id];
                        return (
                          <div key={quiz.id} className="p-4 border rounded-lg shadow-sm bg-card">
                            <p className="font-medium mb-3 text-card-foreground">{quiz.question}</p>
                            <RadioGroup
                              value={selectedAnswers[quiz.id] || ""}
                              onValueChange={(value) => {
                                setSelectedAnswers(prev => ({ ...prev, [quiz.id]: value }));
                                // Clear feedback for this quiz if a new option is selected
                                if (quizFeedback[quiz.id]) {
                                  setQuizFeedback(prev => ({ ...prev, [quiz.id]: null }));
                                }
                              }}
                              className="space-y-2 mb-4" // Added mb-4
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
                                    // Highlight the correct answer if the user was wrong
                                    optionStyle = "border-2 border-green-500 bg-green-500/10 rounded-md transition-colors";
                                    // Optionally add an icon here too if desired for the actual correct answer
                                    // icon = <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />;
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
          {/* Bottom Navigation */} 
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
                     Chapter {selectedChapter?.order_index} - Lesson {selectedLesson.lesson_number}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={handleNextLesson}
                    disabled={currentFlattenedLessonIndex === -1 || currentFlattenedLessonIndex >= flattenedLessons.length - 1}
                  >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
              </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}