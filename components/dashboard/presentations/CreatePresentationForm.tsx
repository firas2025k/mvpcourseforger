// components/dashboard/presentations/CreatePresentationForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle,
  ImageIcon,
  Camera,
  Coins,
  AlertCircle,
  Zap
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
    theme: "default",
    include_images: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creditCost, setCreditCost] = useState(2);

  // Calculate credit cost whenever slides or image option changes
  useEffect(() => {
    const calculateCost = () => {
      let baseCost = 1;
      if (formData.slides <= 5) baseCost = 1;
      else if (formData.slides <= 15) baseCost = 2;
      else if (formData.slides <= 30) baseCost = 3;
      else baseCost = 4;
      
      const imageCost = formData.include_images ? 1 : 0;
      return baseCost + imageCost;
    };
    
    setCreditCost(calculateCost());
  }, [formData.slides, formData.include_images]);

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
      formDataToSend.append('include_images', formData.include_images.toString());
      
      if (onGenerate) {
        onGenerate({ formData: formDataToSend, isPDF: true });
      }
    }
  };

  const selectedTheme = PRESENTATION_THEMES.find(t => t.name === formData.theme) || PRESENTATION_THEMES[0];

  // Get cost color based on amount
  const getCostColor = (cost: number) => {
    if (cost <= 2) return "text-green-600 dark:text-green-400";
    if (cost <= 4) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getCostBadgeColor = (cost: number) => {
    if (cost <= 2) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600";
    if (cost <= 4) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-600";
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600";
  };

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

            {/* Image Options */}
            <div className="space-y-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
                <div className="flex items-start gap-3">
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox
                      id="include-images"
                      checked={formData.include_images}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, include_images: checked as boolean })
                      }
                      disabled={isGenerating}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                  </div>
                  <div className="flex-1">
                    <Label 
                      htmlFor="include-images" 
                      className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="h-4 w-4 text-purple-600" />
                      Include Smart Images
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs">
                        +1 Credit
                      </Badge>
                    </Label>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Automatically add relevant, high-quality images from Pixabay to enhance your presentation
                    </p>
                    
                    {formData.include_images && (
                      <div className="mt-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-purple-200 dark:border-purple-600/30">
                        <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-medium">Smart Image Features:</span>
                        </div>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                          <li>• Automatic keyword extraction from slide content</li>
                          <li>• High-quality, relevant images from Pixabay</li>
                          <li>• Multiple layout options (image-left, image-right, full-image)</li>
                          <li>• Professional, safe-search filtered results</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
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

            {/* Cost Display */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Generation Cost
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {formData.slides} slides {formData.include_images ? '+ images' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getCostBadgeColor(creditCost)} font-bold`}>
                      <Coins className="h-3 w-3 mr-1" />
                      {creditCost} Credits
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Base: {creditCost - (formData.include_images ? 1 : 0)} {formData.include_images && '+ Images: 1'}
                  </p>
                </div>
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
                  <div className="ml-2 flex items-center gap-1">
                    <span className="text-sm">({creditCost}</span>
                    <Coins className="h-4 w-4" />
                    <span className="text-sm">)</span>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-2" />
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
                {formData.include_images && (
                  <>
                    <span className="mx-1">•</span>
                    <ImageIcon className="h-4 w-4" />
                    <span>Plus relevant images</span>
                  </>
                )}
              </p>
            </div>

            {/* Pixabay API Warning */}
            {formData.include_images && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">Image Service Setup Required</p>
                    <p>
                      To use images, make sure <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">PIXABAY_API_KEY</code> is configured in your <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">.env.local</code> file. 
                      <a 
                        href="https://pixabay.com/api/docs/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-amber-700 dark:text-amber-300 underline ml-1 hover:text-amber-900 dark:hover:text-amber-100"
                      >
                        Get your free API key here
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

