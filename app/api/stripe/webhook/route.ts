import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Supabase client with service role key for admin operations
// IMPORTANT: Store your Supabase service role key securely in environment variables
// and ensure it's NOT prefixed with NEXT_PUBLIC_
// You'll need to add SUPABASE_SERVICE_ROLE_KEY to your .env.local
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const relevantEvents = new Set([
  'checkout.session.completed',
  'invoice.payment_succeeded', // Or 'invoice_payment.paid' if that's what you configured in Stripe
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

// Helper function to update user's subscription and course limit
async function updateUserSubscription(
    userId: string, 
    appPlanId: string, // This is your internal plan ID (UUID)
    isActive: boolean, 
    stripeCustomerId?: string, 
    stripeSubscriptionId?: string, 
    stripeCurrentPeriodEnd?: Date
) {
  console.log(`Webhook Helper: Updating for User ID: ${userId}, App Plan ID: ${appPlanId}, Active: ${isActive}`);

  const { data: planData, error: planError } = await supabaseAdmin
    .from('plans')
    .select('id, course_limit, name') // Fetch name for logging
    .eq('id', appPlanId) // Use appPlanId here
    .single();

  if (planError || !planData) {
    console.error(`Webhook Helper: Plan not found for app_plan_id ${appPlanId}:`, planError?.message);
    throw new Error(`Plan not found: ${appPlanId}`);
  }
  
  console.log(`Webhook Helper: Found plan "${planData.name}" with course limit ${planData.course_limit}`);

  const subscriptionDataToUpsert: any = {
    user_id: userId,
    plan_id: planData.id,
    is_active: isActive,
    // Only include Stripe IDs if they are provided, to avoid overwriting with undefined
    ...(stripeCustomerId && { stripe_customer_id: stripeCustomerId }), 
    ...(stripeSubscriptionId && { stripe_subscription_id: stripeSubscriptionId }),
  };

  if (stripeCurrentPeriodEnd) {
    subscriptionDataToUpsert.stripe_current_period_end = stripeCurrentPeriodEnd.toISOString();
  }
  
  if (isActive && !subscriptionDataToUpsert.start_date) { // Only set start_date if becoming active and not already set
     // Check existing subscription to preserve original start_date if it exists
    const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('start_date')
        .eq('user_id', userId)
        .single();
    if (!existingSub?.start_date) {
        subscriptionDataToUpsert.start_date = new Date().toISOString();
    }
  }


  console.log('Webhook Helper: Upserting subscription data:', JSON.stringify(subscriptionDataToUpsert, null, 2));
  // Upsert subscription
  // Using user_id as the conflict target. Ensure this is appropriate for your schema.
  // If a user can have multiple (e.g., old inactive, new active) subscriptions, 
  // you might need a different conflict target or logic.
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionDataToUpsert, { onConflict: 'user_id' }); 

  if (subError) {
    console.error(`Webhook Helper: Error upserting subscription for user ${userId}:`, subError.message, subError.details);
    throw subError;
  }

  console.log(`Webhook Helper: Subscription upserted for user ${userId}. Now updating profile course limit.`);
  
  // Update course_limit on profiles table
  const { error: profileError } = await supabaseAdmin
    .from('profiles') 
    .update({ course_limit: planData.course_limit })
    .eq('id', userId); // 'id' in profiles table is the user_id

  if (profileError) {
    console.error(`Webhook Helper: Error updating course_limit for user ${userId}:`, profileError.message);
    // Decide if this is a critical error to throw. For now, logging it.
  }

  console.log(`Webhook: Successfully updated subscription and course limit for user ${userId} to plan ${appPlanId} (${planData.name}). Active: ${isActive}, Course Limit: ${planData.course_limit}`);
}


export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Webhook Error: Missing Stripe signature or webhook secret.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }
  
  console.log(`Webhook: Received event: ${event.type}`);

  if (relevantEvents.has(event.type)) {
    try {
      let userId: string;
      let appPlanId: string; // Your internal Plan UUID
      let customerId: string;
      let subscriptionId: string;
      let currentPeriodEnd: Date;

      switch (event.type) {
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode !== 'subscription' || !checkoutSession.subscription || !checkoutSession.customer) {
            console.log('Webhook: checkout.session.completed for non-subscription or missing data.');
            break;
          }
          userId = checkoutSession.metadata?.supabase_user_id!;
          appPlanId = checkoutSession.metadata?.app_plan_id!; // This is your internal Plan UUID
          customerId = typeof checkoutSession.customer === 'string' ? checkoutSession.customer : checkoutSession.customer.id;
          subscriptionId = typeof checkoutSession.subscription === 'string' ? checkoutSession.subscription : checkoutSession.subscription.id;
          
          const subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId);
          currentPeriodEnd = new Date(subscriptionDetails.current_period_end * 1000);

          if (!userId || !appPlanId) {
            console.error('Webhook Error: Missing supabase_user_id or app_plan_id in checkout session metadata.');
            break;
          }
          console.log(`Webhook: Processing checkout.session.completed for user ${userId}, app plan ID ${appPlanId}`);
          await updateUserSubscription(userId, appPlanId, true, customerId, subscriptionId, currentPeriodEnd);
          break;

        case 'invoice.payment_succeeded': // Or 'invoice_payment.paid'
          const invoice = event.data.object as Stripe.Invoice;
          if (!invoice.subscription || !invoice.customer || invoice.billing_reason !== 'subscription_cycle') {
            console.log('Webhook: Received invoice.payment_succeeded not for a subscription cycle or missing data.');
            break; 
          }
          subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
          customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
          
          const subDataInvoice = await stripe.subscriptions.retrieve(subscriptionId);
          userId = subDataInvoice.metadata.supabase_user_id!;
          appPlanId = subDataInvoice.metadata.app_plan_id!; // Your internal Plan UUID
          currentPeriodEnd = new Date(subDataInvoice.current_period_end * 1000);

          if (!userId || !appPlanId) {
            console.error('Webhook Error: Missing supabase_user_id or app_plan_id in subscription metadata for invoice.payment_succeeded.');
            break;
          }
          console.log(`Webhook: Processing invoice.payment_succeeded for user ${userId}, app plan ID ${appPlanId}`);
          await updateUserSubscription(userId, appPlanId, true, customerId, subscriptionId, currentPeriodEnd);
          break;

        case 'customer.subscription.updated':
          const updatedSubscription = event.data.object as Stripe.Subscription;
          userId = updatedSubscription.metadata.supabase_user_id!;
          const newStripePriceId = updatedSubscription.items.data[0]?.price.id;

          const { data: newPlanData, error: newPlanError } = await supabaseAdmin
            .from('plans')
            .select('id') // Select your internal plan ID
            .eq('stripe_price_id', newStripePriceId)
            .single();

          if (newPlanError || !newPlanData) {
            console.error(`Webhook: Could not find app plan for Stripe price ID ${newStripePriceId} during subscription update.`);
            break;
          }
          appPlanId = newPlanData.id; // Your internal Plan UUID
          customerId = typeof updatedSubscription.customer === 'string' ? updatedSubscription.customer : updatedSubscription.customer.id;
          subscriptionId = updatedSubscription.id;
          const subscriptionStatus = updatedSubscription.status;
          currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000);
          // Consider 'trialing' as active for access purposes
          const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'; 

          if (!userId) {
            console.error('Webhook Error: Missing supabase_user_id in subscription metadata for customer.subscription.updated.');
            break;
          }
          console.log(`Webhook: Processing customer.subscription.updated for user ${userId}, new app plan ID ${appPlanId}, status ${subscriptionStatus}`);
          await updateUserSubscription(userId, appPlanId, isActive, customerId, subscriptionId, currentPeriodEnd);
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          userId = deletedSubscription.metadata.supabase_user_id!;
          customerId = typeof deletedSubscription.customer === 'string' ? deletedSubscription.customer : deletedSubscription.customer.id;
          
          // Revert to a 'Free' plan or a default state.
          // Ensure you have a plan in your 'plans' table that represents this state.
          const { data: freePlanData, error: freePlanError } = await supabaseAdmin
            .from('plans')
            .select('id')
            .eq('name', 'Free') // Make sure 'Free' plan exists with this name
            .single();
          
          if (freePlanError || !freePlanData) {
            console.error('Webhook: Free plan not found for customer.subscription.deleted. Cannot revert user properly.');
            // Fallback: Mark subscription inactive but cannot set to a specific free plan ID
            // You might need to handle this case by setting course_limit to 0 directly or another default.
             const { error: subUpdateError } = await supabaseAdmin
              .from('subscriptions')
              .update({ is_active: false, stripe_subscription_id: null }) // Clear stripe_subscription_id
              .eq('user_id', userId);
            if (subUpdateError) console.error("Error marking sub inactive on delete without free plan:", subUpdateError);
            
            const { error: profileUpdateError } = await supabaseAdmin
                .from('profiles')
                .update({ course_limit: 0 }) // Default to 0 if no free plan found
                .eq('id', userId);
            if (profileUpdateError) console.error("Error setting course limit to 0 on delete without free plan:", profileUpdateError);

            break; 
          }
          appPlanId = freePlanData.id; // Your internal 'Free' Plan UUID

          if (!userId) {
            console.error('Webhook Error: Missing supabase_user_id in subscription metadata for customer.subscription.deleted.');
            break;
          }
          console.log(`Webhook: Processing customer.subscription.deleted for user ${userId}. Reverting to app plan ID ${appPlanId}`);
          // Mark as inactive, clear subscription ID. currentPeriodEnd is not relevant for inactive.
          await updateUserSubscription(userId, appPlanId, false, customerId, null /* clear stripe_subscription_id */);
          break;
        
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          console.log(`Webhook: Invoice payment failed for customer ${failedInvoice.customer}, subscription ${failedInvoice.subscription}. User might need to update payment method.`);
          // No direct database update here usually, as 'customer.subscription.updated' will handle status changes like 'past_due'.
          // You might want to send a notification to the user.
          break;

        default:
          console.warn(`Webhook: Unhandled relevant event type: ${event.type}`);
      }
    } catch (error: any) {
      console.error('Webhook handler error:', error.message, error);
      return NextResponse.json({ error: 'Webhook handler failed. See server logs.' }, { status: 500 });
    }
  } else {
    console.log(`Webhook: Received irrelevant event: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
