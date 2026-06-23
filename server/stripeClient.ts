import Stripe from 'stripe';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

export async function getUncachableStripeClient() {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-11-17.clover",
  });
}

export async function getStripePublishableKey() {
  return requireEnv("STRIPE_PUBLISHABLE_KEY");
}

export async function getStripeSecretKey() {
  return requireEnv("STRIPE_SECRET_KEY");
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: requireEnv("DATABASE_URL"),
        max: 2,
      },
      stripeSecretKey: requireEnv("STRIPE_SECRET_KEY"),
    });
  }
  return stripeSync;
}
