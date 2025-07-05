// app/dashboard/presentations/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Presentation,
  Sparkles,
  Save,
  Eye
} from "lucide-react";
import CreatePresentationForm from "@/components/dashboard/presentations/CreatePresentationForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GeneratedSlide {
  title: string;
  content: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
  layout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  speaker_notes?: string;
}

interface GeneratedPresentation {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  slides: GeneratedSlide[];
}

export default function NewPresentationPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPresentation, setGeneratedPresentation] = useState<GeneratedPresentation | null>(null);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGenerate = async (formData: any) => {
    try {
      setIsGenerating(true);
      setError(null);
      setOriginalPrompt(formData.prompt);

      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate presentation');
      }

      const data = await response.json();
      setGeneratedPresentation(data.aiGeneratedPresentation);
      setSuccess('Presentation generated successfully!');
    } catch (err) {
      console.error('Error generating presentation:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate presentation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPresentation) return;

    try {
      setIsSaving(true);
      setError(null);

      const slidesToSave = generatedPresentation.slides.map((slide, index) => ({
        title: slide.title,
        content: slide.content,
        type: slide.type,
        layout: slide.layout,
        speaker_notes: slide.speaker_notes || '',
        order_index: index
      }));

      const saveData = {
        title: generatedPresentation.title,
        prompt: originalPrompt,
        difficulty: generatedPresentation.difficulty,
        theme: generatedPresentation.theme,
        background_color: generatedPresentation.background_color,
        text_color: generatedPresentation.text_color,
        accent_color: generatedPresentation.accent_color,
        slides: slidesToSave
      };

      const response = await fetch('/api/save-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save presentation');
      }

      const result = await response.json();
      setSuccess('Presentation saved successfully!');
      
      // Redirect to the presentation detail page after a short delay
      setTimeout(() => {
        router.push(`/dashboard/presentations/${result.presentation.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error saving presentation:', err);
      setError(err instanceof Error ? err.message : 'Failed to save presentation');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!generatedPresentation) return;
    
    // Store presentation data in sessionStorage for preview
    sessionStorage.setItem('previewPresentation', JSON.stringify({
      ...generatedPresentation,
      slides: generatedPresentation.slides.map((slide, index) => ({
        ...slide,
        id: `preview-${index}`,
        order_index: index
      }))
    }));
    
    // Open preview in new tab
    window.open('/dashboard/presentations/preview', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/presentations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Presentations
            </Link>
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Generation Form */}
        {!generatedPresentation && (
          <CreatePresentationForm 
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}

        {/* Loading State */}
        {isGenerating && (
          <Card className="max-w-2xl mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Generating Your Presentation</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    AI is creating slides, content, and speaker notes for you...
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Sparkles className="h-4 w-4" />
                  This may take a few moments
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Presentation Preview */}
        {generatedPresentation && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Presentation Header */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <Presentation className="h-6 w-6 text-purple-600" />
                      {generatedPresentation.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <Badge className={
                        generatedPresentation.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        generatedPresentation.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {generatedPresentation.difficulty}
                      </Badge>
                      <span>{generatedPresentation.slides.length} slides</span>
                      <span className="capitalize">{generatedPresentation.theme} theme</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePreview}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Presentation
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Slides Preview */}
            <div className="grid gap-4">
              {generatedPresentation.slides.map((slide, index) => (
                <Card key={index} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Slide {index + 1}: {slide.title}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">
                          {slide.type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {slide.layout.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400 mb-2">Content:</h4>
                        <div className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          {slide.content.split('\n').map((line, lineIndex) => (
                            <p key={lineIndex} className="mb-1">{line}</p>
                          ))}
                        </div>
                      </div>
                      {slide.speaker_notes && (
                        <div>
                          <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400 mb-2">Speaker Notes:</h4>
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            {slide.speaker_notes.split('\n').map((line, lineIndex) => (
                              <p key={lineIndex} className="mb-1">{line}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

