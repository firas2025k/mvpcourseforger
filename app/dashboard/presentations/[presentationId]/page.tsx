// app/dashboard/presentations/[presentationId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Play, 
  Edit, 
  Trash2, 
  Share2,
  Download,
  Archive,
  Calendar,
  Sliders,
  Loader2,
  AlertCircle,
  Presentation,
  Eye,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Maximize,
  List,
  Grid
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
import { createBrowserClient } from '@supabase/ssr';
import MarkdownSlideRenderer from "@/components/dashboard/presentations/MarkdownSlideRenderer";

interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
  layout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  speaker_notes?: string;
  order_index: number;
  is_viewed?: boolean;
  viewed_at?: string;
}

interface PresentationData {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  slide_count: number;
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  created_at: string;
  is_published: boolean;
  is_archived: boolean;
  slides: Slide[];
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

function PresentationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const presentationId = params.presentationId as string;
  
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slides' | 'outline'>('slides');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (presentationId) {
      fetchPresentation();
    }
  }, [presentationId]);

  const fetchPresentation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/presentation-details/${presentationId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Presentation not found.');
        } else {
          setError('Failed to load presentation.');
        }
        return;
      }

      const data = await response.json();
      setPresentation(data.presentation);
    } catch (err) {
      console.error('Error fetching presentation:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!presentation) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/presentation-details/${presentation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete presentation');
      }

      router.push('/dashboard/presentations');
    } catch (error) {
      console.error('Error deleting presentation:', error);
      setError('Failed to delete presentation. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleArchive = async () => {
    if (!presentation) return;

    try {
      const { error } = await supabase
        .from('presentations')
        .update({ is_archived: !presentation.is_archived })
        .eq('id', presentation.id);

      if (error) {
        throw error;
      }

      setPresentation(prev => prev ? { ...prev, is_archived: !prev.is_archived } : null);
    } catch (error) {
      console.error('Error archiving presentation:', error);
      setError('Failed to archive presentation. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (!presentation?.slides) return 0;
    const viewedSlides = presentation.slides.filter(slide => slide.is_viewed).length;
    return Math.round((viewedSlides / presentation.slides.length) * 100);
  };

  const nextSlide = () => {
    if (presentation && currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const goToSlide = (index: number) => {
    if (presentation && index >= 0 && index < presentation.slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  const renderSlideContent = (slide: Slide) => {
    if (!presentation) return null;
    
    switch (slide.layout) {
      case 'title-only':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: presentation.text_color }}>
              {slide.title}
            </h1>
            {slide.content.trim() && (
              <div className="text-xl md:text-2xl opacity-80 max-w-4xl">
                <MarkdownSlideRenderer 
                  content={slide.content}
                  textColor={presentation.text_color}
                  accentColor={presentation.accent_color}
                />
              </div>
            )}
          </div>
        );
      
      case 'two-column':
        const contentLines = slide.content.split('\n').filter(line => line.trim());
        const midPoint = Math.ceil(contentLines.length / 2);
        const leftContent = contentLines.slice(0, midPoint).join('\n');
        const rightContent = contentLines.slice(midPoint).join('\n');
        
        return (
          <div className="h-full flex flex-col p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: presentation.text_color }}>
              {slide.title}
            </h2>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <MarkdownSlideRenderer
                  content={leftContent}
                  textColor={presentation.text_color}
                  accentColor={presentation.accent_color}
                />
              </div>
              <div>
                <MarkdownSlideRenderer 
                  content={rightContent}
                  textColor={presentation.text_color}
                  accentColor={presentation.accent_color}
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full flex flex-col p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: presentation.text_color }}>
              {slide.title}
            </h2>
            <div className="flex-1 max-w-5xl">
              <MarkdownSlideRenderer 
                content={slide.content}
                textColor={presentation.text_color}
                accentColor={presentation.accent_color}
              />
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
          <p className="text-red-600">{error || 'Presentation not found'}</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/presentations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Presentations
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const themeGradient = themeColors[presentation.theme as keyof typeof themeColors] || themeColors.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/presentations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Presentations
            </Link>
          </Button>
        </div>

        {/* Presentation Header */}
        <Card className="mb-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          {/* Theme Preview Bar */}
          <div className={`h-3 bg-gradient-to-r ${themeGradient}`}></div>
          
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${themeGradient} flex items-center justify-center shadow-lg`}>
                    <Presentation className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                      {presentation.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <Badge className={difficultyColors[presentation.difficulty]}>
                        {presentation.difficulty}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(presentation.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sliders className="h-4 w-4" />
                        {presentation.slide_count} slides
                      </span>
                    </CardDescription>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 mb-4">
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
                  <Badge variant="outline" className="capitalize">
                    {presentation.theme} theme
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{getProgressPercentage()}% complete</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${themeGradient} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  asChild
                  className={`bg-gradient-to-r ${themeGradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <Link href={`/dashboard/presentations/${presentation.id}/present`}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Presentation
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Presentation
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
                    <DropdownMenuItem onClick={handleArchive}>
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
            </div>
          </CardHeader>
        </Card>

        {/* Slides Viewer */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'slides' | 'outline')} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="slides" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Visual Slides
              </TabsTrigger>
              <TabsTrigger value="outline" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Outline
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {currentSlideIndex + 1} / {presentation.slides.length}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/dashboard/presentations/${presentation.id}/present`}>
                  <Maximize className="h-4 w-4 mr-2" />
                  Fullscreen
                </Link>
              </Button>
            </div>
          </div>

          <TabsContent value="slides" className="space-y-4">
            {/* Visual Slide Viewer */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <CardContent className="p-0">
                {/* Slide Display */}
                <div 
                  className="relative aspect-video rounded-lg overflow-hidden"
                  style={{ backgroundColor: presentation.background_color }}
                >
                  <div className="absolute inset-0">
                    {renderSlideContent(presentation.slides[currentSlideIndex])}
                  </div>
                  
                  {/* Navigation Overlay */}
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={previousSlide}
                      disabled={currentSlideIndex === 0}
                      className="bg-black/20 hover:bg-black/40 text-white"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={nextSlide}
                      disabled={currentSlideIndex === presentation.slides.length - 1}
                      className="bg-black/20 hover:bg-black/40 text-white"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                {/* Slide Navigation */}
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{presentation.slides[currentSlideIndex].title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {presentation.slides[currentSlideIndex].type}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {presentation.slides[currentSlideIndex].layout.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={previousSlide} disabled={currentSlideIndex === 0}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextSlide} disabled={currentSlideIndex === presentation.slides.length - 1}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Slide Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {presentation.slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        onClick={() => goToSlide(index)}
                        className={`flex-shrink-0 w-20 h-12 rounded border-2 transition-all ${
                          index === currentSlideIndex
                            ? `border-purple-500 bg-purple-50 dark:bg-purple-900/20`
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        style={{ backgroundColor: presentation.background_color }}
                      >
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium" style={{ color: presentation.text_color }}>
                          {index + 1}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Speaker Notes */}
                  {presentation.slides[currentSlideIndex].speaker_notes && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Speaker Notes:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {presentation.slides[currentSlideIndex].speaker_notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outline" className="space-y-4">
            {/* Outline View */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                Slides ({presentation.slides.length})
              </h2>
              
              {presentation.slides.map((slide, index) => (
                <Card key={slide.id} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${themeGradient} flex items-center justify-center text-white text-sm font-medium`}>
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{slide.title}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {slide.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {slide.layout.replace('-', ' ')}
                            </Badge>
                            {slide.is_viewed && (
                              <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Viewed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {setCurrentSlideIndex(index); setViewMode('slides');}}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                      {slide.content.substring(0, 200)}...
                    </div>
                    {slide.speaker_notes && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Speaker Notes:</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 line-clamp-2">
                          {slide.speaker_notes.substring(0, 150)}...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
    </div>
  );
}

export default PresentationDetailPage;

