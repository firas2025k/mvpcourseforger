'use client';

import { useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Plan } from '@/types';
import { Button } from '@/components/ui/button'; // Assuming Shadcn UI Button
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming Shadcn UI Card
import { CheckCircle } from 'lucide-react'; // For feature lists

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

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Choose Your Plan</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        Start creating and sharing your knowledge with the world. No credit card required for the Free plan.
      </p>
      {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col ${plan.name === 'Pro' ? 'border-purple-500 shadow-lg' : ''}`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
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
              {plan.name === 'Free' ? (
                <Button className="w-full" variant="outline" disabled>
                  Your Current Plan (Example)
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => handleCheckout(plan)} 
                  disabled={isLoading === plan.id || !plan.stripe_price_id}
                >
                  {isLoading === plan.id ? 'Processing...' : 'Choose Plan'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
