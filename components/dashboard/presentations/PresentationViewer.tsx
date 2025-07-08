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
  Presentation
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  const slides = presentation.slides.sort((a, b) => a.order_index - b.order_index);
  const currentSlideData = slides[currentSlide];

  // Auto-advance functionality
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

  // Keyboard navigation
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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isFullscreen, showSpeakerNotes]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      const newSlide = currentSlide + 1;
      setCurrentSlide(newSlide);
      onSlideChange?.(newSlide);
    } else {
      setIsPlaying(false);
    }
  }, [currentSlide, slides.length, onSlideChange]);

  const previousSlide = useCallback(() => {
    if (currentSlide > 0) {
      const newSlide = currentSlide - 1;
      setCurrentSlide(newSlide);
      onSlideChange?.(newSlide);
    }
  }, [currentSlide, onSlideChange]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
      onSlideChange?.(index);
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

  const renderSlideContent = (slide: Slide) => {
    const contentLines = slide.content.split('\n').filter(line => line.trim());
    
    switch (slide.layout) {
      case 'title-only':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16">
            <div className="max-w-6xl mx-auto space-y-8">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight" style={{ color: presentation.text_color }}>
                {slide.title}
              </h1>
              {contentLines.length > 0 && (
                <p className="text-2xl md:text-3xl lg:text-4xl opacity-90 font-medium leading-relaxed" style={{ color: presentation.text_color }}>
                  {contentLines[0]}
                </p>
              )}
            </div>
          </div>
        );
      
      case 'two-column':
        const midPoint = Math.ceil(contentLines.length / 2);
        const leftContent = contentLines.slice(0, midPoint);
        const rightContent = contentLines.slice(midPoint);
        
        return (
          <div className="h-full flex flex-col px-8 md:px-16 py-8">
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: presentation.text_color }}>
                {slide.title}
              </h2>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              <div className="space-y-6">
                {leftContent.map((line, index) => (
                  <p key={index} className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium" style={{ color: presentation.text_color }}>
                    {line}
                  </p>
                ))}
              </div>
              <div className="space-y-6">
                {rightContent.map((line, index) => (
                  <p key={index} className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium" style={{ color: presentation.text_color }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full flex flex-col px-8 md:px-16 lg:px-20 py-8 md:py-12">
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: presentation.text_color }}>
                {slide.title}
              </h2>
            </div>
            <div className="flex-1 space-y-8 md:space-y-10">
              {contentLines.map((line, index) => (
                <div key={index} className="flex items-start gap-4 md:gap-6">
                  <div 
                    className="w-3 h-3 md:w-4 md:h-4 rounded-full mt-3 md:mt-4 flex-shrink-0"
                    style={{ backgroundColor: presentation.accent_color }}
                  />
                  <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium flex-1" style={{ color: presentation.text_color }}>
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
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Enhanced Top Controls */}
      {!isFullscreen && (
        <div className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-slate-800 border-b shadow-sm">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <Presentation className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg md:text-xl font-semibold">{presentation.title}</h1>
            </div>
            <Badge variant="outline" className="text-sm font-medium">
              {currentSlide + 1} / {slides.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Enhanced Timer Display */}
            {isPlaying && autoAdvanceTime > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Timer className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">{timeRemaining}s</span>
              </div>
            )}
            
            {/* Enhanced Speaker Notes Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className="transition-all duration-200 hover:scale-105"
            >
              {showSpeakerNotes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            {/* Enhanced Settings */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80">
                <SheetHeader>
                  <SheetTitle>Presentation Settings</SheetTitle>
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
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Enhanced Exit Button */}
            <Button variant="outline" size="sm" onClick={onExit} className="transition-all duration-200 hover:scale-105">
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Main Content Area */}
      <div className="flex-1 flex">
        {/* Enhanced Slide Display */}
        <div className="flex-1 relative">
          <div 
            className="h-full flex items-center justify-center transition-all duration-300"
            style={{ backgroundColor: presentation.background_color }}
          >
            <div className="w-full max-w-7xl mx-auto h-full">
              {renderSlideContent(currentSlideData)}
            </div>
          </div>
          
          {/* Enhanced Navigation Overlay */}
          <div className="absolute inset-0 flex items-center justify-between p-6 md:p-8 pointer-events-none">
            <Button
              variant="ghost"
              size="lg"
              onClick={previousSlide}
              disabled={currentSlide === 0}
              className="pointer-events-auto bg-black/20 hover:bg-black/40 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="pointer-events-auto bg-black/20 hover:bg-black/40 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
          </div>
        </div>

        {/* Enhanced Speaker Notes Panel */}
        {showSpeakerNotes && (
          <div className="w-80 md:w-96 bg-white dark:bg-slate-800 border-l shadow-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Speaker Notes</h3>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
                {currentSlideData.speaker_notes ? (
                  currentSlideData.speaker_notes.split('\n').map((note, index) => (
                    <p key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">{note}</p>
                  ))
                ) : (
                  <p className="italic text-center py-8 text-slate-400">No speaker notes for this slide.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Bottom Controls */}
      <div className="bg-white dark:bg-slate-800 border-t shadow-lg">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            {/* Enhanced Slide Navigation */}
            <div className="flex items-center gap-3 md:gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={previousSlide} 
                disabled={currentSlide === 0}
                className="transition-all duration-200 hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-200 hover:scale-125 ${
                      index === currentSlide
                        ? 'bg-blue-600 shadow-lg'
                        : index < currentSlide
                        ? 'bg-green-600 shadow-md'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
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
            </div>

            {/* Enhanced Playback Controls */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={togglePlayback}
                className="transition-all duration-200 hover:scale-105"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleFullscreen}
                className="transition-all duration-200 hover:scale-105"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

