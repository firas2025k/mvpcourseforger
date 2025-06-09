'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { createBrowserClient } from '@supabase/ssr'; // Use createBrowserClient for client components
import { Plan } from '@/types'; // Plan type might be augmented later or a new Subscription type used
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import type { User } from '@supabase/supabase-js'; // Added User type

interface PricingClientPageProps {
  plans: Plan[];
  stripePublishableKey: string;
}

let stripePromise: Promise<Stripe | null>;

const getStripe = (publishableKey: string) => {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default function PricingClientPage({ plans, stripePublishableKey }: PricingClientPageProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null); // Store ID of plan being processed
  const [error, setError] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<any | null>(null); // Using 'any' for now, will refine type later
  const [isFetchingSubscription, setIsFetchingSubscription] = useState<boolean>(true);
  const [isManagingSubscription, setIsManagingSubscription] = useState<boolean>(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ); // Initialize Supabase client for component-level interactions

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsFetchingSubscription(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*, plans(*)') // Fetch plan details along with subscription
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (subError) {
          console.error('Error fetching subscription:', subError.message);
          setError('Could not load your subscription details.');
        } else {
          setActiveSubscription(subscription);
        }
      } else {
        // Not logged in, or user session not found
        setActiveSubscription(null); 
      }
      setIsFetchingSubscription(false);
    };

    fetchSubscription();
  }, [supabase]);

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
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
    setIsManagingSubscription(false);
  };

  const handleCheckout = async (plan: Plan) => {
    if (!plan.stripe_price_id) {
      setError('This plan cannot be subscribed to directly.'); // Should not happen for paid plans
      return;
    }
    setIsLoading(plan.id);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripe_price_id: plan.stripe_price_id,
          app_plan_id: plan.id, // Your internal plan ID
        }),
      });

      const session = await response.json();

      if (response.ok && session.sessionId) {
        const stripe = await getStripe(stripePublishableKey);
        if (stripe) {
          const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: session.sessionId });
          if (stripeError) {
            console.error('Stripe redirection error:', stripeError);
            setError(stripeError.message || 'Failed to redirect to Stripe.');
          }
        }
      } else {
        console.error('Failed to create checkout session:', session.error);
        setError(session.error || 'Could not initiate checkout.');
      }
    } catch (err: any) {
      console.error('Checkout process error:', err);
      setError(err.message || 'An unexpected error occurred.');
    }
    setIsLoading(null);
  };

  if (isFetchingSubscription) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Choose Your Plan</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        Start creating and sharing your knowledge with the world. No credit card required for the Free plan.
      </p>
      {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col ${activeSubscription && activeSubscription.plan_id === plan.id ? 'border-green-500 shadow-lg' : (plan.name === 'Pro' ? 'border-purple-500' : '')}`}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                {activeSubscription && activeSubscription.plan_id === plan.id && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Current Plan</span>
                )}
              </div>
              <CardDescription>{plan.description || `Access to ${plan.course_limit} course(s).`}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {plan.price_cents === 0 ? 'Free' : `€${plan.price_cents / 100}`}
                </span>
                {plan.price_cents !== 0 && <span className="text-muted-foreground">/month</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {(plan.features && plan.features.length > 0 ? plan.features : [`Create up to ${plan.course_limit} course(s)`]).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {activeSubscription && activeSubscription.plan_id === plan.id ? (
                <Button 
                  className="w-full"
                  onClick={handleManageSubscription} 
                  disabled={isManagingSubscription}
                >
                  {isManagingSubscription ? 'Processing...' : 'Manage Subscription'}
                </Button>
              ) : plan.stripe_price_id ? (
                <Button 
                  className="w-full"
                  onClick={() => handleCheckout(plan)} 
                  disabled={isLoading === plan.id || isManagingSubscription || !plan.stripe_price_id}
                >
                  {isLoading === plan.id ? 'Processing...' : (plan.price_cents === 0 && activeSubscription ? 'Switch to Free' : 'Choose Plan')}
                </Button>
              ) : (
                // Fallback for plans without a stripe_price_id (e.g., a Free plan that's not the active one)
                <Button className="w-full" variant="outline" disabled>
                  {plan.name === 'Free' && !activeSubscription ? 'Start with Free' : 'Details'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
