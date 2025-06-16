'use client';

import { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { createBrowserClient } from '@supabase/ssr';
import { Plan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

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
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<any | null>(null);
  const [isFetchingSubscription, setIsFetchingSubscription] = useState<boolean>(true);
  const [isManagingSubscription, setIsManagingSubscription] = useState<boolean>(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsFetchingSubscription(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch active subscription
        let { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (subError) {
          console.error('Error fetching active subscription:', subError.message);
          setError('Could not load your subscription details.');
          setActiveSubscription(null);
        } else if (subscription && subscription.length > 0) {
          setActiveSubscription(subscription[0]);
        } else {
          // --- NEW: Check for Free plan subscription ---
          const freePlan = plans.find(plan => plan.name === 'Free');
          if (freePlan) {
            // Query for Free plan subscription
            const { data: freeSubscription, error: freeSubError } = await supabase
              .from('subscriptions')
              .select('*, plans(*)')
              .eq('user_id', user.id)
              .eq('plan_id', freePlan.id)
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(1);

            if (freeSubError) {
              console.error('Error fetching Free plan subscription:', freeSubError.message);
              setError('Could not load Free plan details.');
              setActiveSubscription(null);
            } else if (freeSubscription && freeSubscription.length > 0) {
              setActiveSubscription(freeSubscription[0]);
            } else {
              // Fallback: Assume Free plan if no subscription record
              setActiveSubscription({ plan_id: freePlan.id, plans: freePlan });
            }
          } else {
            setError('No Free plan available. Please contact support.');
            setActiveSubscription(null);
          }
        }
      } else {
        // Not logged in, assume Free plan
        const freePlan = plans.find(plan => plan.name === 'Free');
        if (freePlan) {
          setActiveSubscription({ plan_id: freePlan.id, plans: freePlan });
        } else {
          setActiveSubscription(null);
        }
      }
      setIsFetchingSubscription(false);
    };

    fetchSubscription();
  }, [supabase, plans]);

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
      setError('This plan cannot be subscribed to directly.');
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
          app_plan_id: plan.id,
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