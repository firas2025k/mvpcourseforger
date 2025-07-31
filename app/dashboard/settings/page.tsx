"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ManageSubscriptionButton from "@/components/dashboard/ManageSubscriptionButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  User as UserIcon,
  Mail,
  CreditCard,
  Shield,
  AlertTriangle,
  Loader2,
  Sparkles,
  Crown,
  Lock,
  Trash2,
  CheckCircle,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUserAndSubscription = async () => {
      setLoadingUser(true);
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data: subData, error: subError } = await supabase
          .from("subscriptions")
          .select("is_active, stripe_subscription_id")
          .eq("user_id", authUser.id)
          .eq("is_active", true)
          .maybeSingle();

        if (subData && subData.is_active && subData.stripe_subscription_id) {
          setHasActiveSubscription(true);
        }
      } else if (authError) {
        console.error("Error fetching user:", authError);
        router.push("/auth/login");
      }
      setLoadingUser(false);
    };
    fetchUserAndSubscription();
  }, [supabase, router]);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      // Call the delete_user_account function with the user's ID as parameter
      const { error } = await supabase.rpc("delete_user_account", {
        user_id_to_delete: user.id,
      });

      if (error) {
        throw error;
      }

      // Show success message
      alert("Account deleted successfully. You will be logged out.");

      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to homepage
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert(`Failed to delete account: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative flex items-center gap-3 px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Loading settings...
            </span>
            <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center">
            <Info className="h-4 w-4" />
            Please log in to view settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Enhanced Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-3xl blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <div className="relative">
                <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-20 animate-pulse"></div>
              </div>
              Profile
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              Your personal information and account details
            </CardDescription>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <Mail className="h-4 w-4 text-slate-500" />
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="bg-slate-50/80 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 pl-10"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <div className="absolute right-3 top-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Info className="h-3 w-3" />
              This is your verified email address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      {hasActiveSubscription && (
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="relative">
                  <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-20 animate-pulse"></div>
                </div>
                Subscription
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your billing and subscription plan
              </CardDescription>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Premium Subscription Active
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-lg blur"></div>
                <div className="relative">
                  <ManageSubscriptionButton />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Separator */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700"></div>
        <Separator className="relative bg-transparent" />
      </div>

      {/* Danger Zone Card */}
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <div className="relative">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div className="absolute inset-0 bg-red-400 rounded-full blur opacity-20 animate-pulse"></div>
              </div>
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-600/80 dark:text-red-400/80 mt-1">
              These actions are permanent and cannot be undone
            </CardDescription>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="p-4 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
            <div className="flex items-start gap-3 mb-4">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  Delete Account
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Permanently delete your account, all courses, and associated
                  data. Your subscription will also be cancelled if active.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-600 dark:text-slate-400 space-y-2">
                        <p>
                          This action cannot be undone. This will permanently
                          delete your account, all your courses, and all
                          associated data.
                        </p>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                            Your subscription, if active, will also be
                            cancelled.
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        disabled={isDeleting}
                        className="hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Yes, delete my account
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
