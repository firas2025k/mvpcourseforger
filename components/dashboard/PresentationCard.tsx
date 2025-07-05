// components/dashboard/PresentationCard.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Presentation, 
  Play, 
  Edit, 
  Trash2, 
  Calendar, 
  Sliders, 
  Eye,
  MoreVertical,
  Download,
  Share2,
  Archive,
  Copy
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PresentationCardProps {
  presentation: {
    id: string;
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    slide_count: number;
    theme: string;
    created_at: string;
    is_published: boolean;
    is_archived: boolean;
    slides?: any[];
  };
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
};

const themeColors = {
  default: "from-blue-500 to-purple-600",
  dark: "from-gray-700 to-gray-900",
  corporate: "from-slate-600 to-slate-800",
  creative: "from-orange-500 to-pink-600",
  minimal: "from-gray-500 to-gray-700"
};

export default function PresentationCard({ presentation, onDelete, onArchive, onDuplicate }: PresentationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(presentation.id);
    } catch (error) {
      console.error('Error deleting presentation:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const themeGradient = themeColors[presentation.theme as keyof typeof themeColors] || themeColors.default;

  return (
    <>
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group flex flex-col h-full">
        {/* Theme Preview Bar */}
        <div className={`h-2 bg-gradient-to-r ${themeGradient}`}></div>
        
        {/* Status Badges */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {presentation.is_published && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Eye className="h-3 w-3 mr-1" />
              Published
            </Badge>
          )}
          {presentation.is_archived && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
              <Archive className="h-3 w-3 mr-1" />
              Archived
            </Badge>
          )}
        </div>

        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${themeGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

        <CardHeader className="relative pb-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${themeGradient} flex items-center justify-center shadow-lg`}>
              <Presentation className="h-6 w-6 text-white" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/presentations/${presentation.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(presentation.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchive?.(presentation.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  {presentation.is_archived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">
            {presentation.title}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(presentation.created_at)}
            </span>
            <Badge className={difficultyColors[presentation.difficulty]}>
              {presentation.difficulty}
            </Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="relative flex-grow flex flex-col">
          {/* Presentation Stats */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Sliders className="h-4 w-4" />
              <span>{presentation.slide_count} slides</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${themeGradient}`}></div>
              <span className="capitalize">{presentation.theme} theme</span>
            </div>
          </div>

          {/* Progress Indicator */}
          {presentation.slides && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Progress</span>
                <span>0/{presentation.slide_count}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${themeGradient} h-2 rounded-full transition-all duration-300`}
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex-grow"></div>
        </CardContent>

        <CardFooter className="relative pt-0 flex gap-2">
          <Button 
            asChild 
            className={`flex-1 bg-gradient-to-r ${themeGradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <Link href={`/dashboard/presentations/${presentation.id}/present`}>
              <Play className="h-4 w-4 mr-2" />
              Present
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800"
          >
            <Link href={`/dashboard/presentations/${presentation.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Presentation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{presentation.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

