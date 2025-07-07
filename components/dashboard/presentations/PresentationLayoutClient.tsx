'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Presentation, Slide } from '@/types/presentation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Clock,
  FileText,
  ArrowLeft,
  Maximize,
  Minimize
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface PresentationLayoutClientProps {
  presentation: Presentation;
  user: User;
}

export default function PresentationLayoutClient({
  presentation,
  user
}: PresentationLayoutClientProps) {
  const router = useRouter();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const [slideProgress, setSlideProgress] = useState<Record<string, boolean>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const slides = presentation.slides || [];
  const currentSlide = slides[currentSlideIndex];

  // Fetch presentation progress on component mount
  useEffect(() => {
    const fetchPresentationProgress = async () => {
      if (!presentation?.id) return;
      setIsLoadingProgress(true);
      try {
        const response = await fetch(
          `/api/presentation-progress?presentationId=${presentation.id}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch presentation progress');
        }
        const progressData: Record<string, boolean> = await response.json();
        setSlideProgress(progressData);
      } catch (error) {
        console.error('Error fetching presentation progress:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    fetchPresentationProgress();
  }, [presentation?.id]);

  // Mark slide as viewed when it's displayed
  useEffect(() => {
    if (currentSlide && !slideProgress[currentSlide.id] && !isLoadingProgress) {
      markSlideAsViewed(currentSlide.id);
    }
  }, [currentSlide, slideProgress, isLoadingProgress]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prev => {
          if (prev < slides.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 5000); // 5 seconds per slide
      setAutoPlayInterval(interval);
    } else {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        setAutoPlayInterval(null);
      }
    }

    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [isPlaying, slides.length]);

  const markSlideAsViewed = async (slideId: string) => {
    try {
      const response = await fetch('/api/presentation-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideId,
          isViewed: true,
          presentationId: presentation.id
        }),
      });

      if (!response.ok) {
        console.error('Failed to update slide progress:', await response.text());
        return;
      }

      // Update local state
      setSlideProgress(prev => ({
        ...prev,
        [slideId]: true
      }));
    } catch (error) {
      console.error('Error marking slide as viewed:', error);
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPresentation = () => {
    setCurrentSlideIndex(0);
    setIsPlaying(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getSlideTypeIcon = (type: string) => {
    switch (type) {
      case 'title':
        return <FileText className="w-4 h-4" />;
      case 'content':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <Eye className="w-4 h-4" />;
      case 'chart':
        return <Settings className="w-4 h-4" />;
      case 'conclusion':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSlideLayoutClass = (layout: string) => {
    switch (layout) {
      case 'title-only':
        return 'flex items-center justify-center text-center';
      case 'two-column':
        return 'grid grid-cols-2 gap-8';
      case 'image-left':
        return 'grid grid-cols-2 gap-8';
      case 'image-right':
        return 'grid grid-cols-2 gap-8';
      case 'full-image':
        return 'relative flex items-center justify-center';
      default:
        return 'space-y-6';
    }
  };

  // Function to render slide content with proper formatting
  const renderSlideContent = (content: string) => {
    if (!content) return null;

    // Check if content contains HTML tags
    const hasHtmlTags = /<[^>]*>/g.test(content);
    
    if (hasHtmlTags) {
      // If it's HTML, render it directly but with better styling
      return (
        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-current prose-p:text-current prose-strong:text-current prose-em:text-current prose-ul:text-current prose-ol:text-current prose-li:text-current prose-blockquote:text-current prose-code:text-current prose-pre:text-current"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    } else {
      // If it's markdown or plain text, use ReactMarkdown for better formatting
      return (
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-current prose-p:text-current prose-strong:text-current prose-em:text-current prose-ul:text-current prose-ol:text-current prose-li:text-current prose-blockquote:text-current prose-code:text-current prose-pre:text-current">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ children }) => <h1 className="text-4xl font-bold mb-6">{children}</h1>,
              h2: ({ children }) => <h2 className="text-3xl font-semibold mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-2xl font-medium mb-3">{children}</h3>,
              p: ({ children }) => <p className="text-lg leading-relaxed mb-4">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
              li: ({ children }) => <li className="text-lg leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-current pl-4 italic my-4">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                  {children}
                </pre>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    }
  };

  const viewedSlidesCount = Object.values(slideProgress).filter(Boolean).length;
  const progressPercentage = slides.length > 0 ? (viewedSlidesCount / slides.length) * 100 : 0;

  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backgroundColor: presentation.background_color,
          color: presentation.text_color
        }}
      >
        {/* Fullscreen slide content */}
        <div className="w-full h-full p-8 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className={`w-full max-w-6xl ${getSlideLayoutClass(currentSlide?.layout || 'default')}`}>
              {currentSlide && (
                <>
                  <div className="space-y-8">
                    <h1
                      className="text-5xl md:text-7xl font-bold leading-tight"
                      style={{ color: presentation.accent_color }}
                    >
                      {currentSlide.title}
                    </h1>
                    <div className="text-xl md:text-3xl leading-relaxed">
                      {renderSlideContent(currentSlide.content)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Fullscreen controls */}
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-20 rounded-lg">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <Minimize className="w-4 h-4" />
              </Button>
              <span className="text-white">
                {currentSlideIndex + 1} / {slides.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/presentations')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold truncate">{presentation.title}</h1>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{viewedSlidesCount}/{slides.length} slides</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Badge variant="secondary">{presentation.difficulty}</Badge>
            <Badge variant="outline">{presentation.theme}</Badge>
          </div>
        </div>

        {/* Slide Navigation */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <Card
                key={slide.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  index === currentSlideIndex
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : slideProgress[slide.id]
                      ? 'bg-green-50 border-green-200'
                      : 'hover:bg-gray-50'
                }`}
                onClick={() => goToSlide(index)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSlideTypeIcon(slide.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          Slide {index + 1}
                        </span>
                        {slideProgress[slide.id] && (
                          <Eye className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                      <h3 className="text-sm font-medium truncate">{slide.title}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {slide.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={resetPresentation}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
          </div>

          <Button
            onClick={toggleFullscreen}
            className="w-full"
          >
            <Maximize className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Slide Display */}
        <div
          className="flex-1 p-8 flex items-center justify-center"
          style={{
            backgroundColor: presentation.background_color,
            color: presentation.text_color
          }}
        >
          {currentSlide ? (
            <div className={`w-full max-w-4xl ${getSlideLayoutClass(currentSlide.layout)}`}>
              <div className="space-y-8">
                <h1
                  className="text-4xl md:text-5xl font-bold leading-tight"
                  style={{ color: presentation.accent_color }}
                >
                  {currentSlide.title}
                </h1>
                <div className="text-lg md:text-xl leading-relaxed">
                  {renderSlideContent(currentSlide.content)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No slides available</p>
            </div>
          )}
        </div>

        {/* Navigation Bar */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
              {currentSlide?.speaker_notes && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Notes available
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Speaker Notes */}
          {currentSlide?.speaker_notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Speaker Notes:</h4>
              <p className="text-sm text-gray-600">{currentSlide.speaker_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

