// app/dashboard/presentations/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Presentation,
  Sparkles,
  Save,
  Eye,
  Wand2,
  Zap,
  Star,
  Palette,
  FileText,
  Users,
  Clock,
  Target,
  ImageIcon,
  Camera,
} from "lucide-react";
import CreatePresentationForm from "@/components/dashboard/presentations/CreatePresentationForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GeneratedSlide {
  title: string;
  content: string;
  type: "title" | "content" | "image" | "chart" | "conclusion";
  layout:
    | "default"
    | "title-only"
    | "two-column"
    | "image-left"
    | "image-right"
    | "full-image";
  speaker_notes?: string;
  image_keywords?: string[]; // New: Keywords for image search
  image_url?: string; // New: Selected image URL
  image_alt?: string; // New: Alt text for image
}

interface GeneratedPresentation {
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  slides: GeneratedSlide[];
  imagesIncluded?: boolean; // New: Track if images were included
}

export default function NewPresentationPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPresentation, setGeneratedPresentation] =
    useState<GeneratedPresentation | null>(null);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGenerate = async (data: any) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      let response;
      
      if (data.isPDF) {
        // Handle PDF-based generation
        setOriginalPrompt("PDF Document");
        
        response = await fetch("/api/generate-presentation-from-pdf", {
          method: "POST",
          body: data.formData, // FormData object
        });
      } else {
        // Handle text-based generation (existing functionality)
        setOriginalPrompt(data.prompt);
        
        response = await fetch("/api/generate-presentation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate presentation");
      }

      const responseData = await response.json();
      
      // Validate and sanitize the generated presentation data
      const sanitizedPresentation = {
        ...responseData.aiGeneratedPresentation,
        imagesIncluded: responseData.imagesIncluded || false,
        slides: responseData.aiGeneratedPresentation.slides.map((slide: any) => ({
          ...slide,
          content: slide.content || "No content available",
          speaker_notes: slide.speaker_notes || "",
          image_keywords: slide.image_keywords || [],
          image_url: slide.image_url || null,
          image_alt: slide.image_alt || null
        }))
      };
      
      setGeneratedPresentation(sanitizedPresentation);
      setSuccess("Presentation generated successfully!");
    } catch (err) {
      console.error("Error generating presentation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate presentation"
      );
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
        title: slide.title || `Slide ${index + 1}`,
        content: slide.content || "No content available",
        type: slide.type,
        layout: slide.layout,
        speaker_notes: slide.speaker_notes || "",
        image_url: slide.image_url || null,
        image_alt: slide.image_alt || null,
        image_keywords: slide.image_keywords || [],
        order_index: index,
      }));

      const saveData = {
        title: generatedPresentation.title,
        prompt: originalPrompt,
        difficulty: generatedPresentation.difficulty,
        theme: generatedPresentation.theme,
        background_color: generatedPresentation.background_color,
        text_color: generatedPresentation.text_color,
        accent_color: generatedPresentation.accent_color,
        includes_images: generatedPresentation.imagesIncluded || false,
        slides: slidesToSave,
      };

      const response = await fetch("/api/save-presentation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save presentation");
      }

      const result = await response.json();
      setSuccess("Presentation saved successfully!");

      // Redirect to the presentation detail page after a short delay
      setTimeout(() => {
        router.push(`/dashboard/presentations/${result.presentation.id}`);
      }, 1500);
    } catch (err) {
      console.error("Error saving presentation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save presentation"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!generatedPresentation) return;

    // Store presentation data in sessionStorage for preview
    sessionStorage.setItem(
      "previewPresentation",
      JSON.stringify({
        ...generatedPresentation,
        slides: generatedPresentation.slides.map((slide, index) => ({
          ...slide,
          id: `preview-${index}`,
          order_index: index,
          content: slide.content || "No content available",
          speaker_notes: slide.speaker_notes || "",
          image_url: slide.image_url || null,
          image_alt: slide.image_alt || null,
          image_keywords: slide.image_keywords || []
        })),
      })
    );

    // Open preview in new tab
    window.open("/dashboard/presentations/preview", "_blank");
  };

  // Helper function to safely render content lines
  const renderContentLines = (content: string | undefined) => {
    if (!content) {
      return (
        <p className="mb-1 last:mb-0 text-slate-400 italic">
          No content available
        </p>
      );
    }
    
    return content.split("\n").map((line, lineIndex) => (
      <p key={lineIndex} className="mb-1 last:mb-0">
        {line || "\u00A0"} {/* Non-breaking space for empty lines */}
      </p>
    ));
  };

  // Helper function to count slides with images
  const getSlidesWithImagesCount = () => {
    if (!generatedPresentation) return 0;
    return generatedPresentation.slides.filter(slide => slide.image_url).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              asChild
              className="hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm transition-all duration-300"
            >
              <Link href="/dashboard/presentations">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Presentations
              </Link>
            </Button>
          </div>

          {/* AI Features Highlight */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              AI-Powered Generation
            </span>
          </div>
        </div>

        {/* Status Messages with Enhanced Design */}
        {error && (
          <div className="mb-8 animate-in slide-in-from-top duration-300">
            <Alert className="border-red-200 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {success && (
          <div className="mb-8 animate-in slide-in-from-top duration-300">
            <Alert className="border-green-200 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                {success}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Hero Section */}
        {!generatedPresentation && !isGenerating && (
          <div className="text-center mb-12 animate-in fade-in duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl mb-6 shadow-lg shadow-purple-500/25">
              <Presentation className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Create New Presentation
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Transform your ideas or PDF documents into stunning presentations with AI-powered content generation and beautiful images
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
              <div className="flex flex-col items-center p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Wand2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  AI-Generated Content
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Intelligent content creation with speaker notes and structured layouts
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Smart Images
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Automatically add relevant, high-quality images from Pixabay
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  PDF Processing
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Upload PDF documents and automatically generate presentations from content
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Instant Generation
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Create complete presentations in seconds, not hours
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Generation Form */}
        {!generatedPresentation && !isGenerating && (
          <div className="animate-in slide-in-from-bottom duration-500 delay-200">
            <CreatePresentationForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {/* Enhanced Loading State */}
        {isGenerating && (
          <div className="animate-in fade-in duration-500">
            <Card className="max-w-2xl mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-purple-500/20">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  {/* Animated Icon */}
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl animate-pulse"></div>
                    <div className="absolute inset-2 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                      <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                    </div>
                  </div>

                  {/* Loading Text */}
                  <div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {originalPrompt === "PDF Document" ? "Processing Your PDF" : "Generating Your Presentation"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                      {originalPrompt === "PDF Document" 
                        ? "AI is analyzing your PDF content and creating slides..."
                        : "AI is creating slides, content, speaker notes, and selecting images for you..."
                      }
                    </p>
                  </div>

                  {/* Progress Indicators */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span>{originalPrompt === "PDF Document" ? "Extracting content" : "Analyzing topic"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-300"></div>
                        <span>Creating slides</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-500"></div>
                        <span>Adding content</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-700"></div>
                        <span>Finding images</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      This may take a few moments
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Generated Presentation Preview */}
        {generatedPresentation && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Enhanced Presentation Header */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-purple-500/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
              <CardHeader className="relative">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                        <Presentation className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {generatedPresentation.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <Badge
                            className={`${
                              generatedPresentation.difficulty === "beginner"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : generatedPresentation.difficulty ===
                                  "intermediate"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            } capitalize font-medium`}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {generatedPresentation.difficulty}
                          </Badge>
                          <Badge variant="outline" className="font-medium">
                            <FileText className="h-3 w-3 mr-1" />
                            {generatedPresentation.slides.length} slides
                          </Badge>
                          <Badge
                            variant="outline"
                            className="font-medium capitalize"
                          >
                            <Palette className="h-3 w-3 mr-1" />
                            {generatedPresentation.theme} theme
                          </Badge>
                          {generatedPresentation.imagesIncluded && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {getSlidesWithImagesCount()} images included
                            </Badge>
                          )}
                          {originalPrompt === "PDF Document" && (
                            <Badge variant="outline" className="font-medium">
                              <FileText className="h-3 w-3 mr-1" />
                              Generated from PDF
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      className="hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
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

            {/* Enhanced Slides Preview */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Slide Preview
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    AI-generated content
                  </div>
                  {generatedPresentation.imagesIncluded && (
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-blue-500" />
                      Smart image selection
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6">
                {generatedPresentation.slides.map((slide, index) => (
                  <Card
                    key={index}
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="relative pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <CardTitle className="text-lg font-semibold">
                            {slide.title || `Slide ${index + 1}`}
                          </CardTitle>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {slide.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {slide.layout.replace("-", " ")}
                          </Badge>
                          {slide.image_url && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Image
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        {/* Image Preview */}
                        {slide.image_url && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                              <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400">
                                Selected Image
                              </h4>
                              {slide.image_keywords && slide.image_keywords.length > 0 && (
                                <div className="flex gap-1 ml-2">
                                  {slide.image_keywords.slice(0, 3).map((keyword, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-600/30">
                              <img
                                src={slide.image_url}
                                alt={slide.image_alt || slide.title}
                                className="w-full h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {slide.image_alt && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                  {slide.image_alt}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400">
                              Content
                            </h4>
                          </div>
                          <div className="text-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-4 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                            {renderContentLines(slide.content)}
                          </div>
                        </div>
                        {slide.speaker_notes && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="h-4 w-4 text-blue-500" />
                              <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400">
                                Speaker Notes
                              </h4>
                            </div>
                            <div className="text-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-600/30">
                              {renderContentLines(slide.speaker_notes)}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

