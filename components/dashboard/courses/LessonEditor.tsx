'use client'

import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonEditorProps {
  lessonId: string;
  initialContent: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

const LessonEditor: React.FC<LessonEditorProps> = ({
  lessonId,
  initialContent,
  onContentChange,
  className
}) => {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const { saveNow } = useAutoSave(lessonId, content, {
    onSaveStart: () => setSaveStatus('saving'),
    onSaveSuccess: () => {
      setSaveStatus('saved');
      // Reset to idle after showing success briefly
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onSaveError: () => setSaveStatus('error')
  });

  const handleContentUpdate = (newContent: string) => {
    setContent(newContent);
    onContentChange?.(newContent);
    
    // Reset error status when user starts typing again
    if (saveStatus === 'error') {
      setSaveStatus('idle');
    }
  };

  const handleManualSave = () => {
    saveNow();
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Save className="h-4 w-4 animate-spin" />;
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return 'Save';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Save status and manual save button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getSaveStatusIcon()}
          <span>{getSaveStatusText()}</span>
          {saveStatus === 'idle' && (
            <span className="text-xs">• Auto-saves every 2 seconds</span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2"
        >
          {getSaveStatusIcon()}
          Save Now
        </Button>
      </div>

      {/* Rich text editor */}
      <RichTextEditor
        content={content}
        onUpdate={handleContentUpdate}
        placeholder="Start writing your lesson content..."
        autoSave={false} // We handle auto-save at this level
      />

      {/* Error message */}
      {saveStatus === 'error' && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          Failed to save content. Please check your connection and try again.
        </div>
      )}
    </div>
  );
};

export default LessonEditor;

