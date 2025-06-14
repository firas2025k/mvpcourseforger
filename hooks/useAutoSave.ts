import { createClient } from '@/lib/supabase/client';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  delay?: number;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export const useAutoSave = (
  lessonId: string,
  content: string,
  options: UseAutoSaveOptions = {}
) => {
  const {
    delay = 2000,
    onSaveStart,
    onSaveSuccess,
    onSaveError
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef<string>('');
  const isSavingRef = useRef<boolean>(false);

  const saveToDatabase = useCallback(async (htmlContent: string) => {
    if (isSavingRef.current || htmlContent === lastSavedContentRef.current) {
      return;
    }

    try {
      isSavingRef.current = true;
      onSaveStart?.();

      const response = await fetch('/api/lesson-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          content: htmlContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save lesson content');
      }

      lastSavedContentRef.current = htmlContent;
      onSaveSuccess?.();
      
      // Optional: Show a subtle success indicator
      // toast.success('Content saved', { duration: 1000 });
      
    } catch (error) {
      console.error('Auto-save error:', error);
      onSaveError?.(error as Error);
      toast.error('Failed to save content. Please try again.');
    } finally {
      isSavingRef.current = false;
    }
  }, [lessonId, onSaveStart, onSaveSuccess, onSaveError]);

  const debouncedSave = useCallback((htmlContent: string) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveToDatabase(htmlContent);
    }, delay);
  }, [saveToDatabase, delay]);

  // Trigger auto-save when content changes
  useEffect(() => {
    if (content && content !== lastSavedContentRef.current) {
      debouncedSave(content);
    }
  }, [content, debouncedSave]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveToDatabase(content);
  }, [saveToDatabase, content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveNow,
    isSaving: isSavingRef.current,
    lastSavedContent: lastSavedContentRef.current
  };
};

