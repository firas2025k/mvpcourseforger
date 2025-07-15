"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

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
import { redirect } from "next/navigation";
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
} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Companion is required." }),
  subject: z.string().min(1, { message: "Subject is required." }),
  topic: z.string().min(1, { message: "Topic is required." }),
  voice: z.string().min(1, { message: "Voice is required." }),
  style: z.string().min(1, { message: "Style is required." }),
  duration: z.coerce.number().min(1, { message: "Duration is required." }),
});

const CompanionForm = () => {
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
    const companion = await createCompanion(values);

    if (companion) {
      redirect(`/dashboard/voice/${companion.id}`);
    } else {
      console.log("Failed to create a companion");
      redirect("/dashboard/voice");
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
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
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
                    >
                      <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md capitalize">
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
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md min-h-[100px] resize-none"
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
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md">
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
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md">
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
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/5 to-blue-400/5 rounded-xl pointer-events-none"></div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 group mt-8"
          >
            <div className="relative">
              <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 bg-white rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            Build Your Companion
            <Zap className="h-4 w-4 text-yellow-300" />
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CompanionForm;
