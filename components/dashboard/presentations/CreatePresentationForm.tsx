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
import { 
  Presentation, 
  Wand2, 
  Loader2, 
  Palette, 
  Sliders,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { PRESENTATION_THEMES } from "@/types/presentation";

interface CreatePresentationFormProps {
  onGenerate?: (data: any) => void;
  isGenerating?: boolean;
}

export default function CreatePresentationForm({ onGenerate, isGenerating = false }: CreatePresentationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prompt: "",
    slides: 10,
    difficulty: "intermediate" as "beginner" | "intermediate" | "advanced",
    theme: "default"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.prompt.trim()) {
      newErrors.prompt = "Please describe what you want to create a presentation about";
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
    
    const requestData = {
      ...formData,
      background_color: selectedTheme.background_color,
      text_color: selectedTheme.text_color,
      accent_color: selectedTheme.accent_color
    };
    
    if (onGenerate) {
      onGenerate(requestData);
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Beginner
                        </Badge>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Simple concepts, basic terminology
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Intermediate
                        </Badge>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Moderate complexity, some prior knowledge
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Advanced
                        </Badge>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
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
              disabled={isGenerating || !formData.prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Presentation...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" />
                  Generate Presentation
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {/* Info Text */}
            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              <p className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI will create a complete presentation with slides, content, and speaker notes
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

