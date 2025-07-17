// components/dashboard/presentations/PresentationViewer.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Square, 
  Maximize, 
  Minimize,
  Volume2,
  VolumeX,
  Settings,
  FileText,
  Timer,
  Eye,
  EyeOff,
  Home,
  Presentation,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
  layout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  speaker_notes?: string;
  order_index: number;
}

interface Presentation {
  id: string;
  title: string;
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  slides: Slide[];
}

interface PresentationViewerProps {
  presentation: Presentation;
  initialSlide?: number;
  onSlideChange?: (slideIndex: number) => void;
  onExit?: () => void;
}

export default function PresentationViewer({ 
  presentation, 
  initialSlide = 0, 
  onSlideChange,
  onExit 
}: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [autoAdvanceTime, setAutoAdvanceTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [slideTransition, setSlideTransition] = useState('fade');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = presentation.slides.sort((a, b) => a.order_index - b.order_index);
  const currentSlideData = slides[currentSlide];

  // Enhanced auto-advance functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && autoAdvanceTime > 0) {
      setTimeRemaining(autoAdvanceTime);
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            nextSlide();
            return autoAdvanceTime;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, autoAdvanceTime, currentSlide]);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousSlide();
          break;
        case 'Escape':
          e.preventDefault();
          if (isFullscreen) {
            exitFullscreen();
          } else if (onExit) {
            onExit();
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          setShowSpeakerNotes(!showSpeakerNotes);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePlayback();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isFullscreen, showSpeakerNotes, isPlaying]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        const newSlide = currentSlide + 1;
        setCurrentSlide(newSlide);
        onSlideChange?.(newSlide);
        setIsTransitioning(false);
      }, 150);
    } else {
      setIsPlaying(false);
    }
  }, [currentSlide, slides.length, onSlideChange]);

  const previousSlide = useCallback(() => {
    if (currentSlide > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        const newSlide = currentSlide - 1;
        setCurrentSlide(newSlide);
        onSlideChange?.(newSlide);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentSlide, onSlideChange]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length && index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        onSlideChange?.(index);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const exitFullscreen = () => {
    document.exitFullscreen?.();
    setIsFullscreen(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!autoAdvanceTime) {
      setAutoAdvanceTime(5); // Default 5 seconds
    }
  };

  const resetPresentation = () => {
    setCurrentSlide(0);
    setIsPlaying(false);
    setTimeRemaining(0);
  };

  const getProgressPercentage = () => {
    return Math.round(((currentSlide + 1) / slides.length) * 100);
  };

  const renderSlideContent = (slide: Slide) => {
    const contentLines = slide.content.split('\n').filter(line => line.trim());
    
    switch (slide.layout) {
      case 'title-only':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16 relative">
            <div className="max-w-6xl mx-auto space-y-8 z-10">
              <div className="relative">
                <h1 
                  className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-tight mb-6 transform transition-all duration-700"
                  style={{ 
                    color: presentation.text_color,
                    textShadow: `0 4px 20px ${presentation.accent_color}30`
                  }}
                >
                  {slide.title}
                </h1>
                <div 
                  className="h-2 w-32 mx-auto rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${presentation.accent_color}, ${presentation.accent_color}80)`
                  }}
                />
              </div>
              {contentLines.length > 0 && (
                <p 
                  className="text-2xl md:text-3xl lg:text-4xl opacity-90 font-medium leading-relaxed max-w-4xl"
                  style={{ color: presentation.text_color }}
                >
                  {contentLines[0]}
                </p>
              )}
            </div>
            
            {/* Enhanced background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div 
                className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
                style={{ backgroundColor: presentation.accent_color }}
              />
              <div 
                className="absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-10 blur-2xl animate-pulse"
                style={{ backgroundColor: presentation.accent_color, animationDelay: '1s' }}
              />
            </div>
          </div>
        );
      
      case 'two-column':
        const midPoint = Math.ceil(contentLines.length / 2);
        const leftContent = contentLines.slice(0, midPoint);
        const rightContent = contentLines.slice(midPoint);
        
        return (
          <div className="h-full flex flex-col px-8 md:px-16 py-8 relative">
            <div className="mb-12 text-center">
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
                style={{ color: presentation.text_color }}
              >
                {slide.title}
              </h2>
              <div 
                className="h-1.5 w-24 mx-auto rounded-full"
                style={{ backgroundColor: presentation.accent_color }}
              />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              <div className="space-y-6 transform transition-all duration-500 hover:translate-x-2">
                {leftContent.map((line, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div 
                      className="w-3 h-3 rounded-full mt-3 flex-shrink-0"
                      style={{ backgroundColor: presentation.accent_color }}
                    />
                    <p 
                      className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium"
                      style={{ color: presentation.text_color }}
                    >
                      {line}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-6 transform transition-all duration-500 hover:translate-x-2">
                {rightContent.map((line, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div 
                      className="w-3 h-3 rounded-full mt-3 flex-shrink-0"
                      style={{ backgroundColor: presentation.accent_color }}
                    />
                    <p 
                      className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium"
                      style={{ color: presentation.text_color }}
                    >
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full flex flex-col px-8 md:px-16 lg:px-20 py-8 md:py-12 relative">
            <div className="mb-12">
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
                style={{ color: presentation.text_color }}
              >
                {slide.title}
              </h2>
              <div 
                className="h-1.5 w-20 rounded-full"
                style={{ backgroundColor: presentation.accent_color }}
              />
            </div>
            <div className="flex-1 space-y-8 md:space-y-10">
              {contentLines.map((line, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 md:gap-6 transform transition-all duration-300 hover:translate-x-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="w-4 h-4 md:w-5 md:h-5 rounded-full mt-3 md:mt-4 flex-shrink-0 shadow-lg"
                    style={{ 
                      backgroundColor: presentation.accent_color,
                      boxShadow: `0 4px 12px ${presentation.accent_color}40`
                    }}
                  />
                  <p 
                    className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium flex-1"
                    style={{ color: presentation.text_color }}
                  >
                    {line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Top Controls */}
      {!isFullscreen && (
        <div className="flex items-center justify-between p-4 md:p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b shadow-lg">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${presentation.accent_color}, ${presentation.accent_color}80)`
                }}
              >
                <Presentation className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-semibold">{presentation.title}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{currentSlide + 1} of {slides.length}</span>
                  <span>•</span>
                  <span>{getProgressPercentage()}% complete</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${getProgressPercentage()}%`,
                    background: `linear-gradient(90deg, ${presentation.accent_color}, ${presentation.accent_color}80)`
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Enhanced Timer Display */}
            {isPlaying && autoAdvanceTime > 0 && (
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm"
                style={{ 
                  backgroundColor: `${presentation.accent_color}10`,
                  borderColor: `${presentation.accent_color}30`
                }}
              >
                <Timer className="h-4 w-4" style={{ color: presentation.accent_color }} />
                <span className="text-sm font-medium" style={{ color: presentation.accent_color }}>
                  {timeRemaining}s
                </span>
              </div>
            )}
            
            {/* Enhanced Control Buttons */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {showSpeakerNotes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showSpeakerNotes ? 'Hide' : 'Show'} Speaker Notes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Enhanced Settings */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Presentation Settings
                  </SheetTitle>
                  <SheetDescription>
                    Configure your presentation experience
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <label className="text-sm font-medium block mb-2">Auto-advance time (seconds)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={autoAdvanceTime}
                      onChange={(e) => setAutoAdvanceTime(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-blue-500"
                      style={{ focusRingColor: presentation.accent_color }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Slide Transition</label>
                    <select
                      value={slideTransition}
                      onChange={(e) => setSlideTransition(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-blue-500"
                    >
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Enhanced Exit Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onExit} className="transition-all duration-200 hover:scale-105">
                    <Home className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exit Presentation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Enhanced Main Content Area */}
      <div className="flex-1 flex">
        {/* Enhanced Slide Display */}
        <div className="flex-1 relative">
          <div 
            className={`h-full flex items-center justify-center transition-all duration-300 ${
              isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}
            style={{ backgroundColor: presentation.background_color }}
          >
            <div className="w-full max-w-7xl mx-auto h-full relative">
              {renderSlideContent(currentSlideData)}
            </div>
          </div>
          
          {/* Enhanced Navigation Overlay */}
          <div className="absolute inset-0 flex items-center justify-between p-6 md:p-8 pointer-events-none">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={previousSlide}
                    disabled={currentSlide === 0}
                    className="pointer-events-auto bg-black/20 hover:bg-black/40 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous Slide (←)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="pointer-events-auto bg-black/20 hover:bg-black/40 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next Slide (→)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Slide Number Indicator */}
          <div className="absolute top-4 right-4 pointer-events-none">
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
              style={{ 
                backgroundColor: `${presentation.accent_color}20`,
                color: presentation.accent_color,
                border: `1px solid ${presentation.accent_color}30`
              }}
            >
              {currentSlide + 1} / {slides.length}
            </div>
          </div>
        </div>

        {/* Enhanced Speaker Notes Panel */}
        {showSpeakerNotes && (
          <div className="w-80 md:w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-l shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${presentation.accent_color}20` }}
                >
                  <FileText className="h-5 w-5" style={{ color: presentation.accent_color }} />
                </div>
                <h3 className="font-semibold text-lg">Speaker Notes</h3>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
                {currentSlideData.speaker_notes ? (
                  currentSlideData.speaker_notes.split('\n').map((note, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                      style={{ 
                        backgroundColor: `${presentation.accent_color}05`,
                        borderColor: `${presentation.accent_color}20`
                      }}
                    >
                      {note}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${presentation.accent_color}10` }}
                    >
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="italic text-slate-400">No speaker notes for this slide.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Bottom Controls */}
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-t shadow-lg">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            {/* Enhanced Slide Navigation */}
            <div className="flex items-center gap-3 md:gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => goToSlide(0)}
                      disabled={currentSlide === 0}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>First Slide (Home)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={previousSlide} 
                disabled={currentSlide === 0}
                className="transition-all duration-200 hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1 md:gap-2 max-w-xs overflow-x-auto">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-200 hover:scale-125 flex-shrink-0 ${
                      index === currentSlide
                        ? 'shadow-lg scale-125'
                        : index < currentSlide
                        ? 'shadow-md'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: index === currentSlide 
                        ? presentation.accent_color
                        : index < currentSlide 
                        ? `${presentation.accent_color}80`
                        : `${presentation.accent_color}40`
                    }}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextSlide} 
                disabled={currentSlide === slides.length - 1}
                className="transition-all duration-200 hover:scale-105"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => goToSlide(slides.length - 1)}
                      disabled={currentSlide === slides.length - 1}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last Slide (End)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Enhanced Playback Controls */}
            <div className="flex items-center gap-2 md:gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetPresentation}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset Presentation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={togglePlayback}
                      className="transition-all duration-200 hover:scale-105"
                      style={{ 
                        backgroundColor: isPlaying ? `${presentation.accent_color}20` : 'transparent',
                        borderColor: isPlaying ? presentation.accent_color : undefined
                      }}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPlaying ? 'Pause' : 'Play'} Auto-advance (P)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleFullscreen}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFullscreen ? 'Exit' : 'Enter'} Fullscreen (F)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

