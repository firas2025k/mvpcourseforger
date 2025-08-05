"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserPlus,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
} from "lucide-react";

interface JoinCourseDialogProps {
  children: React.ReactNode;
}

export default function JoinCourseDialog({ children }: JoinCourseDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const handleJoinCourse = async () => {
    if (!accessCode.trim()) {
      setError("Please enter an access code");
      return;
    }

    // Validate access code format
    const accessCodeRegex = /^NEX-[A-Z0-9]{6}$/;
    if (!accessCodeRegex.test(accessCode.trim().toUpperCase())) {
      setError(
        "Invalid access code format. Code should be in format: NEX-XXXXXX"
      );
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch("/api/course/join-by-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_code: accessCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join course");
      }

      // Success
      setSuccess({
        title: data.course.title,
        description: data.course.description,
      });
      setAccessCode("");

      // Refresh the page to show the new course
      setTimeout(() => {
        router.refresh();
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (error) {
      console.error("Error joining course:", error);
      setError(
        error instanceof Error ? error.message : "Failed to join course"
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setAccessCode("");
      setError(null);
      setSuccess(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isJoining && !success) {
      handleJoinCourse();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Join a Course
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Enter an access code to join a course shared by another user.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                Successfully Joined!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You've been enrolled in:
              </p>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div className="text-left">
                    <p className="font-medium text-green-800 dark:text-green-200">
                      {success.title}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {success.description}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="access-code" className="text-sm font-medium">
                Access Code
              </Label>
              <Input
                id="access-code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="NEX-XXXXXX"
                className="mt-2 font-mono text-lg uppercase"
                disabled={isJoining}
                maxLength={10}
              />
              <p className="text-xs text-slate-500 mt-1">
                Format: NEX- followed by 6 characters
              </p>
            </div>

            {error && (
              <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>How it works:</strong> Get an access code from someone
                who created a course, enter it here, and you'll be enrolled in
                their course instantly.
              </p>
            </div>
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinCourse}
              disabled={isJoining || !accessCode.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Course
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
