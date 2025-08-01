"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OtpVerifyPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  // Redirect if no email parameter
  useEffect(() => {
    if (!email) {
      router.push("/auth/sign-up");
    }
  }, [email, router]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsVerifying(true);
    setError(null);

    const supabase = createClient();
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      setIsVerified(true);

      // Redirect to dashboard after showing success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Invalid OTP. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setIsResending(true);
    setError(null);

    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setError("Verification code has been resent to your email.");
      setResendCooldown(60); // 60 second cooldown
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not resend verification code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  if (!email) {
    return null; // Will redirect
  }

  // Success state
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800/80 shadow-xl border-gray-200 dark:border-gray-700/60 rounded-xl overflow-hidden">
          <CardHeader className="space-y-1 text-center p-6 bg-green-50 dark:bg-green-900/20 border-b dark:border-gray-700/60">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Email Verified!
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Welcome to NexusEd! Your account has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Redirecting you to the dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800/80 shadow-xl border-gray-200 dark:border-gray-700/60 rounded-xl overflow-hidden">
        <CardHeader className="space-y-1 text-center p-6 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700/60">
          <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {email}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                required
                value={otp}
                onChange={handleOtpChange}
                className="bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                disabled={isVerifying}
                autoComplete="one-time-code"
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            {error && (
              <div
                className={`text-sm p-3 rounded-md border ${
                  error.includes("resent") || error.includes("sent")
                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-500/50"
                    : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-500/50"
                }`}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400 shadow-md transform hover:scale-[1.02] transition-transform duration-150 py-3"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={isResending || resendCooldown > 0}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>
          </form>
        </CardContent>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700/60">
          <Button
            variant="ghost"
            asChild
            className="w-full text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Link href="/auth/sign-up">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign Up
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
