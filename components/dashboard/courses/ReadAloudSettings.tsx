"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Volume2, Gauge, Mic, RotateCcw, Info } from "lucide-react";
import { UseReadAloudReturn } from "@/hooks/useReadAloud";

interface ReadAloudSettingsProps {
  readAloud: UseReadAloudReturn;
}

export const ReadAloudSettings: React.FC<ReadAloudSettingsProps> = ({
  readAloud,
}) => {
  const {
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    setVoice,
    setRate,
    setPitch,
    setVolume,
  } = readAloud;

  const handleVoiceChange = (voiceName: string) => {
    const voice = voices.find((v) => v.name === voiceName);
    if (voice) {
      setVoice(voice);
    }
  };

  const resetToDefaults = () => {
    setRate(1);
    setPitch(1);
    setVolume(1);
    if (voices.length > 0) {
      const englishVoice = voices.find((voice) => voice.lang.startsWith("en"));
      setVoice(englishVoice || voices[0]);
    }
  };

  // Group voices by language for better organization
  const groupedVoices = voices.reduce((acc, voice) => {
    const lang = voice.lang.split("-")[0];
    if (!acc[lang]) {
      acc[lang] = [];
    }
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  const getLanguageName = (langCode: string) => {
    const langNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      ar: "Arabic",
      hi: "Hindi",
    };
    return langNames[langCode] || langCode.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Read Aloud Settings
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Customize your listening experience
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset to defaults</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* Voice Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <Label className="text-sm font-medium">Voice</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-slate-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Choose the voice that will read the content</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Select
          value={selectedVoice?.name || ""}
          onValueChange={handleVoiceChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {Object.entries(groupedVoices).map(([langCode, langVoices]) => (
              <div key={langCode}>
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800">
                  {getLanguageName(langCode)}
                </div>
                {langVoices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{voice.name}</span>
                      <div className="flex items-center gap-1 ml-2">
                        {voice.default && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                        {voice.localService && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                            Local
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        {selectedVoice && (
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded">
            <strong>Selected:</strong> {selectedVoice.name} (
            {selectedVoice.lang})
          </div>
        )}
      </div>

      <Separator />

      {/* Speed Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-green-600 dark:text-green-400" />
            <Label className="text-sm font-medium">Speed</Label>
          </div>
          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
            {rate.toFixed(1)}x
          </span>
        </div>

        <Slider
          value={[rate]}
          onValueChange={(value) => setRate(value[0])}
          min={0.5}
          max={2}
          step={0.1}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Slower (0.5x)</span>
          <span>Normal (1.0x)</span>
          <span>Faster (2.0x)</span>
        </div>
      </div>

      <Separator />

      {/* Volume Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <Label className="text-sm font-medium">Volume</Label>
          </div>
          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
            {Math.round(volume * 100)}%
          </span>
        </div>

        <Slider
          value={[volume]}
          onValueChange={(value) => setVolume(value[0])}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Mute (0%)</span>
          <span>Max (100%)</span>
        </div>
      </div>

      <Separator />

      {/* Pitch Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-orange-600 dark:bg-orange-400 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full"></div>
            </div>
            <Label className="text-sm font-medium">Pitch</Label>
          </div>
          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
            {pitch.toFixed(1)}
          </span>
        </div>

        <Slider
          value={[pitch]}
          onValueChange={(value) => setPitch(value[0])}
          min={0.5}
          max={2}
          step={0.1}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Lower (0.5)</span>
          <span>Normal (1.0)</span>
          <span>Higher (2.0)</span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Tips for better listening:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use headphones for better audio quality</li>
              <li>Adjust speed based on content complexity</li>
              <li>Settings are saved automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
