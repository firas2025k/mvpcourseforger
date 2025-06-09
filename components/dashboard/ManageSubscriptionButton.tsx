"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });
      const session = await response.json();
      if (response.ok && session.url) {
        window.location.href = session.url;
      } else {
        console.error('Failed to create portal session:', session.error);
        setError(session.error || 'Could not open subscription management.');
      }
    } catch (err: any) {
      console.error('Manage subscription error:', err);
      setError(err.message || 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  return (
    <div className="mt-2 w-full">
      <Button 
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleManageSubscription}
        disabled={isLoading}
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
        ) : (
          'Manage Subscription'
        )}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
