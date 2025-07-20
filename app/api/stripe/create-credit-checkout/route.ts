import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
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

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      price_id, 
      credit_amount, 
      package_name, 
      success_url, 
      cancel_url 
    } = body;

    if (!price_id || !credit_amount || !success_url || !cancel_url) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get price from package ID
    const priceInDollars = getPriceFromPackageId(price_id);
    if (priceInDollars === 0) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      
      customerId = customer.id;
      
      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${package_name} - ${credit_amount} Credits`,
              description: `Purchase ${credit_amount} credits for content generation`,
              images: [`${process.env.NEXT_PUBLIC_SITE_URL}/assets/images/logo.png`],
            },
            unit_amount: Math.round(priceInDollars * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
        credit_amount: credit_amount.toString(),
        package_name: package_name,
        type: 'credit_purchase',
      },
      billing_address_collection: 'auto',
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          credit_amount: credit_amount.toString(),
          package_name: package_name,
          type: 'credit_purchase',
        },
      },
    });

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });

  } catch (error) {
    console.error('Error creating credit checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Handle dynamic pricing based on package
function getPriceFromPackageId(priceId: string): number {
  const priceMap: { [key: string]: number } = {
    'price_starter_100': 9.99,
    'price_popular_500': 19.99,
    'price_professional_1000': 39.99,
    'price_enterprise_2500': 69.99,
  };
  
  return priceMap[priceId] || 0;
}

