import { useState, useEffect, useCallback, useRef } from "react";

export interface UseReadAloudReturn {
  // Status
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;

  // Content info
  currentPosition: number;
  totalLength: number;
  currentText: string;

  // Voice options
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;

  // Settings
  rate: number;
  pitch: number;
  volume: number;

  // Actions
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;

  // Error handling
  error: string | null;
  clearError: () => void;
}

// Text processing utilities
const cleanTextForSpeech = (text: string): string => {
  // Remove HTML tags
  let cleanText = text.replace(/<[^>]*>/g, " ");

  // Remove markdown syntax
  cleanText = cleanText
    .replace(/#{1,6}\s/g, "") // Headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1") // Italic
    .replace(/`(.*?)`/g, "$1") // Inline code
    .replace(/```[\s\S]*?```/g, "[Code block]") // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "Image: $1") // Images
    .replace(/^\s*[-*+]\s/gm, "") // List items
    .replace(/^\s*\d+\.\s/gm, "") // Numbered lists
    .replace(/^\s*>\s/gm, "") // Blockquotes
    .replace(/---+/g, "") // Horizontal rules
    .replace(/\|/g, " "); // Table separators

  // Clean up whitespace
  cleanText = cleanText
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, ". ")
    .trim();

  // Add natural pauses
  cleanText = cleanText
    .replace(/\.\s+/g, ". ")
    .replace(/!\s+/g, "! ")
    .replace(/\?\s+/g, "? ")
    .replace(/:\s+/g, ": ")
    .replace(/;\s+/g, "; ");

  return cleanText;
};

const STORAGE_KEYS = {
  VOICE: "readAloud_selectedVoice",
  RATE: "readAloud_rate",
  PITCH: "readAloud_pitch",
  VOLUME: "readAloud_volume",
};

export const useReadAloud = (): UseReadAloudReturn => {
  // Check if Speech Synthesis is supported
  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoiceState] =
    useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRateState] = useState(1);
  const [pitch, setPitchState] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef(0);

  // Load voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Load saved voice preference
      const savedVoiceName = localStorage.getItem(STORAGE_KEYS.VOICE);
      if (savedVoiceName) {
        const savedVoice = availableVoices.find(
          (voice) => voice.name === savedVoiceName
        );
        if (savedVoice) {
          setSelectedVoiceState(savedVoice);
        }
      } else if (availableVoices.length > 0) {
        // Default to first English voice or first available voice
        const englishVoice = availableVoices.find((voice) =>
          voice.lang.startsWith("en")
        );
        setSelectedVoiceState(englishVoice || availableVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // Load saved settings
  useEffect(() => {
    if (!isSupported) return;

    const savedRate = localStorage.getItem(STORAGE_KEYS.RATE);
    const savedPitch = localStorage.getItem(STORAGE_KEYS.PITCH);
    const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);

    if (savedRate) setRateState(parseFloat(savedRate));
    if (savedPitch) setPitchState(parseFloat(savedPitch));
    if (savedVolume) setVolumeState(parseFloat(savedVolume));
  }, [isSupported]);

  // Chunk text for better speech synthesis
  const chunkText = useCallback((text: string): string[] => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 200) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          chunks.push(sentence);
        }
      } else {
        currentChunk += (currentChunk ? " " : "") + sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter((chunk) => chunk.length > 0);
  }, []);

  // Speak next chunk
  const speakNextChunk = useCallback(() => {
    if (
      !isSupported ||
      currentChunkIndexRef.current >= textChunksRef.current.length
    ) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
      currentChunkIndexRef.current = 0;
      return;
    }

    const chunk = textChunksRef.current[currentChunkIndexRef.current];
    const utterance = new SpeechSynthesisUtterance(chunk);

    // Set voice and properties
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setError(null);
    };

    utterance.onend = () => {
      currentChunkIndexRef.current++;
      setCurrentPosition(currentChunkIndexRef.current);
      speakNextChunk();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setError(`Speech error: ${event.error}`);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, rate, pitch, volume]);

  // Main speak function
  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        setError("Speech synthesis is not supported in this browser");
        return;
      }

      if (!text.trim()) {
        setError("No text to read");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Stop any current speech
        speechSynthesis.cancel();

        // Clean and chunk the text
        const cleanText = cleanTextForSpeech(text);
        const chunks = chunkText(cleanText);

        textChunksRef.current = chunks;
        currentChunkIndexRef.current = 0;
        setCurrentText(cleanText);
        setTotalLength(chunks.length);
        setCurrentPosition(0);

        setIsLoading(false);

        // Start speaking
        speakNextChunk();
      } catch (err) {
        setError(
          `Failed to start speech: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setIsLoading(false);
      }
    },
    [isSupported, chunkText, speakNextChunk]
  );

  // Pause function
  const pause = useCallback(() => {
    if (!isSupported || !isPlaying) return;

    speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported, isPlaying]);

  // Resume function
  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;

    speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported, isPaused]);

  // Stop function
  const stop = useCallback(() => {
    if (!isSupported) return;

    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPosition(0);
    currentChunkIndexRef.current = 0;
    utteranceRef.current = null;
  }, [isSupported]);

  // Voice setter with persistence
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoiceState(voice);
    localStorage.setItem(STORAGE_KEYS.VOICE, voice.name);
  }, []);

  // Rate setter with persistence
  const setRate = useCallback((newRate: number) => {
    const clampedRate = Math.max(0.1, Math.min(10, newRate));
    setRateState(clampedRate);
    localStorage.setItem(STORAGE_KEYS.RATE, clampedRate.toString());
  }, []);

  // Pitch setter with persistence
  const setPitch = useCallback((newPitch: number) => {
    const clampedPitch = Math.max(0, Math.min(2, newPitch));
    setPitchState(clampedPitch);
    localStorage.setItem(STORAGE_KEYS.PITCH, clampedPitch.toString());
  }, []);

  // Volume setter with persistence
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    localStorage.setItem(STORAGE_KEYS.VOLUME, clampedVolume.toString());
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    // Status
    isSupported,
    isPlaying,
    isPaused,
    isLoading,

    // Content info
    currentPosition,
    totalLength,
    currentText,

    // Voice options
    voices,
    selectedVoice,

    // Settings
    rate,
    pitch,
    volume,

    // Actions
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setPitch,
    setVolume,

    // Error handling
    error,
    clearError,
  };
};
