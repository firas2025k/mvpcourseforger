"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { UseReadAloudReturn } from "@/hooks/useReadAloud";

interface ReadAloudButtonProps {
  readAloud: UseReadAloudReturn;
  content: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  readAloud,
  content,
  className = "",
  variant = "outline",
  size = "sm",
}) => {
  const { isSupported, isPlaying, isLoading, speak, stop, error } = readAloud;

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(content);
    }
  };

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={size}
            disabled
            className={`opacity-50 ${className}`}
          >
            <VolumeX className="h-4 w-4 mr-2" />
            Read Aloud
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Read aloud is not supported in this browser</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleClick}
          disabled={isLoading || !content.trim()}
          className={`transition-all duration-200 hover:scale-105 ${
            isPlaying
              ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              : ""
          } ${className}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Volume2
              className={`h-4 w-4 mr-2 ${isPlaying ? "animate-pulse" : ""}`}
            />
          )}
          {isLoading ? "Loading..." : isPlaying ? "Stop Reading" : "Read Aloud"}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {isLoading
            ? "Preparing to read content..."
            : isPlaying
            ? "Stop reading the lesson content"
            : "Listen to the lesson content being read aloud"}
        </p>
        {error && <p className="text-red-400 text-xs mt-1">Error: {error}</p>}
      </TooltipContent>
    </Tooltip>
  );
};
