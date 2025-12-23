import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { requireAuth, getCurrentUserId } from "./auth";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { z } from "zod";

const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const MAX_SCREENSHOTS = 5;
const MAX_SCREENSHOT_SIZE = 10 * 1024 * 1024; // 10MB base64

const profileAnalysisSchema = z.object({
  platform: z.enum(["Tinder", "Hinge", "Bumble", "Grindr", "Coffee Meets Bagel", "Other"]),
  gender: z.enum(["Man", "Woman", "Non-binary"]),
  intent: z.enum(["Relationship", "Casual Dating", "Friendship", "Not Sure"]),
  screenshots: z.array(z.string().max(MAX_SCREENSHOT_SIZE)).min(1).max(MAX_SCREENSHOTS),
  enm: z.boolean().optional(),
});

const replyAnalysisSchema = z.object({
  tone: z.enum(["flirty", "witty", "confident", "thoughtful"]),
  screenshots: z.array(z.string().max(MAX_SCREENSHOT_SIZE)).min(1).max(3),
  enm: z.boolean().optional(),
});

const checkoutSchema = z.object({
  priceId: z.string().startsWith("price_"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Note: /api/auth/user is now registered in server/auth.ts

  app.get("/api/me", requireAuth, async (req: any, res) => {
    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    const subscription = await storage.getUserSubscription(userId);
    
    const isActive = subscription?.status === "active";
    const isTrialing = subscription?.status === "trialing";
    const hasOneTimeCredits = (subscription?.oneTimeCredits || 0) > 0;
    
    const proActive = isActive || isTrialing;
    const isPro = proActive || hasOneTimeCredits;
    
    let planType: "monthly" | "annual" | "starter" | null = null;
    
    if (subscription?.planType) {
      planType = subscription.planType as "monthly" | "annual" | "starter";
    } else if (hasOneTimeCredits && !proActive) {
      planType = "starter";
    } else if (proActive) {
      const planLower = (subscription?.plan || "").toLowerCase();
      if (planLower.includes("annual") || planLower.includes("year")) {
        planType = "annual";
      } else {
        planType = "monthly";
      }
    }

    res.json({
      user: user ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      } : null,
      isPro,
      proActive,
      planType,
      subscriptionStatus: subscription?.status || null,
      oneTimeCredits: subscription?.oneTimeCredits || 0,
    });
  });

  app.get("/api/subscription", requireAuth, async (req: any, res) => {
    const subscription = await storage.getUserSubscription(req.session.userId);
    const isActive = subscription?.status === "active";
    const hasOneTimeCredits = (subscription?.oneTimeCredits || 0) > 0;
    
    res.json({ 
      subscription: subscription || null,
      canAnalyze: isActive || hasOneTimeCredits,
      isSubscribed: isActive,
      oneTimeCredits: subscription?.oneTimeCredits || 0
    });
  });

  app.post("/api/analyze-profile", requireAuth, async (req: any, res) => {
    try {
      const parseResult = profileAnalysisSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: parseResult.error.flatten() 
        });
      }
      const { platform, gender, intent, screenshots } = parseResult.data;
      const userId = req.session.userId;

      const subscription = await storage.getUserSubscription(userId);
      const isSubscribed = subscription?.status === "active";
      const hasOneTimeCredits = (subscription?.oneTimeCredits || 0) > 0;

      if (!isSubscribed && !hasOneTimeCredits) {
        return res.status(403).json({ 
          error: "Subscription required",
          requiresSubscription: true 
        });
      }

      if (!isSubscribed && hasOneTimeCredits) {
        await storage.decrementOneTimeCredits(userId);
      }

      const systemPrompt = `You are an expert dating profile consultant specializing in ${platform}. 
      The user is ${gender} looking for ${intent}. Analyze their profile screenshots and provide:
      1. An overall score from 1-100
      2. Specific bio suggestions (3-5 alternatives)
      3. Photo feedback (what works, what to change)
      4. Top 3 improvements to make
      
      Be constructive, specific, and actionable. Format your response as JSON with keys:
      overallScore (number), bioSuggestions (string with suggestions), photoFeedback (string), improvements (string with numbered list).`;

      const userContent = screenshots.map((img: string) => ({
        type: "image_url" as const,
        image_url: { url: img }
      }));

      const response = await grok.chat.completions.create({
        model: "grok-2-vision-1212",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: [
            { type: "text", text: `Please analyze this ${platform} dating profile for a ${gender} looking for ${intent}.` },
            ...userContent
          ]}
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const analysisText = response.choices[0]?.message?.content || "{}";
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch {
        analysis = { 
          overallScore: 70, 
          bioSuggestions: analysisText, 
          photoFeedback: "", 
          improvements: "" 
        };
      }

      const savedAnalysis = await storage.createProfileAnalysis({
        userId,
        platform,
        gender,
        intent,
        screenshots,
        bioSuggestions: analysis.bioSuggestions,
        photoFeedback: analysis.photoFeedback,
        overallScore: analysis.overallScore,
        improvements: analysis.improvements,
      });

      res.json({ 
        analysis: savedAnalysis,
        parsed: analysis
      });
    } catch (error) {
      console.error("Profile analysis error:", error);
      res.status(500).json({ error: "Failed to analyze profile" });
    }
  });

  app.post("/api/analyze-reply", requireAuth, async (req: any, res) => {
    try {
      const parseResult = replyAnalysisSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: parseResult.error.flatten() 
        });
      }
      const { tone, screenshots } = parseResult.data;
      const userId = req.session.userId;

      const subscription = await storage.getUserSubscription(userId);
      const isSubscribed = subscription?.status === "active";
      const hasOneTimeCredits = (subscription?.oneTimeCredits || 0) > 0;

      if (!isSubscribed && !hasOneTimeCredits) {
        return res.status(403).json({ 
          error: "Subscription required",
          requiresSubscription: true 
        });
      }

      if (!isSubscribed && hasOneTimeCredits) {
        await storage.decrementOneTimeCredits(userId);
      }

      const systemPrompt = `You are an expert dating conversation coach. Analyze the conversation screenshots and generate 3 reply suggestions with a ${tone} tone.
      
      Consider:
      - The conversation flow and context
      - What makes messages engaging
      - How to keep the conversation going
      - Appropriate humor and wit
      
      Format your response as JSON with keys:
      conversationContext (brief summary of the conversation),
      suggestedReplies (array of 3 string replies, each different in approach but matching the ${tone} tone)`;

      const userContent = screenshots.map((img: string) => ({
        type: "image_url" as const,
        image_url: { url: img }
      }));

      const response = await grok.chat.completions.create({
        model: "grok-2-vision-1212",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: [
            { type: "text", text: `Generate ${tone} reply suggestions for this dating app conversation.` },
            ...userContent
          ]}
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      });

      const analysisText = response.choices[0]?.message?.content || "{}";
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch {
        analysis = { 
          conversationContext: "", 
          suggestedReplies: [analysisText] 
        };
      }

      const savedAnalysis = await storage.createReplyAnalysis({
        userId,
        tone,
        screenshots,
        suggestedReplies: analysis.suggestedReplies || [],
        conversationContext: analysis.conversationContext,
      });

      res.json({ 
        analysis: savedAnalysis,
        parsed: analysis
      });
    } catch (error) {
      console.error("Reply analysis error:", error);
      res.status(500).json({ error: "Failed to analyze conversation" });
    }
  });

  app.get("/api/my-analyses", requireAuth, async (req: any, res) => {
    const profileAnalyses = await storage.getProfileAnalyses(req.session.userId);
    const replyAnalyses = await storage.getReplyAnalyses(req.session.userId);
    res.json({ profileAnalyses, replyAnalyses });
  });

  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting publishable key:", error);
      res.status(500).json({ error: "Failed to get Stripe publishable key" });
    }
  });

  app.post("/api/stripe/sync", async (req, res) => {
    try {
      const { getStripeSync } = await import('./stripeClient');
      const stripeSync = await getStripeSync();
      await stripeSync.syncBackfill();
      res.json({ success: true, message: "Stripe data synced" });
    } catch (error) {
      console.error("Error syncing Stripe:", error);
      res.status(500).json({ error: "Failed to sync Stripe data" });
    }
  });

  // Debug endpoint to check actual Stripe prices
  app.get("/api/stripe/debug-prices", async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const prices = await stripe.prices.list({ limit: 100 });
      const products = await stripe.products.list({ limit: 50 });
      res.json({ 
        prices: prices.data.map(p => ({
          id: p.id,
          product: p.product,
          unit_amount: p.unit_amount,
          recurring: p.recurring,
          type: p.type,
          active: p.active
        })),
        products: products.data.map(p => ({
          id: p.id,
          name: p.name,
          active: p.active
        }))
      });
    } catch (error) {
      console.error("Error fetching Stripe debug:", error);
      res.status(500).json({ error: "Failed to fetch Stripe data" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.listProducts();
      res.json({ data: products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.json({ data: [] });
    }
  });

  app.get("/api/products-with-prices", async (req, res) => {
    try {
      const rows = await storage.listProductsWithPrices();
      
      const productsMap = new Map();
      for (const row of rows) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
            metadata: row.price_metadata,
          });
        }
      }

      res.json({ data: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Error fetching products with prices:", error);
      res.json({ data: [] });
    }
  });

  app.post("/api/checkout", requireAuth, async (req: any, res) => {
    try {
      const parseResult = checkoutSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid price ID" 
        });
      }
      const { priceId } = parseResult.data;
      const userId = req.session.userId;
      const stripe = await getUncachableStripeClient();

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      let subscription = await storage.getUserSubscription(userId);
      let customerId = subscription?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: userId },
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, { stripeCustomerId: customerId });
      }

      const price = await storage.getPrice(priceId);
      const recurring = price?.recurring;
      const isRecurring = recurring && (typeof recurring === 'object' ? !!recurring.interval : !!recurring);
      
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: isRecurring ? 'subscription' : 'payment',
        success_url: `${req.protocol}://${req.get('host')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/pricing`,
      });

      res.json({ url: checkoutSession.url });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/verify-checkout", requireAuth, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ error: "Session ID required" });
      }

      const userId = req.session.userId;
      const stripe = await getUncachableStripeClient();
      
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'line_items']
      });

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      const customerId = session.customer as string;
      const subscription = session.subscription as any;
      const isOneTime = session.mode === 'payment';
      
      let userSub = await storage.getUserSubscription(userId);
      if (userSub?.stripeCustomerId && userSub.stripeCustomerId !== customerId) {
        return res.status(403).json({ error: "Session does not belong to this user" });
      }
      
      if (!userSub) {
        userSub = await storage.createUserSubscription({ userId });
      }
      
      const lineItem = session.line_items?.data?.[0];
      const priceAmount = (session.amount_total ?? 0) / 100;
      const priceId = lineItem?.price?.id ?? '';
      const productName = typeof lineItem?.description === 'string' ? lineItem.description : '';
      
      let planType: 'starter' | 'monthly' | 'annual' = 'starter';
      if (!isOneTime) {
        const interval = lineItem?.price?.recurring?.interval;
        planType = interval === 'year' ? 'annual' : 'monthly';
      }
      
      if (isOneTime) {
        await storage.addOneTimeCredits(userId, 1);
        await storage.updateUserSubscription(userId, {
          stripeCustomerId: customerId,
          stripePriceId: priceId,
          planType: planType,
        });
        res.json({ 
          success: true, 
          status: 'one_time', 
          credits: 1,
          purchase: {
            plan_type: planType,
            price: priceAmount,
            currency: 'USD',
            tool_type: 'both',
            transaction_id: sessionId,
            price_id: priceId,
            product_name: productName,
          }
        });
      } else {
        if (!subscription) {
          return res.status(400).json({ error: "No subscription found" });
        }
        
        await storage.updateUserSubscription(userId, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          status: 'active',
          plan: 'pro',
          planType: planType,
          currentPeriodEnd: subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000) 
            : null,
        });

        res.json({ 
          success: true, 
          status: 'active',
          purchase: {
            plan_type: planType,
            price: priceAmount,
            currency: 'USD',
            tool_type: 'both',
            transaction_id: sessionId,
            price_id: priceId,
            product_name: productName,
          }
        });
      }
    } catch (error) {
      console.error("Verify checkout error:", error);
      res.status(500).json({ error: "Failed to verify checkout" });
    }
  });

  app.post("/api/customer-portal", requireAuth, async (req: any, res) => {
    try {
      const subscription = await storage.getUserSubscription(req.session.userId);
      if (!subscription?.stripeCustomerId) {
        return res.status(400).json({ error: "No subscription found" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${req.protocol}://${req.get('host')}/`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Customer portal error:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  return httpServer;
}
