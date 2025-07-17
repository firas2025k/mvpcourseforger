// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Supabase client with service role key for admin operations
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const relevantEvents = new Set([
  'checkout.session.completed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

// Helper function to update user's subscription and course limit
async function updateUserSubscription(
    userId: string, 
    appPlanId: string | null, // This is your internal plan ID (UUID)
    isActive: boolean, 
    stripeCustomerId?: string, 
    stripeSubscriptionId?: string | null, 
    stripeCurrentPeriodEnd?: Date
) {
  console.log(`Webhook Helper: Updating for User ID: ${userId}, App Plan ID: ${appPlanId}, Active: ${isActive}`);

  if (!appPlanId) {
    console.error(`Webhook Helper: No plan ID provided for user ${userId}`);
    return;
  }

  const { data: planData, error: planError } = await supabaseAdmin
    .from('plans')
    .select('id, course_limit, name')
    .eq('id', appPlanId)
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
    ...(stripeCustomerId && { stripe_customer_id: stripeCustomerId }), 
    ...(stripeSubscriptionId !== undefined && { stripe_subscription_id: stripeSubscriptionId }),
  };

  if (stripeCurrentPeriodEnd) {
    subscriptionDataToUpsert.stripe_current_period_end = stripeCurrentPeriodEnd.toISOString();
  }
  
  if (isActive && !subscriptionDataToUpsert.start_date) {
    const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('start_date')
        .eq('user_id', userId)
        .single();
    if (!existingSub?.start_date) {
        subscriptionDataToUpsert.start_date = new Date().toISOString();
    }
  }

  if (!isActive) {
    subscriptionDataToUpsert.end_date = new Date().toISOString();
  }

  console.log('Webhook Helper: Upserting subscription data:', JSON.stringify(subscriptionDataToUpsert, null, 2));
  
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionDataToUpsert, { onConflict: 'user_id' }); 

  if (subError) {
    console.error(`Webhook Helper: Error upserting subscription for user ${userId}:`, subError.message, subError.details);
    throw subError;
  }

  console.log(`Webhook: Successfully updated subscription for user ${userId} to plan ${appPlanId} (${planData.name}). Active: ${isActive}. Profile course limit update handled by trigger.`);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature');

  if (!sig || !endpointSecret) {
    console.error('Webhook Error: Missing Stripe signature or webhook secret.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }
  
  console.log(`Webhook: Received event: ${event.type}`);

  if (relevantEvents.has(event.type)) {
    try {
      let userId: string;
      let appPlanId: string | null;
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
          appPlanId = checkoutSession.metadata?.app_plan_id!;
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

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          if (!invoice.subscription || !invoice.customer || invoice.billing_reason !== 'subscription_cycle') {
            console.log('Webhook: Received invoice.payment_succeeded not for a subscription cycle or missing data.');
            break; 
          }
          subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
          customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
          
          const subDataInvoice = await stripe.subscriptions.retrieve(subscriptionId);
          userId = subDataInvoice.metadata.supabase_user_id!;
          appPlanId = subDataInvoice.metadata.app_plan_id!;
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
          userId = updatedSubscription.metadata.supabase_user_id;

          if (!userId) {
            const customerId = typeof updatedSubscription.customer === 'string' ? updatedSubscription.customer : updatedSubscription.customer.id;
            const customer = await stripe.customers.retrieve(customerId);
            userId = (customer as any).metadata.supabase_user_id;
            if (!userId) {
              console.error('Webhook Error: Missing supabase_user_id in customer metadata for customer.subscription.updated.');
              break;
            }
          }
          
          const newStripePriceId = updatedSubscription.items.data[0]?.price.id;
          const subscriptionStatus = updatedSubscription.status;
          const willCancelAtPeriodEnd = updatedSubscription.cancel_at_period_end;

          // CRITICAL FIX: If cancel_at_period_end is true, treat as inactive and revert to Free plan
          const isActive = (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') && !willCancelAtPeriodEnd; 

          let currentPeriodEnd: Date | undefined;
          customerId = typeof updatedSubscription.customer === 'string' ? updatedSubscription.customer : updatedSubscription.customer.id;
          subscriptionId = updatedSubscription.id;

          if (willCancelAtPeriodEnd || !isActive) {
            // User has cancelled or subscription is inactive - revert to Free plan
            const { data: freePlanData, error: freePlanError } = await supabaseAdmin
                .from('plans')
                .select('id')
                .eq('name', 'Free')
                .single();

            if (freePlanError || !freePlanData) {
                console.error('Webhook: Free plan not found for inactive customer.subscription.updated. Cannot revert user properly.');
                appPlanId = null;
            } else {
                appPlanId = freePlanData.id;
            }
            currentPeriodEnd = undefined;
          } else {
            // Subscription is active - use the current plan
            const { data: newPlanData, error: newPlanError } = await supabaseAdmin
                .from('plans')
                .select('id')
                .eq('stripe_price_id', newStripePriceId)
                .single();

            if (newPlanError || !newPlanData) {
                console.error(`Webhook: Could not find app plan for Stripe price ID ${newStripePriceId} during subscription update.`);
                const { data: freePlanData } = await supabaseAdmin.from('plans').select('id').eq('name', 'Free').single();
                appPlanId = freePlanData?.id || null;
                console.warn(`Webhook: Falling back to free plan for user ${userId} due to missing Stripe price ID.`);
                if (!freePlanData) {
                   await updateUserSubscription(userId, null, false, customerId, updatedSubscription.id, undefined);
                   break;
                }
            } else {
                appPlanId = newPlanData.id;
            }
            currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000);
          }
          
          console.log(`Webhook: Processing customer.subscription.updated for user ${userId}, app plan ID ${appPlanId}, status ${subscriptionStatus}, cancel_at_period_end: ${willCancelAtPeriodEnd}, isActive: ${isActive}`);
          await updateUserSubscription(userId, appPlanId, isActive, customerId, subscriptionId, currentPeriodEnd);
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          const customerIdForDeletion = typeof deletedSubscription.customer === 'string' ? deletedSubscription.customer : deletedSubscription.customer.id;
          const subscriptionIdForDeletion = deletedSubscription.id;

          let userIdForDeletion: string | undefined;

          if (deletedSubscription.metadata?.supabase_user_id) {
              userIdForDeletion = deletedSubscription.metadata.supabase_user_id;
          } else {
              const { data: existingSubRecord, error: subRecordError } = await supabaseAdmin
                  .from('subscriptions')
                  .select('user_id')
                  .eq('stripe_subscription_id', subscriptionIdForDeletion)
                  .single();

              if (existingSubRecord) {
                  userIdForDeletion = existingSubRecord.user_id;
              } else {
                  console.error(`Webhook: Could not find user_id for deleted subscription ${subscriptionIdForDeletion}. Error: ${subRecordError?.message}`);
                  try {
                      const customer = await stripe.customers.retrieve(customerIdForDeletion);
                      if ((customer as any).metadata?.supabase_user_id) {
                          userIdForDeletion = (customer as any).metadata.supabase_user_id;
                      }
                  } catch (e: any) {
                      console.error(`Webhook: Failed to retrieve customer ${customerIdForDeletion} for user_id fallback: ${e.message}`);
                  }
              }
          }

          if (!userIdForDeletion) {
              console.error(`Webhook Error: Critical - Could not determine supabase_user_id for customer.subscription.deleted event for customer ${customerIdForDeletion}. Cannot revert plan.`);
              break;
          }

          const { data: freePlanData, error: freePlanError } = await supabaseAdmin
              .from('plans')
              .select('id')
              .eq('name', 'Free')
              .single();

          if (freePlanError || !freePlanData) {
              console.error('Webhook: Free plan not found for customer.subscription.deleted. Cannot revert user properly. Marking subscription inactive and course_limit to 0.');
              await supabaseAdmin
                  .from('subscriptions')
                  .update({ 
                      is_active: false, 
                      stripe_subscription_id: null, 
                      plan_id: null,
                      end_date: new Date().toISOString() 
                  }) 
                  .eq('user_id', userIdForDeletion);

              await supabaseAdmin
                  .from('profiles')
                  .update({ course_limit: 0 })
                  .eq('id', userIdForDeletion);
              break;
          }

          const appPlanIdForDeletion = freePlanData.id;

          console.log(`Webhook: Processing customer.subscription.deleted for user ${userIdForDeletion}. Reverting to app plan ID ${appPlanIdForDeletion}`);
          await updateUserSubscription(
              userIdForDeletion,
              appPlanIdForDeletion,
              false,
              customerIdForDeletion,
              null
          );
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          console.log(`Webhook: Invoice payment failed for customer ${failedInvoice.customer}, subscription ${failedInvoice.subscription}. User might need to update payment method.`);
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

