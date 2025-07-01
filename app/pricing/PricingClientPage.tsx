'use client';

import { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { createBrowserClient } from '@supabase/ssr';
import { Plan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  ArrowLeft, 
  Crown, 
  Zap, 
  Star, 
  Sparkles, 
  Loader2, 
  CreditCard,
  Gift,
  Rocket,
  Shield,
  Users,
  BookOpen,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

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

// Plan icons mapping
const planIcons = {
  'Free': Gift,
  'Basic': BookOpen,
  'Pro': Crown,
  'Enterprise': Rocket,
  'Premium': Star,
  'Starter': Target,
  'Advanced': Award,
  'Ultimate': TrendingUp
};

// Plan colors mapping
const planColors = {
  'Free': 'from-green-500 to-emerald-600',
  'Basic': 'from-blue-500 to-cyan-600',
  'Pro': 'from-purple-500 to-pink-600',
  'Enterprise': 'from-orange-500 to-red-600',
  'Premium': 'from-yellow-500 to-orange-600',
  'Starter': 'from-teal-500 to-blue-600',
  'Advanced': 'from-indigo-500 to-purple-600',
  'Ultimate': 'from-pink-500 to-rose-600'
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
          const freePlan = plans.find(plan => plan.name === 'Free');
          if (freePlan) {
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
              setActiveSubscription({ plan_id: freePlan.id, plans: freePlan });
            }
          } else {
            setError('No Free plan available. Please contact support.');
            setActiveSubscription(null);
          }
        }
      } else {
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

  const getPlanIcon = (planName: string) => {
    return planIcons[planName as keyof typeof planIcons] || BookOpen;
  };

  const getPlanColor = (planName: string) => {
    return planColors[planName as keyof typeof planColors] || 'from-blue-500 to-purple-600';
  };

  const isPopularPlan = (plan: Plan) => {
    return plan.name === 'Pro' || plan.name === 'Premium';
  };

  if (isFetchingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative flex items-center gap-3 px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Loading subscription details...
            </span>
            <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 flex-shrink-0" />
            Start creating and sharing your knowledge with the world. No credit card required for the Free plan.
          </p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-center text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {plans.map((plan) => {
            const PlanIcon = getPlanIcon(plan.name);
            const isActive = activeSubscription && activeSubscription.plan_id === plan.id;
            const isPopular = isPopularPlan(plan);
            const planColor = getPlanColor(plan.name);

            return (
              <div key={plan.id} className="relative h-full">
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isActive && (
                  <div className="absolute -top-3 right-0 z-10">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <CheckCircle className="h-3 w-3" />
                      Current
                    </div>
                  </div>
                )}

                <Card 
                  className={`h-full bg-white dark:bg-slate-800 border transition-all duration-300 hover:shadow-lg group flex flex-col ${
                    isActive 
                      ? 'border-green-500/50 shadow-green-500/10 shadow-lg' 
                      : isPopular 
                        ? 'border-purple-500/50 shadow-purple-500/10 shadow-md' 
                        : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${planColor} flex items-center justify-center`}>
                        <PlanIcon className="h-5 w-5 text-white" />
                      </div>
                      {plan.name === 'Pro' && <Crown className="h-5 w-5 text-purple-500" />}
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {plan.description || `Perfect for ${plan.name.toLowerCase()} users`}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-grow">
                    {/* Price */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                          {plan.price_cents === 0 ? 'Free' : `€${plan.price_cents / 100}`}
                        </span>
                        {plan.price_cents !== 0 && (
                          <span className="text-slate-500 dark:text-slate-400 text-sm">/month</span>
                        )}
                      </div>
                      {plan.price_cents === 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Forever free
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {plan.course_limit} course{plan.course_limit !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {plan.max_chapters} chapter{plan.max_chapters !== 1 ? 's' : ''} per course
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {plan.max_lessons_per_chapter} lesson{plan.max_lessons_per_chapter !== 1 ? 's' : ''} per chapter
                        </span>
                      </div>
                      {(plan.features || []).slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 mt-auto">
                    {isActive ? (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleManageSubscription}
                        disabled={isManagingSubscription}
                      >
                        {isManagingSubscription ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Subscription
                          </>
                        )}
                      </Button>
                    ) : plan.stripe_price_id ? (
                      <Button
                        className={`w-full bg-gradient-to-r ${planColor} hover:opacity-90 text-white`}
                        onClick={() => handleCheckout(plan)}
                        disabled={isLoading === plan.id}
                      >
                        {isLoading === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Choose Plan
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        disabled
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Money-Back Guarantee */}
        <div className="max-w-2xl mx-auto">
          <div className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                30-Day Money-Back Guarantee
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Try any paid plan risk-free. If you're not completely satisfied, we'll refund your money within 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}