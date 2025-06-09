import { stripe } from '@/lib/stripe';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const tempHttpResponse = new NextResponse(null, {});

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          tempHttpResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          tempHttpResponse.cookies.delete({ name, ...options });
        },
      },
    }
  );

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401, headers: tempHttpResponse.headers });
    }

    const { stripe_price_id: priceId, app_plan_id: clientPlanId } = await request.json(); // priceId from Stripe (sent as stripe_price_id), planId from your app's plans table (sent as app_plan_id)

    if (!priceId || !clientPlanId) {
      return NextResponse.json({ error: 'Stripe Price ID and Plan ID are required' }, { status: 400, headers: tempHttpResponse.headers });
    }

    // Get or create Stripe Customer ID
    let stripeCustomerId: string | undefined;

    // Check if user already has a subscription record and a stripe_customer_id
    const { data: existingSubscription, error: subFetchError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subFetchError && subFetchError.code !== 'PGRST116') { // PGRST116: no rows found, which is fine
        console.error('Error fetching existing subscription for customer ID:', subFetchError);
        return NextResponse.json({ error: 'Could not retrieve user subscription data.' }, { status: 500, headers: tempHttpResponse.headers });
    }

    stripeCustomerId = existingSubscription?.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Upsert the customer ID into the subscriptions table (or create a new entry if none exists)
      // This assumes a user might not have a subscription record yet if they've never attempted to subscribe.
      const { error: upsertError } = await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: user.id,
            stripe_customer_id: stripeCustomerId,
            plan_id: clientPlanId, // Store the app's plan_id, useful for initial record
            is_active: false, // Will be activated by webhook
          },
          {
            onConflict: 'user_id', // If user_id record exists, update it. Adjust if your PK/unique constraint is different.
            // If you want to ensure only one active subscription, you might need more complex logic here or in webhooks.
          }
        );

      if (upsertError) {
        console.error('Error saving Stripe Customer ID to DB:', upsertError);
        return NextResponse.json({ error: 'Could not save customer information.' }, { status: 500, headers: tempHttpResponse.headers });
      }
    } else {
        // If customer ID exists, ensure their current plan_id is updated if they are changing plans
        // This is a light update; webhooks will handle the full subscription state.
        const { error: updatePlanError } = await supabase
            .from('subscriptions')
            .update({ plan_id: clientPlanId, stripe_customer_id: stripeCustomerId })
            .eq('user_id', user.id);
        if (updatePlanError) {
            console.error('Error updating plan_id for existing customer:', updatePlanError);
            // Non-critical, proceed with checkout
        }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`, // Or wherever your pricing page is
      metadata: {
        supabase_user_id: user.id,
        app_plan_id: clientPlanId, // Pass your app's plan_id to webhook
      }
    });

    if (!session.id) {
      return NextResponse.json({ error: 'Could not create Stripe Checkout session.' }, { status: 500, headers: tempHttpResponse.headers });
    }

    return NextResponse.json({ sessionId: session.id }, { status: 200, headers: tempHttpResponse.headers });

  } catch (e: any) {
    console.error('Stripe Checkout Error:', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred during checkout.' }, { status: 500, headers: tempHttpResponse.headers });
  }
}
