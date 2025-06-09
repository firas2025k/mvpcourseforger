// components/dashboard/courses/CourseLayoutClient.tsx
"use client"; // This directive makes it a client component

import { useState, useEffect } from 'react';
import { FullCourseData } from '@/types/course'; // Adjusted path, assuming types/course.ts
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, BookOpen, HelpCircle } from 'lucide-react';

interface CourseLayoutClientProps {
  courseData: FullCourseData;
}

export default function CourseLayoutClient({ courseData }: CourseLayoutClientProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [accordionDefaultValue, setAccordionDefaultValue] = useState<string | undefined>(undefined);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (courseData?.chapters && courseData.chapters.length > 0) {
      const firstChapter = courseData.chapters[0];
      setSelectedChapterId(firstChapter.id);
      setAccordionDefaultValue(`chapter-${firstChapter.id}`);
      if (firstChapter.lessons && firstChapter.lessons.length > 0) {
        setSelectedLessonId(firstChapter.lessons[0].id);
      } else {
        setSelectedLessonId(null); // No lessons in the first chapter
      }
    } else {
      setSelectedChapterId(null); // No chapters
      setSelectedLessonId(null);
      setAccordionDefaultValue(undefined);
    }
  }, [courseData]);

  const handleLessonClick = (chapterId: string, lessonId: string) => {
    setSelectedChapterId(chapterId);
    setSelectedLessonId(lessonId);
    // Optional: update accordion if chapter changes and it's not already open
    // If the new chapter's accordion isn't the one currently set to be open by default,
    // you might want to update accordionDefaultValue to `chapter-${chapterId}`
    // to ensure the clicked lesson's chapter expands if it's different.
    // However, `Accordion`'s `defaultValue` is only for initial render.
    // For dynamic control, you might need to manage the `value` prop of the Accordion.
    // For simplicity, we'll rely on the user to manually open accordions if they switch to a lesson in a closed one.
  };

  const selectedChapter = courseData.chapters?.find(c => c.id === selectedChapterId);
  const selectedLesson = selectedChapter?.lessons?.find(l => l.id === selectedLessonId);

  // TODO: Implement Previous/Next lesson logic
  // const currentLessonIndex = selectedChapter?.lessons?.findIndex(l => l.id === selectedLessonId);
  // const totalLessonsInChapter = selectedChapter?.lessons?.length || 0;

  return (
    // Assuming --header-height is defined in your global CSS, e.g., :root { --header-height: 64px; }
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-var(--header-height,64px))] w-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
        <ScrollArea className="h-full p-4 border-r">
          <h2 className="text-xl font-semibold mb-4 px-2">{courseData.title}</h2>
          {courseData.chapters && courseData.chapters.length > 0 ? (
            <Accordion type="single" collapsible defaultValue={accordionDefaultValue} key={accordionDefaultValue}>
              {courseData.chapters?.map((chapter) => (
                <AccordionItem value={`chapter-${chapter.id}`} key={chapter.id}>
                  <AccordionTrigger className="text-md font-medium hover:no-underline px-2 py-3">
                    {(() => {
                      const cleanedTitle = chapter.title.replace(/^Chapter\s*\d*:\s*/i, '');
                      return `Chapter ${chapter.order_index}: ${cleanedTitle}`;
                    })()}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-0.5 pt-1 pb-2">
                      {chapter.lessons?.map((lesson) => (
                        <li key={lesson.id}>
                          <Button
                            variant={lesson.id === selectedLessonId ? "secondary" : "ghost"}
                            className={`w-full p-2 h-auto justify-start text-sm rounded-md text-left ${lesson.id === selectedLessonId ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'}`}
                            onClick={() => handleLessonClick(chapter.id, lesson.id)}
                            // Reset selected answers when lesson changes if quizzes are part of the lesson
                            // This depends on whether you want answers to persist across lesson navigation
                            // For now, let's assume answers are reset if a new lesson with quizzes is selected.
                            // If selectedLesson?.quizzes && selectedLesson.quizzes.length > 0 {
                            //   setSelectedAnswers({}); 
                            // }
                            // Simpler: selected answers are tied to quizId, so they persist unless explicitly cleared.
                          >
                            {lesson.lesson_number}. {lesson.title}
                          </Button>
                        </li>
                      ))}
                      {(!chapter.lessons || chapter.lessons.length === 0) && (
                        <li className="px-2 py-1 text-sm text-muted-foreground italic">No lessons in this chapter.</li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="px-2 text-sm text-muted-foreground italic">This course has no chapters yet.</p>
          )}
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-grow p-6">
            {selectedLesson ? (
              <article>
                <h1 className="text-3xl font-bold mb-4 pb-2 border-b">{selectedLesson.title}</h1>
                <div 
                  className="prose dark:prose-invert max-w-none mb-8" 
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content || '<p>No content available for this lesson.</p>' }} 
                />
                
                {selectedLesson.quizzes && selectedLesson.quizzes.length > 0 && (
                  <section className="mt-10 pt-6 border-t">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center">
                      <HelpCircle className="mr-3 h-6 w-6 text-purple-600" /> Quiz
                    </h2>
                    <div className="space-y-6">
                      {selectedLesson.quizzes.map((quiz) => (
                        <div key={quiz.id} className="p-4 border rounded-lg shadow-sm bg-card">
                          <p className="font-medium mb-3 text-card-foreground">{quiz.question}</p>
                          <RadioGroup
                            value={selectedAnswers[quiz.id] || ""}
                            onValueChange={(value) => {
                              setSelectedAnswers(prev => ({ ...prev, [quiz.id]: value }));
                            }}
                            className="space-y-2 mb-3"
                          >
                            {Array.isArray(quiz.options) && quiz.options.map((option, index) => (
                              <div key={`${quiz.id}-option-${index}`} className="flex items-center space-x-3 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value={option} id={`${quiz.id}-option-${index}`} />
                                <Label htmlFor={`${quiz.id}-option-${index}`} className="font-normal cursor-pointer flex-1">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          {/* Correct answer display removed. Feedback can be added after submission. */}
                        </div>
                      ))}
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
                  <Button variant="outline" disabled> {/* TODO: Implement Previous logic */}
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                     Chapter {selectedChapter?.chapter_number} - Lesson {selectedLesson.lesson_number}
                  </span>
                  <Button variant="outline" disabled> {/* TODO: Implement Next logic */}
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
              </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
