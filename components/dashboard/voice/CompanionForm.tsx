"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subjects } from "@/constants";
import { Textarea } from "@/components/ui/textarea";
import { createCompanion } from "@/actions/companion.actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sparkles,
  User,
  BookOpen,
  MessageCircle,
  Mic,
  Palette,
  Clock,
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Companion is required." }),
  subject: z.string().min(1, { message: "Subject is required." }),
  topic: z.string().min(1, { message: "Topic is required." }),
  voice: z.string().min(1, { message: "Voice is required." }),
  style: z.string().min(1, { message: "Style is required." }),
  duration: z.coerce
    .number()
    .min(5, { message: "Duration must be at least 5 minutes." })
    .max(120, { message: "Duration cannot exceed 120 minutes." }),
});

const CompanionForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      topic: "",
      voice: "",
      style: "",
      duration: 15,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setLoadingStep("Validating your request...");

    try {
      // Calculate credit cost for user feedback
      const baseCost = 2;
      const durationCost = Math.ceil(values.duration / 10);
      const creditCost = Math.max(baseCost + durationCost, 3);

      setLoadingStep(`Processing payment (${creditCost} credits)...`);

      // Small delay to show the payment step
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLoadingStep("Creating your AI companion...");

      const companion = await createCompanion(values);

      if (companion) {
        setLoadingStep("Finalizing setup...");

        // Small delay to show completion
        await new Promise((resolve) => setTimeout(resolve, 500));

        toast.success("🎉 AI Companion created successfully!", {
          description: `"${values.name}" is ready for your learning sessions.`,
          duration: 3000,
        });

        // Redirect to the voice dashboard
        router.push("/dashboard/voice");
      } else {
        throw new Error("Failed to create companion");
      }
    } catch (error: any) {
      console.error("Error creating companion:", error);

      // Handle specific error types
      if (error.message.includes("Insufficient credits")) {
        toast.error("💳 Insufficient Credits", {
          description: error.message,
          duration: 5000,
        });
      } else if (error.message.includes("Duration must be")) {
        toast.error("⏱️ Invalid Duration", {
          description: error.message,
          duration: 4000,
        });
      } else {
        toast.error("❌ Creation Failed", {
          description:
            error.message || "An unexpected error occurred. Please try again.",
          duration: 4000,
        });
      }
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/90 via-slate-50/90 to-blue-50/90 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-blue-900/90 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          Create Your AI Companion
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Build a personalized learning companion tailored to your needs
        </p>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-white/95 via-slate-50/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-blue-900/95 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur animate-pulse"></div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
                  Creating Your Companion
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {loadingStep}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Validating form data</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  {loadingStep.includes("payment") ? (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  ) : loadingStep.includes("Creating") ||
                    loadingStep.includes("Finalizing") ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                  )}
                  <span>Processing credit payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  {loadingStep.includes("Creating") ? (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  ) : loadingStep.includes("Finalizing") ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                  )}
                  <span>Setting up AI companion</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  {loadingStep.includes("Finalizing") ? (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                  )}
                  <span>Finalizing setup</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                This usually takes 10-30 seconds...
              </div>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Companion name
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter the companion name"
                      {...field}
                      disabled={isLoading}
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-xl pointer-events-none"></div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  Subject
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md capitalize disabled:opacity-50 disabled:cursor-not-allowed">
                        <SelectValue placeholder="Select the subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-xl">
                        {subjects.map((subject) => (
                          <SelectItem
                            value={subject}
                            key={subject}
                            className="capitalize hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                          >
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-xl pointer-events-none"></div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                  What should the companion help with?
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="Ex. Derivatives & Integrals"
                      {...field}
                      disabled={isLoading}
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md min-h-[100px] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-xl pointer-events-none"></div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                    <Mic className="h-4 w-4 text-orange-500" />
                    Voice
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                          <SelectValue placeholder="Select the voice" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-xl">
                          <SelectItem
                            value="male"
                            className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                          >
                            Male
                          </SelectItem>
                          <SelectItem
                            value="female"
                            className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                          >
                            Female
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-red-400/5 rounded-xl pointer-events-none"></div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                    <Palette className="h-4 w-4 text-pink-500" />
                    Style
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                          <SelectValue placeholder="Select the style" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-xl">
                          <SelectItem
                            value="formal"
                            className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                          >
                            Formal
                          </SelectItem>
                          <SelectItem
                            value="casual"
                            className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
                          >
                            Casual
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/5 to-purple-400/5 rounded-xl pointer-events-none"></div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  Estimated session duration in minutes
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="15"
                      {...field}
                      disabled={isLoading}
                      min={5}
                      max={120}
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/5 to-blue-400/5 rounded-xl pointer-events-none"></div>
                  </div>
                </FormControl>
                <FormMessage />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Duration affects credit cost:{" "}
                  {Math.max(2 + Math.ceil((field.value || 15) / 10), 3)} credits
                  required
                </p>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 group mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Companion...
              </>
            ) : (
              <>
                <div className="relative">
                  <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-white rounded-full blur opacity-20 animate-pulse"></div>
                </div>
                Build Your Companion
                <Zap className="h-4 w-4 text-yellow-300" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CompanionForm;
