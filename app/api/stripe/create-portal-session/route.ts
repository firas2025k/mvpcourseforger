import { stripe } from '@/lib/stripe';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies, type ReadonlyRequestCookies } from 'next/headers'; // Import ReadonlyRequestCookies
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore: ReadonlyRequestCookies = cookies(); // Explicitly type cookieStore
  // NextResponse.next() is not available in Route Handlers. 
  // Using a dummy NextResponse to handle cookie operations if necessary.
  const tempHttpResponse = new NextResponse(null, {}); 

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name); // Break down the call
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If you are using latest version of Next.js, you can use cookieStore.set here directly
          tempHttpResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          // If you are using latest version of Next.js, you can use cookieStore.delete here directly
          tempHttpResponse.cookies.delete({ name, ...options });
        },
      },
    }
  );

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      // Pass headers from tempHttpResponse to propagate any cookies set by Supabase
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401, headers: tempHttpResponse.headers });
    }

    // Fetch the user's Stripe Customer ID from your subscriptions table
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .eq('is_active', true) // Ensure we get the customer ID from an active subscription
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !subscription || !subscription.stripe_customer_id) {
      console.error('Error fetching active subscription or Stripe Customer ID:', subError?.message);
      // Pass headers from tempHttpResponse
      return NextResponse.json({ error: 'Could not find an active subscription or Stripe Customer ID for this user.' }, { status: 404, headers: tempHttpResponse.headers });
    }

    const stripeCustomerId = subscription.stripe_customer_id;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/pricing`, // Or your account/settings page
    });

    if (!portalSession.url) {
        // Pass headers from tempHttpResponse
        return NextResponse.json({ error: 'Could not create Stripe Customer Portal session.' }, { status: 500, headers: tempHttpResponse.headers });
    }

    // Pass headers from tempHttpResponse
    return NextResponse.json({ url: portalSession.url }, { status: 200, headers: tempHttpResponse.headers });

  } catch (e: any) {
    console.error('Stripe Customer Portal Error:', e);
    // Pass headers from tempHttpResponse
    return NextResponse.json({ error: e.message || 'An unexpected error occurred.' }, { status: 500, headers: tempHttpResponse.headers });
  }
}
