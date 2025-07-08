// components/dashboard/presentations/CreatePresentationForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Presentation, 
  Wand2, 
  Loader2, 
  Palette, 
  Sliders,
  Sparkles,
  ArrowRight,
  Info,
  FileText,
  Upload,
  X,
  CheckCircle
} from "lucide-react";
import { PRESENTATION_THEMES } from "@/types/presentation";

interface CreatePresentationFormProps {
  onGenerate?: (data: any) => void;
  isGenerating?: boolean;
}

export default function CreatePresentationForm({ onGenerate, isGenerating = false }: CreatePresentationFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("text");
  const [formData, setFormData] = useState({
    prompt: "",
    slides: 10,
    difficulty: "intermediate" as "beginner" | "intermediate" | "advanced",
    theme: "default"
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setErrors({ ...errors, file: 'Please select a PDF file' });
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, file: 'File size must be less than 10MB' });
        return;
      }
      
      setSelectedFile(file);
      setErrors({ ...errors, file: '' });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setErrors({ ...errors, file: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (activeTab === "text" && !formData.prompt.trim()) {
      newErrors.prompt = "Please describe what you want to create a presentation about";
    }
    
    if (activeTab === "pdf" && !selectedFile) {
      newErrors.file = "Please select a PDF file to upload";
    }
    
    if (formData.slides < 3 || formData.slides > 50) {
      newErrors.slides = "Number of slides must be between 3 and 50";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    // Get theme details
    const selectedTheme = PRESENTATION_THEMES.find(t => t.name === formData.theme) || PRESENTATION_THEMES[0];
    
    if (activeTab === "text") {
      // Text-based generation (existing functionality)
      const requestData = {
        ...formData,
        background_color: selectedTheme.background_color,
        text_color: selectedTheme.text_color,
        accent_color: selectedTheme.accent_color
      };
      
      if (onGenerate) {
        onGenerate(requestData);
      }
    } else {
      // PDF-based generation (new functionality)
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile!);
      formDataToSend.append('slides', formData.slides.toString());
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('theme', formData.theme);
      formDataToSend.append('background_color', selectedTheme.background_color);
      formDataToSend.append('text_color', selectedTheme.text_color);
      formDataToSend.append('accent_color', selectedTheme.accent_color);
      
      if (onGenerate) {
        onGenerate({ formData: formDataToSend, isPDF: true });
      }
    }
  };

  const selectedTheme = PRESENTATION_THEMES.find(t => t.name === formData.theme) || PRESENTATION_THEMES[0];

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Presentation className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create New Presentation
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4" />
                AI-powered presentation generation
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Method Selection */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Text Prompt
                </TabsTrigger>
                <TabsTrigger value="pdf" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-6">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    What would you like to create a presentation about?
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., Introduction to Machine Learning for beginners, Marketing strategies for small businesses, The history of space exploration..."
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    className="min-h-[100px] resize-none"
                    disabled={isGenerating}
                  />
                  {errors.prompt && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.prompt}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pdf" className="space-y-4 mt-6">
                {/* PDF Upload */}
                <div className="space-y-2">
                  <Label htmlFor="pdf-file" className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Upload PDF Document
                  </Label>
                  
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        PDF files only, max 10MB
                      </p>
                      <Input
                        id="pdf-file"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={isGenerating}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            disabled={isGenerating}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {errors.file && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.file}</p>
                  )}
                </div>

                {/* PDF Upload Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">PDF Processing</p>
                      <p>
                        The AI will analyze your PDF content and automatically generate slides based on the document structure and key information.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Slides and Difficulty Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Number of Slides */}
              <div className="space-y-2">
                <Label htmlFor="slides" className="text-sm font-medium flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  Number of Slides
                </Label>
                <Input
                  id="slides"
                  type="number"
                  min="3"
                  max="50"
                  value={formData.slides}
                  onChange={(e) => setFormData({ ...formData, slides: parseInt(e.target.value) || 10 })}
                  disabled={isGenerating}
                />
                {errors.slides && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.slides}</p>
                )}
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Difficulty Level
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                    setFormData({ ...formData, difficulty: value })
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[200px]">
                    <SelectItem value="beginner">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                            Beginner
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          Simple concepts, basic terminology
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs">
                            Intermediate
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          Moderate complexity, some prior knowledge
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs">
                            Advanced
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          Complex topics, expert-level content
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Presentation Theme
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRESENTATION_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: theme.name })}
                    disabled={isGenerating}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.theme === theme.name
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.accent_color }}
                      ></div>
                      <span className="text-sm font-medium capitalize">{theme.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <div 
                        className="w-full h-2 rounded"
                        style={{ backgroundColor: theme.background_color }}
                      ></div>
                      <div 
                        className="w-full h-2 rounded"
                        style={{ backgroundColor: theme.text_color }}
                      ></div>
                      <div 
                        className="w-full h-2 rounded"
                        style={{ backgroundColor: theme.accent_color }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              type="submit"
              disabled={isGenerating || (activeTab === "text" && !formData.prompt.trim()) || (activeTab === "pdf" && !selectedFile)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {activeTab === "pdf" ? "Processing PDF..." : "Generating Presentation..."}
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" />
                  {activeTab === "pdf" ? "Generate from PDF" : "Generate Presentation"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {/* Info Text */}
            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              <p className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                {activeTab === "pdf" 
                  ? "AI will analyze your PDF and create a complete presentation with slides, content, and speaker notes"
                  : "AI will create a complete presentation with slides, content, and speaker notes"
                }
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

