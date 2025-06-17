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
    .select('id, name, course_limit, max_chapters, max_lessons_per_chapter, price_cents, stripe_price_id, description, features')    .order('price_cents', { ascending: true });

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
    // Render an error message or a fallback UI
    return <p>Could not load pricing plans. Please try again later.</p>;
  }
  
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error('Stripe publishable key is not set in environment variables.');
    // This is a critical configuration error.
    return <p>Error: Payment provider is not configured correctly. Please contact support.</p>;
  }

  return <PricingClientPage plans={plans} stripePublishableKey={publishableKey} />;
}