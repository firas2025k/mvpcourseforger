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
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Trash2, 
  FileDown, 
  Loader2, 
  Video, 
  Play, 
  Star, 
  Trophy, 
  Target,
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
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
import { handleSavePdf } from '@/utils/pdfExport';

interface Lesson {
  id: string;
  title: string;
  content: string;
  order_index: number;
}

interface Chapter {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface CourseDetail extends CourseForCard {
  description?: string | null;
  chapters: Chapter[];
}

export interface CourseForCard {
  id: string;
  title: string;
  prompt: string | null;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

interface CourseCardProps {
  course: CourseForCard;
  isFreePlan: boolean;
}

export default function CourseCard({ course, isFreePlan }: CourseCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const description = course.prompt 
    ? (course.prompt.length > 100 ? course.prompt.substring(0, 97) + '...' : course.prompt)
    : 'No description available.';

  const progressValue = Math.round(course.progress);
  const lessonsProgressText = `${course.completedLessons} / ${course.totalLessons} lessons`;
  const isCompleted = progressValue === 100;
  const hasStarted = progressValue > 0;

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
      setIsDeleteDialogOpen(false);
      router.refresh();
      console.log('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportToPdf = async () => {
    setIsExportingPdf(true);
    try {
      await handleSavePdf({
        courseId: course.id,
        onSuccess: () => console.log('PDF exported successfully'),
        onError: (error) => alert(`Failed to export to PDF: ${error}`),
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Determine course type icon and styling
  const getCourseTypeIcon = () => {
    return (
      <div className="relative">
        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-20 animate-pulse"></div>
      </div>
    );
  };

  const getProgressColor = () => {
    if (isCompleted) return "from-green-500 to-emerald-600";
    if (hasStarted) return "from-blue-500 to-purple-600";
    return "from-slate-400 to-slate-500";
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg z-10">
          <Trophy className="h-3 w-3" />
          Completed
        </div>
      );
    }
    if (hasStarted) {
      return (
        <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg z-10">
          <TrendingUp className="h-3 w-3" />
          In Progress
        </div>
      );
    }
    return (
      <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white text-xs font-semibold rounded-full shadow-lg z-10">
        <Target className="h-3 w-3" />
        Not Started
      </div>
    );
  };

  return (
    <Card 
      className="group relative flex flex-col h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-2 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-purple-50/50 dark:from-blue-950/20 dark:via-slate-900/50 dark:to-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Animated border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500"></div>
      
      {/* Status badge */}
      {getStatusBadge()}
      
      {/* Fixed CardHeader with proper padding to avoid overlap */}
      <CardHeader className="relative pb-3 pt-12">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold leading-tight flex items-center gap-3 pr-12 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {getCourseTypeIcon()}
            <span className="bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
              {course.title}
            </span>
          </CardTitle>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-red-500 hover:text-white hover:bg-red-500 hover:scale-110 rounded-full z-10"
                onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                  This action cannot be undone. This will permanently delete the course "<strong className="text-slate-900 dark:text-slate-100">{course.title}</strong>" and all of its associated data (chapters, lessons, quizzes, progress, etc.).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={() => setIsDeleteDialogOpen(false)} 
                  disabled={isDeleting}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteCourse} 
                  disabled={isDeleting} 
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Course'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <CardDescription className="text-sm text-slate-600 dark:text-slate-400 h-16 overflow-hidden leading-relaxed mt-3">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow relative">
        <div className="space-y-4">
          {/* Progress section */}
          <div className="relative">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {lessonsProgressText}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {isCompleted && <Star className="h-4 w-4 text-yellow-500" />}
                <span className={`text-lg font-bold ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {progressValue}%
                </span>
              </div>
            </div>
            
            <div className="relative">
              <Progress 
                value={progressValue} 
                className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
              />
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500 opacity-20 blur-sm`}
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>
          </div>
          
          {/* Course stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {course.totalLessons}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Lessons
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {course.completedLessons}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="relative pt-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            asChild 
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
          >
            <Link href={`/dashboard/courses/${course.id}`} className="flex items-center justify-center gap-2">
              <Play className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
              {hasStarted ? 'Continue Learning' : 'Start Course'}
              {isHovered && <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />}
            </Link>
          </Button>
          
          {!isFreePlan && (
            <Button 
              variant="outline" 
              size="icon"
              className="flex-shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all duration-300 group/export"
              onClick={handleExportToPdf} 
              disabled={isExportingPdf}
            >
              {isExportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 group-hover/export:scale-110 transition-transform duration-200" />
              )}
            </Button>
          )}
        </div>
      </CardFooter>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </Card>
  );
}

