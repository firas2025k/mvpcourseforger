"use client";

import { useState, useRef, useCallback } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Create New Course
          </CardTitle>
          <CardDescription>
            Generate a course from a text prompt or upload a PDF document to
            create structured learning content.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Generation Mode Tabs */}
          <Tabs
            value={generationMode}
            onValueChange={(value) =>
              setGenerationMode(value as "prompt" | "pdf")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prompt" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create from Prompt
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Create from PDF
              </TabsTrigger>
            </TabsList>

            {/* Prompt-based Generation */}
            <TabsContent value="prompt" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Course Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the course you want to create. For example: 'A comprehensive introduction to machine learning covering supervised and unsupervised learning algorithms, neural networks, and practical applications.'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px]"
                  disabled={isGenerating}
                />
              </div>
            </TabsContent>

            {/* PDF-based Generation */}
            <TabsContent value="pdf" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>PDF Document</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : selectedFile
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">
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
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          Drop your PDF here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Maximum file size: 10MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isGenerating}
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

          {/* Course Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chapters">Number of Chapters</Label>
              <Select
                value={chapters}
                onValueChange={setChapters}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Chapter{num !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessons">Lessons per Chapter</Label>
              <Select
                value={lessonsPerChapter}
                onValueChange={setLessonsPerChapter}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Lesson{num !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={difficulty}
                onValueChange={(value) =>
                  setDifficulty(value as typeof difficulty)
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        Beginner
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="intermediate">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Intermediate
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Advanced
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {generationProgress.stage}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(generationProgress.progress)}%
                    </span>
                  </div>
                  <Progress
                    value={generationProgress.progress}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    {generationProgress.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Messages */}
          {generationMode === "prompt" && !prompt.trim() && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Please enter a course description to continue.
              </span>
            </div>
          )}

          {generationMode === "pdf" && !selectedFile && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Please select a PDF file to continue.
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-6">
          <Button
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              (generationMode === "prompt" && !prompt.trim()) ||
              (generationMode === "pdf" && !selectedFile)
            }
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Course...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Course
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
