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
  EyeOff
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
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-6xl font-bold mb-4" style={{ color: presentation.text_color }}>
              {slide.title}
            </h1>
            {contentLines.length > 0 && (
              <p className="text-2xl opacity-80" style={{ color: presentation.text_color }}>
                {contentLines[0]}
              </p>
            )}
          </div>
        );
      
      case 'two-column':
        const midPoint = Math.ceil(contentLines.length / 2);
        const leftContent = contentLines.slice(0, midPoint);
        const rightContent = contentLines.slice(midPoint);
        
        return (
          <div className="h-full flex flex-col">
            <h2 className="text-4xl font-bold mb-8" style={{ color: presentation.text_color }}>
              {slide.title}
            </h2>
            <div className="flex-1 grid grid-cols-2 gap-8">
              <div className="space-y-4">
                {leftContent.map((line, index) => (
                  <p key={index} className="text-xl leading-relaxed" style={{ color: presentation.text_color }}>
                    {line}
                  </p>
                ))}
              </div>
              <div className="space-y-4">
                {rightContent.map((line, index) => (
                  <p key={index} className="text-xl leading-relaxed" style={{ color: presentation.text_color }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full flex flex-col">
            <h2 className="text-4xl font-bold mb-8" style={{ color: presentation.text_color }}>
              {slide.title}
            </h2>
            <div className="flex-1 space-y-6">
              {contentLines.map((line, index) => (
                <p key={index} className="text-xl leading-relaxed" style={{ color: presentation.text_color }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Controls */}
      {!isFullscreen && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{presentation.title}</h1>
            <Badge variant="outline">
              {currentSlide + 1} / {slides.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Timer Display */}
            {isPlaying && autoAdvanceTime > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Timer className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">{timeRemaining}s</span>
              </div>
            )}
            
            {/* Speaker Notes Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            >
              {showSpeakerNotes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            {/* Settings */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Presentation Settings</SheetTitle>
                  <SheetDescription>
                    Configure your presentation experience
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium">Auto-advance time (seconds)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={autoAdvanceTime}
                      onChange={(e) => setAutoAdvanceTime(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Exit Button */}
            <Button variant="outline" size="sm" onClick={onExit}>
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Slide Display */}
        <div className="flex-1 relative">
          <div 
            className="h-full p-12 flex items-center justify-center"
            style={{ backgroundColor: presentation.background_color }}
          >
            <div className="w-full max-w-6xl">
              {renderSlideContent(currentSlideData)}
            </div>
          </div>
          
          {/* Navigation Overlay */}
          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <Button
              variant="ghost"
              size="lg"
              onClick={previousSlide}
              disabled={currentSlide === 0}
              className="pointer-events-auto bg-black/20 hover:bg-black/40 text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="pointer-events-auto bg-black/20 hover:bg-black/40 text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Speaker Notes Panel */}
        {showSpeakerNotes && (
          <div className="w-80 bg-white dark:bg-slate-800 border-l p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <h3 className="font-semibold">Speaker Notes</h3>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              {currentSlideData.speaker_notes ? (
                currentSlideData.speaker_notes.split('\n').map((note, index) => (
                  <p key={index}>{note}</p>
                ))
              ) : (
                <p className="italic">No speaker notes for this slide.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-white dark:bg-slate-800 border-t p-4">
        <div className="flex items-center justify-between">
          {/* Slide Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousSlide} disabled={currentSlide === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide
                      ? 'bg-blue-600'
                      : index < currentSlide
                      ? 'bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <Button variant="outline" size="sm" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={togglePlayback}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

