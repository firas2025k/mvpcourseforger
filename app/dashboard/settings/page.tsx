"use client";

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ManageSubscriptionButton from '@/components/dashboard/ManageSubscriptionButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
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
} from '@/components/ui/alert-dialog';

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
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('is_active, stripe_subscription_id')
          .eq('user_id', authUser.id)
          .eq('is_active', true)
          .maybeSingle();
        
        if (subData && subData.is_active && subData.stripe_subscription_id) {
          setHasActiveSubscription(true);
        }
      } else if (authError) {
        console.error('Error fetching user:', authError);
        router.push('/auth/login');
      }
      setLoadingUser(false);
    };
    fetchUserAndSubscription();
  }, [supabase, router]);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      // Ensure you have an RPC function in Supabase named 'delete_user_account'
      // that handles deleting user data from auth.users, profiles, and any related tables.
      // It should also handle Stripe subscription cancellation if applicable.
      const { error } = await supabase.rpc('delete_user_account'); 
      if (error) {
        throw error;
      }
      alert('Account deleted successfully. You will be logged out.');
      await supabase.auth.signOut();
      router.push('/'); // Redirect to homepage
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(`Failed to delete account: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingUser) {
    return <div className="flex justify-center items-center h-screen"><p>Loading settings...</p></div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen"><p>Please log in to view settings.</p></div>;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12 px-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email || ''} disabled />
          </div>
        </CardContent>
      </Card>

      {hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your billing and subscription plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManageSubscriptionButton />
          </CardContent>
        </Card>
      )}

      <Separator />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account,
                  all your courses, and all associated data. Your subscription, if active,
                  will also be cancelled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
