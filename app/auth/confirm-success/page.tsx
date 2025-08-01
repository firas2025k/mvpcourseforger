"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ConfirmSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setError(error.message);
        } else if (user) {
          setUser(user);
          // Auto-redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else {
          setError("No authenticated user found");
        }
      } catch (err) {
        setError("Failed to verify authentication status");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800/80 shadow-xl border-gray-200 dark:border-gray-700/60 rounded-xl overflow-hidden">
          <CardHeader className="space-y-1 text-center p-6">
            <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Verifying Account
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Please wait while we confirm your email verification...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800/80 shadow-xl border-gray-200 dark:border-gray-700/60 rounded-xl overflow-hidden">
          <CardHeader className="space-y-1 text-center p-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Verification Failed
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/sign-up">Try Again</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800/80 shadow-xl border-gray-200 dark:border-gray-700/60 rounded-xl overflow-hidden">
        <CardHeader className="space-y-1 text-center p-6 bg-green-50 dark:bg-green-900/20">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Email Verified!
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Welcome to NexusEd, {user?.email}!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your account has been successfully verified. You'll be redirected
              to your dashboard in a few seconds.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                What's next?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Complete your profile setup</li>
                <li>• Create your first AI-powered course</li>
                <li>• Explore our course templates</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/settings")}
                className="w-full"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
