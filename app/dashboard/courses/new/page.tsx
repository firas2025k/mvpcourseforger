"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Zap,
  Star,
  Crown,
  GraduationCap,
  Coins,
  Calculator,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GenerationProgress {
  stage: string;
  progress: number;
  message: string;
}

export default function EnhancedCourseGenerationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [generationMode, setGenerationMode] = useState<"prompt" | "pdf">(
    "prompt"
  );
  const [prompt, setPrompt] = useState("");
  const [chapters, setChapters] = useState("3");
  const [lessonsPerChapter, setLessonsPerChapter] = useState("3");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");

  // PDF upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] =
    useState<GenerationProgress>({
      stage: "",
      progress: 0,
      message: "",
    });

  // Credit cost state
  const [creditCost, setCreditCost] = useState(0);

  // Credit cost calculation function (same as API)
  const calculateCourseCreditCost = useCallback((chapters: number, lessonsPerChapter: number): number => {
    const lessonCost = chapters * lessonsPerChapter; // 1 credit per lesson
    const chapterCost = chapters; // 1 credit per chapter
    const totalCost = lessonCost + chapterCost;
    return Math.max(totalCost, 3); // Minimum cost of 3 credits
  }, []);

  // Update credit cost when parameters change
  useEffect(() => {
    const chaptersNum = parseInt(chapters);
    const lessonsNum = parseInt(lessonsPerChapter);
    const cost = calculateCourseCreditCost(chaptersNum, lessonsNum);
    setCreditCost(cost);
  }, [chapters, lessonsPerChapter, calculateCourseCreditCost]);

  // File upload handlers
  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Invalid file type", {
        description: "Please select a PDF file.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("File too large", {
        description: "Please select a PDF file smaller than 10MB.",
      });
      return;
    }

    setSelectedFile(file);
    toast.success("PDF file selected", {
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Progress simulation for demo purposes
  const simulateProgress = useCallback(
    (stages: Array<{ stage: string; message: string; duration: number }>) => {
      let currentStage = 0;
      const totalStages = stages.length;

      const updateProgress = () => {
        if (currentStage < totalStages) {
          const stage = stages[currentStage];
          setGenerationProgress({
            stage: stage.stage,
            progress: ((currentStage + 1) / totalStages) * 100,
            message: stage.message,
          });

          setTimeout(() => {
            currentStage++;
            updateProgress();
          }, stage.duration);
        }
      };

      updateProgress();
    },
    []
  );

  // Course generation handlers
  const handlePromptGeneration = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a course prompt");
      return;
    }

    setIsGenerating(true);

    // Simulate progress for prompt-based generation
    simulateProgress([
      {
        stage: "Analyzing prompt",
        message: "Understanding your course requirements...",
        duration: 1000,
      },
      {
        stage: "Generating outline",
        message: "Creating course structure...",
        duration: 2000,
      },
      {
        stage: "Creating content",
        message: "Generating lessons and quizzes...",
        duration: 3000,
      },
      {
        stage: "Finalizing",
        message: "Preparing your course...",
        duration: 1000,
      },
    ]);

    try {
      const response = await fetch("/api/generate-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          chapters: parseInt(chapters),
          lessons_per_chapter: parseInt(lessonsPerChapter),
          difficulty,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        sessionStorage.setItem("generatedCourseData", JSON.stringify(result));
        toast.success("Course generated successfully!");
        router.push("/dashboard/courses/preview");
      } else {
        console.error("Failed to generate course:", result);
        toast.error("Error generating course", {
          description: result.error || "Unknown error occurred.",
        });
      }
    } catch (error) {
      console.error("Error during generation:", error);
      toast.error("An unexpected error occurred", {
        description: "Please try again.",
      });
    }

    setIsGenerating(false);
  };

  const handlePdfGeneration = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    setIsGenerating(true);

    // Simulate progress for PDF-based generation
    simulateProgress([
      {
        stage: "Uploading PDF",
        message: "Uploading your document...",
        duration: 1000,
      },
      {
        stage: "Extracting content",
        message: "Parsing PDF content...",
        duration: 2000,
      },
      {
        stage: "Analyzing structure",
        message: "Understanding document structure...",
        duration: 1500,
      },
      {
        stage: "Generating course",
        message: "Creating course from content...",
        duration: 3000,
      },
      {
        stage: "Finalizing",
        message: "Preparing your course...",
        duration: 1000,
      },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("chapters", chapters);
      formData.append("lessons_per_chapter", lessonsPerChapter);
      formData.append("difficulty", difficulty);

      const response = await fetch("/api/generate-course-from-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        sessionStorage.setItem("generatedCourseData", JSON.stringify(result));
        toast.success("Course generated from PDF successfully!");
        router.push("/dashboard/courses/preview");
      } else {
        console.error("Failed to generate course from PDF:", result);
        toast.error("Error generating course from PDF", {
          description: result.error || "Unknown error occurred.",
        });
      }
    } catch (error) {
      console.error("Error during PDF generation:", error);
      toast.error("An unexpected error occurred", {
        description: "Please try again.",
      });
    }

    setIsGenerating(false);
  };

  const handleGenerate = () => {
    if (generationMode === "prompt") {
      handlePromptGeneration();
    } else {
      handlePdfGeneration();
    }
  };

  // Get cost level for styling
  const getCostLevel = (cost: number) => {
    if (cost <= 5) return "low";
    if (cost <= 10) return "medium";
    return "high";
  };

  const costLevel = getCostLevel(creditCost);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="hover:scale-105 transition-all duration-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Main Card with Enhanced Styling */}
        <Card className="shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-t-lg"></div>
            <div className="relative">
              <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent flex items-center gap-3">
                <div className="relative">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-20 animate-pulse"></div>
                </div>
                Create New Course
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Generate a course from a text prompt or upload a PDF document to
                create structured learning content with AI-powered insights.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Generation Mode Tabs with Enhanced Styling */}
            <Tabs
              value={generationMode}
              onValueChange={(value) =>
                setGenerationMode(value as "prompt" | "pdf")
              }
            >
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <TabsTrigger 
                  value="prompt" 
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300 hover:scale-[1.02]",
                    generationMode === "prompt" && "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  )}
                >
                  <div className="relative">
                    <Sparkles className="h-4 w-4" />
                    {generationMode === "prompt" && (
                      <div className="absolute inset-0 bg-white rounded-full blur opacity-30 animate-pulse"></div>
                    )}
                  </div>
                  Create from Prompt
                  {generationMode === "prompt" && <Zap className="h-3 w-3 text-yellow-300" />}
                </TabsTrigger>
                <TabsTrigger 
                  value="pdf" 
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300 hover:scale-[1.02]",
                    generationMode === "pdf" && "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  )}
                >
                  <div className="relative">
                    <Upload className="h-4 w-4" />
                    {generationMode === "pdf" && (
                      <div className="absolute inset-0 bg-white rounded-full blur opacity-30 animate-pulse"></div>
                    )}
                  </div>
                  Create from PDF
                  {generationMode === "pdf" && <Star className="h-3 w-3 text-yellow-300" />}
                </TabsTrigger>
              </TabsList>

              {/* Prompt-based Generation */}
              <TabsContent value="prompt" className="space-y-6 mt-8">
                <div className="space-y-3">
                  <Label htmlFor="prompt" className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Course Description
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl blur"></div>
                    <Textarea
                      id="prompt"
                      placeholder="Describe the course you want to create. For example: 'A comprehensive introduction to machine learning covering supervised and unsupervised learning algorithms, neural networks, and practical applications.'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="relative min-h-[140px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 focus:border-blue-500/50 transition-all duration-300"
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* PDF-based Generation */}
              <TabsContent value="pdf" className="space-y-6 mt-8">
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    PDF Document
                  </Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 relative overflow-hidden",
                      isDragOver
                        ? "border-primary bg-gradient-to-r from-blue-500/10 to-purple-500/10 scale-[1.02]"
                        : selectedFile
                        ? "border-green-500 bg-gradient-to-r from-green-500/10 to-emerald-500/10"
                        : "border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400/50 dark:hover:border-slate-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100/20 to-blue-100/20 dark:from-slate-800/20 dark:to-blue-900/20"></div>
                    {selectedFile ? (
                      <div className="space-y-4 relative">
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                            <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-20 animate-pulse"></div>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-green-700 dark:text-green-400 text-lg">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeSelectedFile}
                          disabled={isGenerating}
                          className="hover:scale-105 transition-all duration-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 relative">
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <FileText className="h-16 w-16 text-slate-400 dark:text-slate-500" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-10 animate-pulse"></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xl font-semibold bg-gradient-to-r from-slate-700 to-blue-700 dark:from-slate-300 dark:to-blue-300 bg-clip-text text-transparent">
                            Drop your PDF here or click to browse
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Maximum file size: 10MB • Supported format: PDF
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isGenerating}
                          className="hover:scale-105 transition-all duration-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Course Parameters with Enhanced Styling */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Course Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="chapters" className="font-medium">Number of Chapters</Label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-lg blur"></div>
                    <Select
                      value={chapters}
                      onValueChange={setChapters}
                      disabled={isGenerating}
                    >
                      <SelectTrigger className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Chapter{num !== 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lessons" className="font-medium">Lessons per Chapter</Label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-lg blur"></div>
                    <Select
                      value={lessonsPerChapter}
                      onValueChange={setLessonsPerChapter}
                      disabled={isGenerating}
                    >
                      <SelectTrigger className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-green-500/50 transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Lesson{num !== 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="difficulty" className="font-medium">Difficulty Level</Label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-lg blur"></div>
                    <Select
                      value={difficulty}
                      onValueChange={(value) =>
                        setDifficulty(value as typeof difficulty)
                      }
                      disabled={isGenerating}
                    >
                      <SelectTrigger className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
                        <SelectItem value="beginner">
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Beginner
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="intermediate">
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Intermediate
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="advanced">
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Advanced
                            </Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Cost Display - NEW SECTION */}
            <Card className={cn(
              "transition-all duration-500 border-2",
              costLevel === "low" && "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-700/50",
              costLevel === "medium" && "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200/50 dark:border-yellow-700/50",
              costLevel === "high" && "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-200/50 dark:border-red-700/50"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={cn(
                        "p-3 rounded-full transition-all duration-300",
                        costLevel === "low" && "bg-green-100 dark:bg-green-900/50",
                        costLevel === "medium" && "bg-yellow-100 dark:bg-yellow-900/50",
                        costLevel === "high" && "bg-red-100 dark:bg-red-900/50"
                      )}>
                        <Coins className={cn(
                          "h-6 w-6 transition-all duration-300",
                          costLevel === "low" && "text-green-600 dark:text-green-400",
                          costLevel === "medium" && "text-yellow-600 dark:text-yellow-400",
                          costLevel === "high" && "text-red-600 dark:text-red-400"
                        )} />
                      </div>
                      <div className={cn(
                        "absolute inset-0 rounded-full blur opacity-20 animate-pulse",
                        costLevel === "low" && "bg-green-400",
                        costLevel === "medium" && "bg-yellow-400",
                        costLevel === "high" && "bg-red-400"
                      )}></div>
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-lg font-semibold transition-all duration-300",
                        costLevel === "low" && "text-green-900 dark:text-green-100",
                        costLevel === "medium" && "text-yellow-900 dark:text-yellow-100",
                        costLevel === "high" && "text-red-900 dark:text-red-100"
                      )}>
                        Generation Cost
                      </h3>
                      <p className={cn(
                        "text-sm transition-all duration-300",
                        costLevel === "low" && "text-green-700 dark:text-green-300",
                        costLevel === "medium" && "text-yellow-700 dark:text-yellow-300",
                        costLevel === "high" && "text-red-700 dark:text-red-300"
                      )}>
                        Credits required for this course configuration
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-3xl font-bold transition-all duration-500",
                        costLevel === "low" && "text-green-600 dark:text-green-400",
                        costLevel === "medium" && "text-yellow-600 dark:text-yellow-400",
                        costLevel === "high" && "text-red-600 dark:text-red-400"
                      )}>
                        {creditCost}
                      </span>
                      <div className="flex flex-col items-center">
                        <Zap className={cn(
                          "h-5 w-5 transition-all duration-300",
                          costLevel === "low" && "text-green-500",
                          costLevel === "medium" && "text-yellow-500",
                          costLevel === "high" && "text-red-500"
                        )} />
                        <span className="text-xs text-muted-foreground">credits</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Cost Breakdown */}
                <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Cost Breakdown</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
                      <span className="text-muted-foreground">Chapters</span>
                      <span className="font-medium">{chapters} × 1 = {parseInt(chapters)} credits</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-medium">{parseInt(chapters) * parseInt(lessonsPerChapter)} × 1 = {parseInt(chapters) * parseInt(lessonsPerChapter)} credits</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
                      <span className="text-muted-foreground">Minimum</span>
                      <span className="font-medium">3 credits</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-slate-100/50 to-blue-100/50 dark:from-slate-800/50 dark:to-blue-900/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Cost</span>
                      <span className="font-bold text-lg">{creditCost} credits</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generation Progress */}
            {isGenerating && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200/50 dark:border-blue-700/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-20 animate-pulse"></div>
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-100">
                            {generationProgress.stage}
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {generationProgress.message}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {Math.round(generationProgress.progress)}%
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur"></div>
                      <Progress 
                        value={generationProgress.progress} 
                        className="relative h-3 bg-blue-100 dark:bg-blue-900/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>

          <CardFooter className="pt-6">
            <Button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                (generationMode === "prompt" && !prompt.trim()) ||
                (generationMode === "pdf" && !selectedFile)
              }
              className={cn(
                "w-full py-6 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl",
                "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Course...
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5" />
                  {generationMode === "prompt" ? "Generate Course from Prompt" : "Generate Course from PDF"}
                  <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-white/20 rounded-full">
                    <Coins className="h-4 w-4" />
                    <span className="font-bold">{creditCost}</span>
                  </div>
                  <Star className="h-4 w-4 text-yellow-300" />
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-20 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI-Powered Generation</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Our advanced AI creates comprehensive courses with structured lessons, quizzes, and learning objectives tailored to your specifications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Crown className="h-8 w-8 text-purple-600" />
                  <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-20 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Professional Quality</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Generate courses that meet professional standards with proper structure, engaging content, and assessment materials.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

