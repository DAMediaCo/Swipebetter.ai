import Stripe from 'stripe';
import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { db } from './db';
import { users } from '@shared/models/auth';
import { eq, sql } from 'drizzle-orm';

async function getStripeWebhookSecret(): Promise<string> {
  const sync = await getStripeSync();
  return (sync as any).webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '';
}

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    const stripe = await getUncachableStripeClient();
    
    let event: Stripe.Event;
    try {
      const webhookSecret = await getStripeWebhookSecret();
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } else {
        event = JSON.parse(payload.toString()) as Stripe.Event;
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      await sync.processWebhook(payload, signature);
      return;
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    try {
      await this.handleStripeEvent(event);
    } catch (err) {
      console.error('Error handling Stripe event:', err);
    }

    await sync.processWebhook(payload, signature);
  }

  private static async handleStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const customerId = session.customer as string;
    const amountTotal = session.amount_total || 0;
    const mode = session.mode;
    const subscriptionId = session.subscription as string | null;
    const sessionId = session.id;

    console.log(`[Checkout Complete] Customer: ${customerId}, Amount: ${amountTotal}, Mode: ${mode}, Session: ${sessionId}`);

    const user = await this.findUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Checkout] No user found for customer ${customerId}`);
      return;
    }

    const userId = user.id;
    
    // Atomic claim of checkout session - prevents race conditions with verify-checkout endpoint
    const claimed = await storage.claimCheckoutSession(userId, sessionId);
    if (!claimed) {
      console.log(`[Checkout] Session ${sessionId} already processed for user ${userId}, skipping`);
      return;
    }
    const amountDollars = amountTotal / 100;

    // Determine plan type from session metadata, price, or amount
    const metadata = session.metadata || {};
    const planType = metadata.plan_type || this.inferPlanTypeFromAmount(amountDollars, mode);

    console.log(`[Checkout] Inferred plan type: ${planType} for amount: $${amountDollars}`);

    if (mode === 'subscription') {
      // Monthly ($13) or Annual ($79) - both grant unlimited access
      await storage.setPlanTier(userId, 'unlimited');
      
      // Update subscription status (session already claimed atomically)
      await storage.updateUserSubscription(userId, {
        status: 'active',
        planType: amountDollars >= 70 ? 'annual' : 'monthly',
        stripeSubscriptionId: subscriptionId || undefined,
      });
      
      console.log(`[Checkout] Set user ${userId} to unlimited tier (${amountDollars >= 70 ? 'annual' : 'monthly'} subscription)`);
      await this.updateLifetimeSpend(userId, amountTotal);
      
    } else if (mode === 'payment') {
      // One-time payment - Starter Fix ($3)
      // Use stricter validation: $1-10 range for starter tier
      if (amountDollars >= 1 && amountDollars <= 10) {
        const currentTier = await storage.getPlanTier(userId);
        // Only set to starter if not already unlimited
        if (currentTier !== 'unlimited') {
          await storage.setPlanTier(userId, 'starter');
        }
        await storage.addCredits(userId, 1);
        
        // Also sync with legacy oneTimeCredits for backwards compatibility
        await storage.addOneTimeCredits(userId, 1, 'purchased');
        
        console.log(`[Checkout] Added 1 credit to user ${userId} (starter fix)`);
      } else {
        console.log(`[Checkout] One-time payment of $${amountDollars} doesn't match starter tier range`);
      }
      
      await this.updateLifetimeSpend(userId, amountTotal);
    }
  }

  private static inferPlanTypeFromAmount(amountDollars: number, mode: string | null): string {
    if (mode === 'subscription') {
      if (amountDollars >= 70) return 'annual';
      if (amountDollars >= 10) return 'monthly';
    }
    if (amountDollars >= 1 && amountDollars <= 10) return 'starter';
    return 'unknown';
  }

  private static async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const status = subscription.status;

    console.log(`[Subscription Change] Customer: ${customerId}, Status: ${status}`);

    const user = await this.findUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Subscription] No user found for customer ${customerId}`);
      return;
    }

    const userId = user.id;

    if (status === 'active' || status === 'trialing') {
      await storage.setPlanTier(userId, 'unlimited');
      console.log(`[Subscription] Set user ${userId} to unlimited tier`);
    } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
      const currentTier = await storage.getPlanTier(userId);
      if (currentTier === 'unlimited') {
        const credits = await storage.getCredits(userId);
        if (credits > 0) {
          await storage.setPlanTier(userId, 'starter');
        } else {
          await storage.setPlanTier(userId, 'free');
        }
        console.log(`[Subscription] Downgraded user ${userId} from unlimited`);
      }
    }
  }

  private static async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const amountPaid = invoice.amount_paid || 0;

    console.log(`[Invoice Paid] Customer: ${customerId}, Amount: ${amountPaid}`);

    const user = await this.findUserByStripeCustomerId(customerId);
    if (!user) {
      console.log(`[Invoice] No user found for customer ${customerId}`);
      return;
    }

    await this.updateLifetimeSpend(user.id, amountPaid);
  }

  private static async findUserByStripeCustomerId(customerId: string): Promise<{ id: string } | null> {
    const result = await db.execute(
      sql`SELECT user_id FROM user_subscriptions WHERE stripe_customer_id = ${customerId} LIMIT 1`
    );
    
    if (result.rows.length > 0) {
      return { id: (result.rows[0] as any).user_id };
    }
    return null;
  }

  private static async updateLifetimeSpend(userId: string, amountCents: number): Promise<void> {
    await db.execute(
      sql`UPDATE user_subscriptions 
          SET lifetime_spend_cents = COALESCE(lifetime_spend_cents, 0) + ${amountCents},
              last_payment_at = NOW(),
              updated_at = NOW()
          WHERE user_id = ${userId}`
    );
  }
}
