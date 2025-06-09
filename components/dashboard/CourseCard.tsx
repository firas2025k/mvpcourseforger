"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { BookOpen, Trash2, FileDown, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import html2pdf from 'html2pdf.js';

// Define the expected shape of a course object for this component
// Ideally, this would come from a shared types/index.ts file

interface Lesson {
  id: string;
  title: string;
  content: string; // Full lesson content for PDF
  order_index: number; // Renamed from lesson_number to match DB
  // quizzes: Quiz[]; // Quizzes removed
}

interface Chapter {
  id: string;
  title: string;
  order_index: number; // Renamed from chapter_number
  lessons: Lesson[];
}

interface CourseDetail extends CourseForCard { // Extends base card info
  description?: string | null; // Full description if available
  chapters: Chapter[];
}

export interface CourseForCard {
  id: string;
  title: string;
  prompt: string | null; // Using prompt as description for now
  progress: number; // Percentage, 0-100
  totalLessons: number;
  completedLessons: number;
  // Add other relevant fields like difficulty, image_url if available and needed for card
}

interface CourseCardProps {
  course: CourseForCard;
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const description = course.prompt 
    ? (course.prompt.length > 100 ? course.prompt.substring(0, 97) + '...' : course.prompt)
    : 'No description available.';

  const progressValue = Math.round(course.progress);
  const lessonsProgressText = `${course.completedLessons} / ${course.totalLessons} lessons`;

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/course/${course.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete course');
      }
      // Deletion successful
      setIsDeleteDialogOpen(false);
      router.refresh(); // Re-fetch data on the page
      // TODO: Add a success toast notification here
      console.log('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      // TODO: Add an error toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportToPdf = async () => {
    setIsExportingPdf(true);
    try {
      const response = await fetch(`/api/course-details/${course.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch course details for PDF export.');
      }
      const courseDetails: CourseDetail = await response.json();

      let htmlContent = `<style>body { color: black; } h1, h2, h3, h4, h5, h6 { color: black; } p { color: black; } div { color: black; } li { color: black; }</style><h1>${courseDetails.title}</h1>`;
      if (courseDetails.description) {
         htmlContent += `<p>${courseDetails.description.replace(/\n/g, '<br />')}</p>`;
      } else if(courseDetails.prompt) {
         htmlContent += `<p>${courseDetails.prompt.replace(/\n/g, '<br />')}</p>`;
      }
      htmlContent += '<hr />'

      courseDetails.chapters.forEach(chapter => {
        htmlContent += `<h2>Chapter ${chapter.order_index}: ${chapter.title}</h2>`;
        chapter.lessons.forEach(lesson => {
          htmlContent += `<h3>Lesson ${lesson.order_index}: ${lesson.title}</h3>`;
          const formattedContent = lesson.content ? lesson.content.replace(/\n/g, '<br />') : 'No content available.';
          htmlContent += `<div>${formattedContent}</div>`;
          // Quiz generation removed
          htmlContent += '<hr style="margin-top: 1em; margin-bottom: 1em;" />';
        });
      });

      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      // Sanitize title for filename
      const safeTitle = course.title.replace(/[^a-z0-9_\-\s]/gi, '_').replace(/\s+/g, '_');

      const opt = {
        margin:       0.5, // inches
        filename:     `${safeTitle}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, logging: false, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert(`Failed to export to PDF: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <Card className="group flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
      <CardHeader className="relative">
        <CardTitle className="text-xl font-semibold leading-tight flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-purple-600" />
          {course.title}
        </CardTitle>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive-foreground hover:bg-destructive/80"
              onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }} // Stop propagation to prevent card click if any
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the course "<strong>{course.title}</strong>" and all of its associated data (chapters, lessons, quizzes, progress, etc.).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCourse} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <CardDescription className="text-sm text-muted-foreground h-16 overflow-hidden">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Progress Bar Placeholder */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{lessonsProgressText}</span>
            <span>{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
            <Link href={`/dashboard/courses/${course.id}`}>View Course</Link>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleExportToPdf} 
            disabled={isExportingPdf}
          >
            {isExportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />} 
            {isExportingPdf ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
