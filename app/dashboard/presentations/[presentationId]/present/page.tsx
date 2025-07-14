// app/dashboard/presentations/[presentationId]/present/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Play,
  Pause,
  RotateCcw,
  Settings,
  StickyNote,
  Timer,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MarkdownSlideRenderer from "@/components/dashboard/presentations/MarkdownSlideRenderer";
import type { Slide } from "@/types/presentation";

interface PresentationData {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  slide_count: number;
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  slides: Slide[];
}

function PresentationFullscreenPage() {
  const router = useRouter();
  const params = useParams();
  const presentationId = params.presentationId as string;

  const [presentation, setPresentation] = useState<PresentationData | null>(
    null
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (presentationId) {
      fetchPresentation();
    }
  }, [presentationId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      isAutoPlay &&
      presentation &&
      currentSlideIndex < presentation.slides.length - 1
    ) {
      interval = setInterval(() => {
        setCurrentSlideIndex((prev) => prev + 1);
      }, autoPlayInterval);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, currentSlideIndex, presentation, autoPlayInterval]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchPresentation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/presentation-details/${presentationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load presentation");
      }

      const data = await response.json();
      setPresentation(data.presentation);
    } catch (err) {
      console.error("Error fetching presentation:", err);
      router.push(`/dashboard/presentations/${presentationId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    if (presentation && currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, presentation]);

  const previousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }, [currentSlideIndex]);

  const goToSlide = (index: number) => {
    if (presentation && index >= 0 && index < presentation.slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const renderSlideContent = (slide: Slide) => {
    if (!presentation) return null;
    return (
      <MarkdownSlideRenderer
        content={slide.content}
        textColor={presentation.text_color}
        accentColor={presentation.accent_color}
        layout={slide.layout}
        title={slide.title}
        imageUrl={slide.image_url}
        imageAlt={slide.image_alt}
      />
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
        case " ":
          event.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
          event.preventDefault();
          previousSlide();
          break;
        case "f":
        case "F":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "n":
        case "N":
          event.preventDefault();
          setShowNotes(!showNotes);
          break;
        case "Escape":
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [nextSlide, previousSlide, showNotes, isFullscreen]);

  if (isLoading || !presentation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading presentation...</p>
        </div>
      </div>
    );
  }

  const currentSlide = presentation.slides[currentSlideIndex];

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: presentation.background_color }}
    >
      {/* Main Slide Display */}
      <div className="h-screen w-full">{renderSlideContent(currentSlide)}</div>

      {/* Controls Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/presentations/${presentationId}`)
                }
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <Badge variant="secondary" className="bg-black/50 text-white">
                {currentSlideIndex + 1} / {presentation.slides.length}
              </Badge>
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Timer className="h-3 w-3 mr-1" />
                {formatTime(timeElapsed)}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="text-white hover:bg-white/20"
              >
                <StickyNote className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className="text-white hover:bg-white/20"
              >
                {isAutoPlay ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 flex items-center p-4 pointer-events-auto">
          <Button
            variant="ghost"
            size="lg"
            onClick={previousSlide}
            disabled={currentSlideIndex === 0}
            className="text-white hover:bg-white/20 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center p-4 pointer-events-auto">
          <Button
            variant="ghost"
            size="lg"
            onClick={nextSlide}
            disabled={currentSlideIndex === presentation.slides.length - 1}
            className="text-white hover:bg-white/20 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        {/* Bottom Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto">
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentSlideIndex + 1) / presentation.slides.length) * 100
                }%`,
              }}
            ></div>
          </div>

          {/* Slide Thumbnails */}
          <div className="flex gap-2 justify-center overflow-x-auto">
            {presentation.slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-10 rounded border-2 transition-all ${
                  index === currentSlideIndex
                    ? "border-white bg-white/20"
                    : "border-white/30 hover:border-white/60"
                }`}
                style={{ backgroundColor: presentation.background_color }}
              >
                <div className="w-full h-full flex items-center justify-center text-xs font-medium text-white">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Speaker Notes Dialog */}
      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Speaker Notes - Slide {currentSlideIndex + 1}
            </DialogTitle>
            <DialogDescription>{currentSlide.title}</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {currentSlide.speaker_notes ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {currentSlide.speaker_notes}
              </p>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No speaker notes for this slide.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PresentationFullscreenPage;
