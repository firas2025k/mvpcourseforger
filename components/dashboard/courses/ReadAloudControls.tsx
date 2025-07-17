"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Play,
  Pause,
  Square,
  Settings,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Loader2,
} from "lucide-react";
import { UseReadAloudReturn } from "@/hooks/useReadAloud";
import { ReadAloudSettings } from "./ReadAloudSettings";

interface ReadAloudControlsProps {
  readAloud: UseReadAloudReturn;
  content: string;
  className?: string;
}

export const ReadAloudControls: React.FC<ReadAloudControlsProps> = ({
  readAloud,
  content,
  className = "",
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const {
    isSupported,
    isPlaying,
    isPaused,
    isLoading,
    currentPosition,
    totalLength,
    speak,
    pause,
    resume,
    stop,
    error,
    clearError,
  } = readAloud;

  const handlePlayPause = () => {
    if (!isPlaying && !isPaused) {
      speak(content);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
    clearError();
  };

  const progressPercentage =
    totalLength > 0 ? (currentPosition / totalLength) * 100 : 0;

  if (!isSupported) {
    return (
      <Card
        className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${className}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <VolumeX className="h-5 w-5" />
            <span className="text-sm">
              Read aloud is not supported in this browser
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg ${className}`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Volume2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Read Aloud
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isLoading
                  ? "Preparing content..."
                  : isPlaying
                  ? isPaused
                    ? "Paused"
                    : "Playing"
                  : "Ready to play"}
              </p>
            </div>
          </div>

          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <ReadAloudSettings readAloud={readAloud} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Progress Bar */}
        {(isPlaying || isPaused) && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Progress
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {currentPosition} / {totalLength} segments
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 bg-slate-200 dark:bg-slate-700"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-2">
          {/* Play/Pause Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="lg"
                onClick={handlePlayPause}
                disabled={isLoading || !content.trim()}
                className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : isPaused || (!isPlaying && !isPaused) ? (
                  <Play className="h-6 w-6 ml-0.5" />
                ) : (
                  <Pause className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isLoading
                  ? "Loading..."
                  : isPaused
                  ? "Resume reading"
                  : isPlaying
                  ? "Pause reading"
                  : "Start reading"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Stop Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                onClick={handleStop}
                disabled={!isPlaying && !isPaused}
                className="h-12 w-12 rounded-full border-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110"
              >
                <Square className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stop reading</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Quick Info */}
        {(isPlaying || isPaused) && (
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isPaused ? "Reading paused" : "Now reading lesson content"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
