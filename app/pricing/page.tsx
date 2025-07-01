export const dynamic = 'force-dynamic';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import PricingClientPage from './PricingClientPage'; // We'll create this next
import { Plan } from '@/types'; 

// Ensure your 'plans' table has 'description' (TEXT) and 'features' (TEXT[]) columns
// or remove them from the select query and the Plan type if not used.
async function getPlans(): Promise<Plan[]> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data, error } = await supabase
    .from('plans')
    .select('id, name, course_limit, max_chapters, max_lessons_per_chapter, price_cents, stripe_price_id, description, features')
    .order('price_cents', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    // Optionally, throw the error or return a specific error state
    // throw new Error(`Failed to fetch plans: ${error.message}`);
    return [];
  }
  // Ensure stripe_price_id is explicitly null if database returns it as such for free plans
  return data.map(plan => ({ ...plan, stripe_price_id: plan.stripe_price_id || null })) as Plan[];
}

export default async function PricingPage() {
  let plans: Plan[] = [];
  try {
    plans = await getPlans();
  } catch (error) {
    console.error("Failed to load plans for PricingPage:", error);
    // Render an error message or a fallback UI with enhanced styling
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center mx-auto">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Could not load pricing plans. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error('Stripe publishable key is not set in environment variables.');
    // This is a critical configuration error with enhanced styling
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center mx-auto">
            <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Error: Payment provider is not configured correctly. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return <PricingClientPage plans={plans} stripePublishableKey={publishableKey} />;
}

