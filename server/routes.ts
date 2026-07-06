import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { requireAuth, getCurrentUserId } from "./auth";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { z } from "zod";
import sharp from "sharp";
import {
  APPLE_IAP_PRODUCT_IDS,
  AppleIapOwnershipError,
  AppleIapValidationError,
  type AppleTransactionPayload,
  appleAppAccountTokenMatchesUser,
  classifyAppleNotification,
  createAppleServerApiToken,
  decodeAppleJwsPayload,
  normalizedAppleAppAccountToken,
  validateAppleTransaction,
} from "./appleIap";

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many analysis requests, please wait a moment" },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down" },
});

const publicAppUrl = (process.env.APP_URL || "https://swipebetter.ai").replace(/\/$/, "");

// Compress base64 image to reduce payload size for AI processing
async function compressImage(base64DataUrl: string, maxWidth = 800, quality = 70): Promise<string> {
  try {
    // Extract base64 data and mime type
    const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return base64DataUrl;
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Compress with sharp
    const compressed = await sharp(buffer)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
    
    return `data:image/jpeg;base64,${compressed.toString('base64')}`;
  } catch (error) {
    console.error("Image compression failed, using original:", error);
    return base64DataUrl;
  }
}

const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const MAX_SCREENSHOTS = 10;
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
  goal: z.enum(["first_impression", "keep_going", "ask_out", "revive"]).optional(),
  screenshots: z.array(z.string().max(MAX_SCREENSHOT_SIZE)).max(3).optional(),
  conversationText: z.string().max(5000).optional(),
  enm: z.boolean().optional(),
}).refine(data => (data.screenshots && data.screenshots.length > 0) || (data.conversationText && data.conversationText.trim().length > 0), {
  message: "Either screenshots or conversation text is required"
});

const ocrSchema = z.object({
  screenshot: z.string().max(MAX_SCREENSHOT_SIZE),
});

const checkoutSchema = z.object({
  priceId: z.string().startsWith("price_"),
  returnTo: z.string().optional(),
});

const iosIapSchema = z.object({
  transactionId: z.string().min(5).max(128),
  productId: z.enum(APPLE_IAP_PRODUCT_IDS),
});

const iosServerNotificationSchema = z.object({
  signedPayload: z.string().min(20),
});

function applePrivateKey(): string {
  return (process.env.APPLE_IAP_PRIVATE_KEY || "").replace(/\\n/g, "\n");
}

function createConfiguredAppleServerApiToken(): string {
  const issuerId = process.env.APPLE_IAP_ISSUER_ID;
  const keyId = process.env.APPLE_IAP_KEY_ID;
  const bundleId = process.env.APPLE_BUNDLE_ID || "ai.swipebetter.app";
  const privateKey = applePrivateKey();

  if (!issuerId || !keyId || !privateKey) {
    throw new Error("Apple IAP verification is not configured");
  }

  return createAppleServerApiToken({ issuerId, keyId, bundleId, privateKey });
}

type AppleServerNotificationPayload = {
  notificationType?: string;
  subtype?: string;
  notificationUUID?: string;
  data?: {
    bundleId?: string;
    environment?: string;
    signedTransactionInfo?: string;
    signedRenewalInfo?: string;
  };
};

async function fetchAppleTransaction(transactionId: string): Promise<AppleTransactionPayload> {
  const token = createConfiguredAppleServerApiToken();
  const endpoints = [
    { environment: "Production", url: `https://api.storekit.itunes.apple.com/inApps/v1/transactions/${transactionId}` },
    { environment: "Sandbox", url: `https://api.storekit-sandbox.itunes.apple.com/inApps/v1/transactions/${transactionId}` },
  ];

  let lastError = "";
  for (const endpoint of endpoints) {
    const response = await fetch(endpoint.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const body = await response.json() as { signedTransactionInfo?: string };
      if (!body.signedTransactionInfo) {
        throw new Error("Apple transaction response missing signedTransactionInfo");
      }
      const transaction = decodeAppleJwsPayload<AppleTransactionPayload>(body.signedTransactionInfo);
      return {
        ...transaction,
        environment: transaction.environment || endpoint.environment,
      };
    }
    lastError = `${response.status} ${await response.text()}`;
    if (![401, 403, 404].includes(response.status)) break;
  }

  throw new Error(`Apple transaction verification failed: ${lastError}`);
}

function appleDate(value?: number): Date | null {
  return value ? new Date(Number(value)) : null;
}

async function resolveAppleNotificationUser(transaction: AppleTransactionPayload): Promise<{
  userId?: string;
  accountTokenMismatch: boolean;
}> {
  const storedUserId = await storage.getAppleTransactionUserId(
    transaction.transactionId,
    transaction.originalTransactionId || null
  );
  if (storedUserId) {
    return {
      userId: storedUserId,
      accountTokenMismatch: !appleAppAccountTokenMatchesUser(transaction.appAccountToken, storedUserId),
    };
  }

  const accountToken = normalizedAppleAppAccountToken(transaction.appAccountToken);
  const accountTokenUser = accountToken
    ? await storage.getUser(accountToken)
    : undefined;

  return {
    userId: accountTokenUser?.id,
    accountTokenMismatch: false,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use("/api/", generalLimiter);

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  app.get("/api/me", requireAuth, async (req: any, res) => {
    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    const subscription = await storage.getUserSubscription(userId);
    const planTier = await storage.getPlanTier(userId);
    const credits = await storage.getCredits(userId);
    const isSuperUser = await storage.isSuperUser(userId);
    
    const periodEnd = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
    const periodActive = !periodEnd || periodEnd.getTime() >= Date.now();
    const isActive = subscription?.status === "active" && periodActive;
    const isTrialing = subscription?.status === "trialing";
    const hasOneTimeCredits = (subscription?.oneTimeCredits || 0) > 0 || credits > 0;
    
    const proActive = isActive || isTrialing || planTier === "unlimited" || isSuperUser;
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
      planTier,
      planType,
      subscriptionStatus: subscription?.status || null,
      oneTimeCredits: Math.max(subscription?.oneTimeCredits || 0, credits),
    });
  });

  app.delete("/api/account", requireAuth, async (req: any, res) => {
    const userId = req.session.userId;

    try {
      const subscription = await storage.getUserSubscription(userId);
      const stripeSubscriptionId = subscription?.stripeSubscriptionId;
      const shouldCancelStripe = !!stripeSubscriptionId
        && ["active", "trialing", "past_due", "unpaid"].includes(subscription?.status || "");

      if (shouldCancelStripe) {
        const stripe = await getUncachableStripeClient();
        await stripe.subscriptions.cancel(stripeSubscriptionId);
      }

      await db.delete(users).where(eq(users.id, userId));

      req.session.destroy((err: Error | null) => {
        if (err) {
          console.error("Delete account session cleanup error:", err);
          return res.status(500).json({ error: "Account deleted, but session cleanup failed" });
        }

        res.clearCookie("connect.sid");
        res.json({
          success: true,
          stripeSubscriptionCanceled: shouldCancelStripe,
        });
      });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  app.get("/api/subscription", requireAuth, async (req: any, res) => {
    const subscription = await storage.getUserSubscription(req.session.userId);
    const planTier = await storage.getPlanTier(req.session.userId);
    const credits = await storage.getCredits(req.session.userId);
    const periodEnd = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
    const periodActive = !periodEnd || periodEnd.getTime() >= Date.now();
    const isActive = subscription?.status === "active" && periodActive;
    const hasOneTimeCredits = (subscription?.oneTimeCredits || 0) > 0 || credits > 0;
    
    res.json({ 
      subscription: subscription || null,
      canAnalyze: true, // Allow all users to analyze (freemium model)
      isSubscribed: isActive || planTier === "unlimited",
      planTier,
      credits,
      oneTimeCredits: Math.max(subscription?.oneTimeCredits || 0, credits),
      isPaidUser: isActive || planTier === "unlimited" || hasOneTimeCredits, // For determining if user sees full results
    });
  });

  // ===== USAGE GATE ENDPOINTS =====
  
  // Unlock Report Gate (Profile Optimizer)
  // - If unlimited tier: ALLOW
  // - If already unlocked this report: ALLOW  
  // - If has credits > 0: ALLOW, deduct 1 credit, add report to unlocked
  // - Else: DENY (402 Payment Required)
  app.post("/api/unlock-report", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { reportId } = req.body;

      if (!reportId) {
        return res.status(400).json({ error: "Report ID is required" });
      }

      const planTier = await storage.getPlanTier(userId);
      const isSuperUser = await storage.isSuperUser(userId);
      
      // Unlimited users or super users can access everything
      if (planTier === 'unlimited' || isSuperUser) {
        return res.json({ 
          access: 'granted', 
          reason: isSuperUser ? 'super_user' : 'unlimited_plan',
          planTier 
        });
      }

      // Check if report is already unlocked
      const isUnlocked = await storage.isReportUnlocked(userId, reportId);
      if (isUnlocked) {
        return res.json({ 
          access: 'granted', 
          reason: 'already_unlocked',
          planTier 
        });
      }

      // Try atomic credit deduction + unlock
      const result = await storage.unlockReportWithCredit(userId, reportId);
      if (result.success) {
        return res.json({ 
          access: 'granted', 
          reason: 'credit_used',
          creditsRemaining: result.creditsRemaining,
          planTier 
        });
      }

      // No access - payment required
      return res.status(402).json({ 
        error: 'Payment required',
        access: 'denied',
        reason: 'no_credits',
        planTier,
        creditsRemaining: 0
      });
    } catch (error) {
      console.error("Unlock report error:", error);
      res.status(500).json({ error: "Failed to process unlock request" });
    }
  });

  // Check if user can access a report (without deducting)
  app.get("/api/check-report-access/:reportId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { reportId } = req.params;

      const planTier = await storage.getPlanTier(userId);
      const isSuperUser = await storage.isSuperUser(userId);
      const credits = await storage.getCredits(userId);
      const isUnlocked = await storage.isReportUnlocked(userId, reportId);

      const canAccess = planTier === 'unlimited' || isSuperUser || isUnlocked || credits > 0;

      res.json({
        canAccess,
        isUnlocked,
        planTier,
        credits,
        isSuperUser,
        reason: isSuperUser ? 'super_user' :
                planTier === 'unlimited' ? 'unlimited_plan' : 
                isUnlocked ? 'already_unlocked' : 
                credits > 0 ? 'has_credits' : 'no_access'
      });
    } catch (error) {
      console.error("Check access error:", error);
      res.status(500).json({ error: "Failed to check access" });
    }
  });

  // Generate Reply Gate (Rizz Assistant)
  // - If unlimited tier: ALLOW
  // - If has credits > 0: ALLOW and deduct 1 credit (atomic)
  // - Else: DENY (402 Payment Required)
  app.post("/api/check-reply-access", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { deductCredit } = req.body;

      const planTier = await storage.getPlanTier(userId);
      const isSuperUser = await storage.isSuperUser(userId);
      
      // Unlimited users or super users can access everything
      if (planTier === 'unlimited' || isSuperUser) {
        return res.json({ 
          access: 'granted', 
          reason: isSuperUser ? 'super_user' : 'unlimited_plan',
          planTier 
        });
      }

      // If just checking (not deducting), report current status
      if (!deductCredit) {
        const credits = await storage.getCredits(userId);
        if (credits > 0) {
          return res.json({ 
            access: 'granted', 
            reason: 'has_credits',
            creditsRemaining: credits,
            planTier 
          });
        }
        return res.status(402).json({ 
          error: 'Payment required',
          access: 'denied',
          reason: 'no_credits',
          planTier,
          creditsRemaining: 0
        });
      }

      // Atomic credit deduction - returns true only if successful
      const deducted = await storage.deductCredit(userId);
      if (deducted) {
        const remainingCredits = await storage.getCredits(userId);
        return res.json({ 
          access: 'granted', 
          reason: 'credit_used',
          creditsRemaining: remainingCredits,
          planTier 
        });
      }

      // No access - payment required (atomic deduction failed)
      return res.status(402).json({ 
        error: 'Payment required',
        access: 'denied',
        reason: 'no_credits',
        planTier,
        creditsRemaining: 0
      });
    } catch (error) {
      console.error("Check reply access error:", error);
      res.status(500).json({ error: "Failed to check reply access" });
    }
  });

  // Get user's credit/subscription status
  app.get("/api/credits", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const planTier = await storage.getPlanTier(userId);
      const credits = await storage.getCredits(userId);
      const reportsUnlocked = await storage.getUnlockedReports(userId);
      const isSuperUser = await storage.isSuperUser(userId);
      const isUnlimited = planTier === 'unlimited' || isSuperUser;


      res.json({
        planTier,
        credits,
        reportsUnlocked,
        hasAccess: isUnlimited || credits > 0,
        isUnlimited,
        isSuperUser
      });
    } catch (error) {
      console.error("Get credits error:", error);
      res.status(500).json({ error: "Failed to get credits" });
    }
  });

  // ===== END USAGE GATE ENDPOINTS =====

  // Background analysis processor - runs in detached promise
  async function processAnalysisJob(jobId: number, platform: string, gender: string, intent: string, screenshots: string[], enm: boolean) {
    const startTime = Date.now();
    try {
      console.log(`[analyze-job:${jobId}] Starting background analysis for ${screenshots.length} photos`);
      
      await storage.updateProfileAnalysisStatus(jobId, 'processing');

      const enmContext = enm ? `
      IMPORTANT: This is an ENM (Ethical Non-Monogamy) / Polyamorous profile. The user may be married, partnered, or in existing relationships while seeking additional connections. This is normal and healthy in the ENM community. Do NOT suggest:
      - Removing mentions of being married or partnered
      - Hiding relationship status
      - Making the profile seem like they're single
      Instead, help them communicate their ENM status clearly and attract compatible matches who understand and appreciate ethical non-monogamy.` : '';

      const systemPrompt = `You are an expert dating profile consultant specializing in ${platform}. 
      The user is ${gender} looking for ${intent}.${enmContext}
      
      Analyze their profile screenshots and provide:
      1. An overall score from 1-100
      2. THREE complete, ready-to-use bio alternatives (not advice - write the actual bios they can copy/paste)
      3. Photo feedback (what works, what to change for each photo)
      4. Top 3 specific improvements to make
      
      Be constructive, specific, and actionable. Format your response as JSON with keys:
      overallScore (number), bioSuggestions (JSON array of 3 complete bio strings they can use directly), photoFeedback (string), improvements (JSON array of 3 improvement strings).`;

      // Compress all images aggressively
      console.log(`[analyze-job:${jobId}] Compressing ${screenshots.length} images (500px, 45% quality)...`);
      const compressedScreenshots = await Promise.all(
        screenshots.map((img: string) => compressImage(img, 500, 45))
      );
      console.log(`[analyze-job:${jobId}] Compression complete`);

      // Process images in batches
      const BATCH_SIZE = 4;
      const batches: string[][] = [];
      for (let i = 0; i < compressedScreenshots.length; i += BATCH_SIZE) {
        batches.push(compressedScreenshots.slice(i, i + BATCH_SIZE));
      }

      console.log(`[analyze-job:${jobId}] Processing ${batches.length} batch(es) of images`);

      // Analyze each batch and collect photo feedback
      const batchResults: string[] = [];
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchContent = batch.map((img: string) => ({
          type: "image_url" as const,
          image_url: { url: img }
        }));

        const batchPrompt = batches.length > 1 
          ? `Analyze photos ${i * BATCH_SIZE + 1}-${i * BATCH_SIZE + batch.length} of ${screenshots.length} total photos from this ${platform} dating profile. Provide specific feedback for each photo.`
          : `Please analyze this ${platform} dating profile for a ${gender} looking for ${intent}.${enm ? ' This is an ENM/Poly profile - keep that context in mind.' : ''}`;

        const batchResponse = await grok.chat.completions.create({
          model: "grok-4-1-fast-non-reasoning",
          messages: [
            { role: "system", content: batches.length > 1 
              ? "You are a dating profile expert. Analyze these profile photos and provide specific feedback. Format as JSON with: photoFeedback (string with numbered feedback for each photo)."
              : systemPrompt 
            },
            { role: "user", content: [
              { type: "text", text: batchPrompt },
              ...batchContent
            ]}
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: batches.length > 1 ? 512 : 2048,
        });

        const batchText = batchResponse.choices[0]?.message?.content || "{}";
        try {
          const batchAnalysis = JSON.parse(batchText);
          if (batches.length === 1) {
            batchResults.push(JSON.stringify(batchAnalysis));
          } else {
            batchResults.push(batchAnalysis.photoFeedback || batchText);
          }
        } catch {
          batchResults.push(batchText);
        }
        console.log(`[analyze-job:${jobId}] Batch ${i + 1}/${batches.length} complete`);
      }

      let analysis;
      if (batches.length === 1) {
        try {
          analysis = JSON.parse(batchResults[0]);
        } catch {
          analysis = { overallScore: 70, bioSuggestions: batchResults[0], photoFeedback: "", improvements: "" };
        }
      } else {
        const combinedFeedback = batchResults.join('\n\n');
        const synthesisResponse = await grok.chat.completions.create({
          model: "grok-4-1-fast-non-reasoning",
          messages: [
            { role: "system", content: `You are a dating profile expert. Based on the photo-by-photo feedback below, provide a comprehensive profile analysis. Format as JSON with: overallScore (1-100), bioSuggestions (JSON array of 3 complete ready-to-use bio strings they can copy/paste directly), photoFeedback (combined summary string), improvements (JSON array of 3 specific improvement strings).` },
            { role: "user", content: `This is a ${platform} profile for a ${gender} looking for ${intent}.${enm ? ' ENM/Poly profile.' : ''}\n\nPhoto feedback:\n${combinedFeedback}\n\nProvide the final analysis.` }
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 1024,
        });
        
        const synthesisText = synthesisResponse.choices[0]?.message?.content || "{}";
        try {
          analysis = JSON.parse(synthesisText);
          analysis.photoFeedback = combinedFeedback + '\n\n' + (analysis.photoFeedback || '');
        } catch {
          analysis = { overallScore: 70, bioSuggestions: synthesisText, photoFeedback: combinedFeedback, improvements: "" };
        }
      }

      console.log(`[analyze-job:${jobId}] Analysis completed in ${Date.now() - startTime}ms`);

      // Helper to normalize arrays - strip markdown, ensure clean JSON array string
      const normalizeToJsonArray = (data: any): string => {
        if (Array.isArray(data)) {
          return JSON.stringify(data);
        }
        if (typeof data === 'string') {
          // Strip markdown code block markers
          let cleaned = data.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed)) {
              return JSON.stringify(parsed);
            }
            // If it's an object with numeric keys, convert to array
            if (typeof parsed === 'object' && parsed !== null) {
              const values = Object.values(parsed);
              if (values.every(v => typeof v === 'string')) {
                return JSON.stringify(values);
              }
            }
          } catch {
            // Not JSON, split by newlines or keep as single item
            const lines = cleaned.split('\n').filter((l: string) => l.trim());
            if (lines.length > 1) {
              return JSON.stringify(lines.map((l: string) => l.replace(/^\d+\.\s*/, '').trim()));
            }
          }
          return JSON.stringify([cleaned]);
        }
        return JSON.stringify([]);
      };

      // Update the job with results - normalize arrays
      await storage.updateProfileAnalysisStatus(jobId, 'completed', {
        bioSuggestions: normalizeToJsonArray(analysis.bioSuggestions),
        photoFeedback: typeof analysis.photoFeedback === 'string' ? analysis.photoFeedback : JSON.stringify(analysis.photoFeedback),
        overallScore: analysis.overallScore,
        improvements: normalizeToJsonArray(analysis.improvements),
      });

    } catch (error: any) {
      console.error(`[analyze-job:${jobId}] Analysis failed:`, error?.message);
      await storage.updateProfileAnalysisStatus(jobId, 'failed', {
        errorMessage: error?.message || 'Unknown error occurred'
      });
    }
  }

  app.post("/api/analyze-profile", analysisLimiter, requireAuth, async (req: any, res) => {
    try {
      const parseResult = profileAnalysisSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: parseResult.error.flatten() 
        });
      }
      const { platform, gender, intent, screenshots, enm } = parseResult.data;
      const userId = req.session.userId;

      let isFreeAnalysis = false;
      const isSuperUser = await storage.isSuperUser(userId);
      const planTier = await storage.getPlanTier(userId);
      const credits = await storage.getCredits(userId);
      const isUnlimited = planTier === 'unlimited' || isSuperUser;
      const hasCredits = credits > 0;

      console.log(`[analyze-profile] Access check for user ${userId}: planTier=${planTier}, credits=${credits}, isUnlimited=${isUnlimited}`);

      if (!isUnlimited && !hasCredits) {
        isFreeAnalysis = true;
        console.log(`[analyze-profile] User ${userId} has no credits, providing free analysis with locked details`);
      }

      if (!isUnlimited && hasCredits && !isFreeAnalysis) {
        await storage.deductCredit(userId);
        console.log(`[analyze-profile] Deducted 1 credit from user ${userId}`);
      }

      const savedAnalysis = await storage.createProfileAnalysis({
        userId,
        platform,
        gender,
        intent,
        screenshots,
        analysisStatus: 'pending',
        enm: enm || false,
      });

      console.log(`[analyze-profile] Created job ${savedAnalysis.id} (poll: ${savedAnalysis.pollToken}) for user ${userId}, isFreeAnalysis=${isFreeAnalysis}`);

      processAnalysisJob(savedAnalysis.id, platform, gender, intent, screenshots, enm || false);

      res.json({
        jobId: savedAnalysis.pollToken,
        status: 'pending',
        isFreeAnalysis,
        message: 'Analysis started. Poll /api/analyze-profile/status/:jobId for results.'
      });

      await storage.updateLastActiveAt(userId);
    } catch (error: any) {
      console.error("Profile analysis job creation error:", {
        message: error?.message,
        stack: error?.stack?.slice(0, 500)
      });
      res.status(500).json({ 
        error: "Failed to start profile analysis",
        details: error?.message || "Unknown error"
      });
    }
  });

  app.get("/api/analyze-profile/status/:pollToken", requireAuth, async (req: any, res) => {
    try {
      const pollToken = req.params.pollToken;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(pollToken)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }

      const analysis = await storage.getProfileAnalysisByPollToken(pollToken);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      const userId = req.session.userId;
      if (analysis.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const status = (analysis as any).analysisStatus || 'completed';
      const errorMessage = (analysis as any).errorMessage;

      if (status === 'pending' || status === 'processing') {
        return res.json({
          jobId: pollToken,
          status,
          message: status === 'pending' ? 'Analysis queued' : 'Analysis in progress'
        });
      }

      if (status === 'failed') {
        return res.json({
          jobId: pollToken,
          status: 'failed',
          error: errorMessage || 'Analysis failed'
        });
      }

      const getFirstTip = (improvements: string | null): string => {
        if (!improvements) return "";
        
        try {
          const parsed = JSON.parse(improvements);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        } catch {
        }
        
        const lines = improvements.split('\n').filter((l: string) => l.trim());
        for (const line of lines) {
          const match = line.match(/^\d+\.\s*(.+)/);
          if (match) return match[1].trim();
          if (line.trim()) return line.trim();
        }
        return improvements.substring(0, 200);
      };

      const firstTip = getFirstTip(analysis.improvements);

      res.json({
        jobId: pollToken,
        status: 'completed',
        analysis: {
          id: analysis.id,
          platform: analysis.platform,
          overallScore: analysis.overallScore,
          bioSuggestions: analysis.bioSuggestions,
          photoFeedback: analysis.photoFeedback,
          improvements: analysis.improvements,
          firstTip,
        },
        isPaidUser: true
      });
    } catch (error: any) {
      console.error("Analysis status check error:", error?.message);
      res.status(500).json({ 
        error: "Failed to check analysis status",
        details: error?.message || "Unknown error"
      });
    }
  });

  // OCR endpoint to extract text from chat screenshots
  app.post("/api/ocr", analysisLimiter, requireAuth, async (req: any, res) => {
    try {
      const parseResult = ocrSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: parseResult.error.flatten() 
        });
      }
      const { screenshot } = parseResult.data;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract all text from this dating app chat screenshot. Format the conversation clearly, showing who said what if distinguishable. Return ONLY the extracted text, no additional commentary.`
              },
              {
                type: "image_url",
                image_url: { url: screenshot }
              }
            ]
          }
        ],
        max_tokens: 2000,
      });

      const extractedText = response.choices[0]?.message?.content || "";
      res.json({ text: extractedText });
    } catch (error) {
      console.error("OCR error:", error);
      res.status(500).json({ error: "Failed to extract text from image" });
    }
  });

  app.post("/api/analyze-reply", analysisLimiter, requireAuth, async (req: any, res) => {
    try {
      const parseResult = replyAnalysisSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: parseResult.error.flatten() 
        });
      }
      const { tone, goal, screenshots, conversationText, enm } = parseResult.data;
      const userId = req.session.userId;

      const planTier = await storage.getPlanTier(userId);
      const isSuperUser = await storage.isSuperUser(userId);
      const hasUnlimitedAccess = planTier === "unlimited" || isSuperUser;

      if (!hasUnlimitedAccess) {
        const deducted = await storage.deductCredit(userId);
        if (!deducted) {
          return res.status(402).json({
            error: "Subscription required",
            requiresSubscription: true
          });
        }
      }

      const hasScreenshots = screenshots && screenshots.length > 0;
      const hasText = conversationText && conversationText.trim().length > 0;

      const enmContext = enm ? `
      IMPORTANT: This is an ENM (Ethical Non-Monogamy) / Polyamorous conversation. The user may mention being married, partnered, or in existing relationships. This is normal and acceptable. Generate replies that:
      - Are comfortable and natural about ENM dynamics
      - Don't try to hide or minimize existing relationships
      - Appeal to people who understand ethical non-monogamy
      ` : '';

      const goalContextMap: Record<string, string> = {
        first_impression: "This is a first message/impression. Focus on making a memorable opener that stands out and invites a response.",
        keep_going: "The conversation is going well. Keep the momentum with engaging follow-ups that deepen the connection.",
        ask_out: "The goal is to smoothly transition to asking them out. Be confident but not pushy, and suggest a specific date idea.",
        revive: "This is a dead/stale conversation. Create a creative re-opener that acknowledges the gap and rekindles interest.",
      };
      const goalContext = goal ? `\n\nCONVERSATION GOAL: ${goalContextMap[goal] || ''}` : '';

      const systemPrompt = `You are an expert dating conversation coach. Analyze the conversation and generate 3 reply suggestions with a ${tone} tone.${enmContext}${goalContext}
      
      Consider:
      - The conversation flow and context
      - What makes messages engaging
      - How to keep the conversation going
      - Appropriate humor and wit
      
      Format your response as JSON with keys:
      conversationContext (brief summary of the conversation),
      suggestedReplies (array of 3 string replies, each different in approach but matching the ${tone} tone)`;

      let userContent: any[] = [];
      
      if (hasText) {
        userContent.push({
          type: "text" as const,
          text: `Generate ${tone} reply suggestions for this dating app conversation:\n\n"${conversationText}"`
        });
      } else {
        userContent.push({
          type: "text" as const,
          text: `Generate ${tone} reply suggestions for this dating app conversation.`
        });
      }
      
      if (hasScreenshots) {
        userContent.push(...screenshots.map((img: string) => ({
          type: "image_url" as const,
          image_url: { url: img }
        })));
      }

      const response = await grok.chat.completions.create({
        model: "grok-4-1-fast-non-reasoning",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
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
        screenshots: screenshots || [],
        suggestedReplies: analysis.suggestedReplies || [],
        conversationContext: analysis.conversationContext,
      });

      await storage.updateLastActiveAt(userId);

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
    const userId = req.session.userId;
    const profileAnalyses = await storage.getProfileAnalyses(userId);
    const replyAnalyses = await storage.getReplyAnalyses(userId);
    
    // All audit results are now accessible to all users
    res.json({ profileAnalyses, replyAnalyses });
  });

  // Profile analyses CRUD endpoints (for mobile app)
  // Schema for storing completed profile analysis results
  const storeProfileAnalysisSchema = z.object({
    platform: z.enum(["Tinder", "Hinge", "Bumble", "Grindr", "Coffee Meets Bagel", "Other"]),
    gender: z.enum(["Man", "Woman", "Non-binary"]),
    intent: z.enum(["Relationship", "Casual Dating", "Friendship", "Not Sure"]),
    screenshots: z.array(z.string().max(MAX_SCREENSHOT_SIZE)).min(1).max(MAX_SCREENSHOTS),
    bioSuggestions: z.string().nullable().optional(),
    photoFeedback: z.string().nullable().optional(),
    overallScore: z.number().int().min(0).max(100).nullable().optional(),
    improvements: z.string().nullable().optional(),
  });

  app.post("/api/analyses/profile", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const parseResult = storeProfileAnalysisSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: parseResult.error.flatten() 
        });
      }

      const { platform, gender, intent, screenshots, bioSuggestions, photoFeedback, overallScore, improvements } = parseResult.data;

      const analysis = await storage.createProfileAnalysis({
        userId,
        platform,
        gender,
        intent,
        screenshots,
        bioSuggestions: bioSuggestions ?? null,
        photoFeedback: photoFeedback ?? null,
        overallScore: overallScore ?? null,
        improvements: improvements ?? null,
      });

      res.status(201).json(analysis);
    } catch (error) {
      console.error("Create profile analysis error:", error);
      res.status(500).json({ error: "Failed to save profile analysis" });
    }
  });

  app.get("/api/analyses/profile", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const analyses = await storage.getProfileAnalyses(userId);
      
      // All audit results are now accessible to all users
      res.json(analyses);
    } catch (error) {
      console.error("Get profile analyses error:", error);
      res.status(500).json({ error: "Failed to retrieve profile analyses" });
    }
  });

  // Get single profile analysis by ID
  app.get("/api/analyses/profile/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const analysisId = parseInt(req.params.id, 10);
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: "Invalid analysis ID" });
      }

      const analysis = await storage.getProfileAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Ensure user owns this analysis
      if (analysis.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // All audit results are now accessible to all users
      res.json(analysis);
    } catch (error) {
      console.error("Get profile analysis error:", error);
      res.status(500).json({ error: "Failed to retrieve profile analysis" });
    }
  });

  // Reply analyses CRUD endpoints (for mobile app)
  // Schema for storing completed reply analysis results
  const storeReplyAnalysisSchema = z.object({
    tone: z.enum(["flirty", "witty", "confident", "thoughtful"]),
    screenshots: z.array(z.string().max(MAX_SCREENSHOT_SIZE)).max(3).optional().default([]),
    conversationText: z.string().max(5000).optional(),
    suggestedReplies: z.array(z.string()).nullable().optional(),
    conversationContext: z.string().nullable().optional(),
  }).refine(data => (data.screenshots && data.screenshots.length > 0) || (data.conversationText && data.conversationText.trim().length > 0), {
    message: "Either screenshots or conversation text is required"
  });

  app.post("/api/analyses/reply", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const parseResult = storeReplyAnalysisSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: parseResult.error.flatten() 
        });
      }

      const { tone, screenshots, conversationText, suggestedReplies, conversationContext } = parseResult.data;

      const analysis = await storage.createReplyAnalysis({
        userId,
        tone,
        screenshots: screenshots ?? [],
        suggestedReplies: suggestedReplies ?? [],
        conversationContext: conversationContext ?? conversationText ?? null,
      });

      res.status(201).json(analysis);
    } catch (error) {
      console.error("Create reply analysis error:", error);
      res.status(500).json({ error: "Failed to save reply analysis" });
    }
  });

  app.get("/api/analyses/reply", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const analyses = await storage.getReplyAnalyses(userId);
      
      // All audit results are now accessible to all users
      res.json(analyses);
    } catch (error) {
      console.error("Get reply analyses error:", error);
      res.status(500).json({ error: "Failed to retrieve reply analyses" });
    }
  });

  // Get single reply analysis by ID
  app.get("/api/analyses/reply/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const analysisId = parseInt(req.params.id, 10);
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: "Invalid analysis ID" });
      }

      const analysis = await storage.getReplyAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Ensure user owns this analysis
      if (analysis.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // All audit results are now accessible to all users
      res.json(analysis);
    } catch (error) {
      console.error("Get reply analysis error:", error);
      res.status(500).json({ error: "Failed to retrieve reply analysis" });
    }
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

  // Get Apple Client ID for Sign in with Apple
  app.get("/api/auth/apple-client-id", (req, res) => {
    const clientId = process.env.APPLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "Apple Sign In not configured" });
    }
    res.json({ clientId });
  });

  app.post("/api/stripe/sync", requireAdmin, async (req, res) => {
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

  app.get("/api/stripe/debug-prices", requireAdmin, async (req, res) => {
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
      const { priceId, returnTo } = parseResult.data;
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
      
      // Build success URL with optional returnTo parameter
      let successUrl = `${publicAppUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      if (returnTo) {
        successUrl += `&returnTo=${encodeURIComponent(returnTo)}`;
      }
      
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: isRecurring ? 'subscription' : 'payment',
        success_url: successUrl,
        cancel_url: `${publicAppUrl}/pricing`,
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
      
      // Atomic claim of checkout session - prevents race conditions with webhook
      const claimed = await storage.claimCheckoutSession(userId, sessionId);
      if (!claimed) {
        console.log(`Session ${sessionId} already processed for user ${userId}, returning current state`);
        const currentCredits = await storage.getCredits(userId);
        const currentTier = await storage.getPlanTier(userId);
        return res.json({ 
          success: true, 
          status: 'already_processed',
          alreadyProcessed: true,
          credits: currentCredits,
          planTier: currentTier
        });
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
        const currentTier = await storage.getPlanTier(userId);
        if (currentTier !== 'unlimited') {
          await storage.setPlanTier(userId, 'starter');
        }
        await storage.addCredits(userId, 1);
        await storage.addOneTimeCredits(userId, 1, 'purchased');
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
        
        await storage.setPlanTier(userId, 'unlimited');
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

  app.post("/api/ios/iap/transactions", requireAuth, async (req: any, res) => {
    try {
      const parseResult = iosIapSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parseResult.error.flatten(),
        });
      }

      const userId = req.session.userId;
      const requested = parseResult.data;
      const transaction = await fetchAppleTransaction(requested.transactionId);

      if (transaction.transactionId !== requested.transactionId) {
        return res.status(400).json({ error: "Apple transaction ID mismatch" });
      }
      validateAppleTransaction(transaction, requested.productId);
      if (!normalizedAppleAppAccountToken(transaction.appAccountToken)) {
        return res.status(400).json({ error: "Apple transaction is missing account token" });
      }
      if (!appleAppAccountTokenMatchesUser(transaction.appAccountToken, userId)) {
        return res.status(400).json({ error: "Apple account token mismatch" });
      }
      if (transaction.revocationDate) {
        return res.status(400).json({ error: "Apple transaction has been revoked" });
      }

      const result = await storage.applyAppleEntitlement({
        userId,
        transactionId: transaction.transactionId,
        originalTransactionId: transaction.originalTransactionId || null,
        productId: transaction.productId,
        environment: transaction.environment || "Unknown",
        purchaseDate: appleDate(transaction.purchaseDate),
        expiresDate: appleDate(transaction.expiresDate),
      });

      res.json({
        success: true,
        processed: result.processed,
        planTier: result.planTier,
        credits: result.credits,
      });
    } catch (error: any) {
      console.error("Apple IAP transaction sync error:", error);
      if (error instanceof AppleIapOwnershipError) {
        return res.status(409).json({ error: error.message });
      }
      if (error instanceof AppleIapValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error?.message || "Failed to sync Apple purchase" });
    }
  });

  app.post("/api/ios/iap/notifications", async (req: any, res) => {
    try {
      const parseResult = iosServerNotificationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid Apple notification",
          details: parseResult.error.flatten(),
        });
      }

      const notification = decodeAppleJwsPayload<AppleServerNotificationPayload>(parseResult.data.signedPayload);
      const signedTransactionInfo = notification.data?.signedTransactionInfo;
      if (!signedTransactionInfo) {
        return res.json({
          success: true,
          ignored: true,
          reason: "missing_signed_transaction_info",
          notificationType: notification.notificationType || null,
        });
      }

      const unverifiedTransaction = decodeAppleJwsPayload<AppleTransactionPayload>(signedTransactionInfo);
      if (!unverifiedTransaction.transactionId) {
        return res.json({
          success: true,
          ignored: true,
          reason: "missing_transaction_id",
          notificationType: notification.notificationType || null,
        });
      }

      const transaction = await fetchAppleTransaction(unverifiedTransaction.transactionId);
      validateAppleTransaction(transaction, undefined, { allowExpired: true });
      const action = classifyAppleNotification(notification.notificationType, transaction);

      if (action === "expired") {
        const resolution = await resolveAppleNotificationUser(transaction);
        if (resolution.accountTokenMismatch) {
          return res.json({
            success: true,
            processed: false,
            action: "account_token_mismatch",
            notificationType: notification.notificationType || null,
            subtype: notification.subtype || null,
            notificationUUID: notification.notificationUUID || null,
          });
        }

        const result = await storage.expireAppleEntitlement({
          userId: resolution.userId || null,
          transactionId: transaction.transactionId,
          originalTransactionId: transaction.originalTransactionId || null,
          productId: transaction.productId,
          expiresDate: appleDate(transaction.expiresDate),
          reason: transaction.revocationDate ? "revoked" : (notification.notificationType || "expired").toLowerCase(),
        });

        return res.json({
          success: true,
          processed: result.processed,
          action: "expired",
          notificationType: notification.notificationType || null,
          subtype: notification.subtype || null,
          notificationUUID: notification.notificationUUID || null,
        });
      }

      if (action === "renewed") {
        const resolution = await resolveAppleNotificationUser(transaction);
        const userId = resolution.userId;

        if (!userId) {
          return res.json({
            success: true,
            processed: false,
            action: "renewal_unmatched",
            notificationType: notification.notificationType || null,
            notificationUUID: notification.notificationUUID || null,
          });
        }

        if (resolution.accountTokenMismatch) {
          return res.json({
            success: true,
            processed: false,
            action: "account_token_mismatch",
            notificationType: notification.notificationType || null,
            subtype: notification.subtype || null,
            notificationUUID: notification.notificationUUID || null,
          });
        }

        const result = await storage.applyAppleEntitlement({
          userId,
          transactionId: transaction.transactionId,
          originalTransactionId: transaction.originalTransactionId || null,
          productId: transaction.productId,
          environment: transaction.environment || notification.data?.environment || "Unknown",
          purchaseDate: appleDate(transaction.purchaseDate),
          expiresDate: appleDate(transaction.expiresDate),
        });

        return res.json({
          success: true,
          processed: result.processed,
          action: "renewed",
          notificationType: notification.notificationType || null,
          subtype: notification.subtype || null,
          notificationUUID: notification.notificationUUID || null,
        });
      }

      res.json({
        success: true,
        processed: false,
        action: "acknowledged",
        notificationType: notification.notificationType || null,
        subtype: notification.subtype || null,
        notificationUUID: notification.notificationUUID || null,
      });
    } catch (error: any) {
      console.error("Apple IAP notification error:", error);
      if (error instanceof AppleIapOwnershipError) {
        return res.json({
          success: true,
          processed: false,
          action: "ownership_conflict",
          error: error.message,
        });
      }
      if (error instanceof AppleIapValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error?.message || "Failed to process Apple notification" });
    }
  });

  const adminLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts, please try again later" },
  });

  app.post("/api/admin/login", adminLoginLimiter, async (req: any, res) => {
    try {
      const parseResult = adminLoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid input" });
      }
      
      const { email, password } = parseResult.data;
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminEmail || !adminPassword) {
        return res.status(500).json({ error: "Admin credentials not configured" });
      }
      
      if (email !== adminEmail || password !== adminPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set admin flag directly without regenerating session
      req.session.isAdmin = true;
      req.session.save((saveErr: any) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
          return res.status(500).json({ error: "Authentication failed" });
        }
        console.log("[admin] Login successful, session saved");
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.post("/api/admin/logout", (req: any, res) => {
    req.session.isAdmin = false;
    res.json({ success: true });
  });

  app.get("/api/admin/check", (req: any, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
  });

  app.get("/api/admin/promo-codes", requireAdmin, async (req, res) => {
    const codes = await storage.listPromoCodes();
    res.json(codes);
  });

  app.post("/api/admin/promo-codes", requireAdmin, async (req, res) => {
    try {
      const { code, credits, maxRedemptions, expiresAt, isActive } = req.body;
      
      if (!code || typeof code !== 'string' || code.length < 3) {
        return res.status(400).json({ error: "Code must be at least 3 characters" });
      }
      
      const existing = await storage.getPromoCode(code);
      if (existing) {
        return res.status(400).json({ error: "Code already exists" });
      }
      
      const promo = await storage.createPromoCode({
        code,
        credits: credits || 3,
        maxRedemptions: maxRedemptions || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== false,
      });
      
      res.json(promo);
    } catch (error) {
      console.error("Create promo code error:", error);
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });

  app.patch("/api/admin/promo-codes/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const promo = await storage.updatePromoCode(id, { isActive });
      if (!promo) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      
      res.json(promo);
    } catch (error) {
      console.error("Update promo code error:", error);
      res.status(500).json({ error: "Failed to update promo code" });
    }
  });

  app.delete("/api/admin/promo-codes/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePromoCode(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete promo code error:", error);
      res.status(500).json({ error: "Failed to delete promo code" });
    }
  });

  app.get("/api/admin/user-stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ error: "Failed to get user statistics" });
    }
  });

  // Admin endpoint to toggle super user status
  app.post("/api/admin/toggle-super-user", requireAdmin, async (req, res) => {
    try {
      const { userId, isSuperUser } = req.body;
      if (!userId || typeof isSuperUser !== 'boolean') {
        return res.status(400).json({ error: "userId and isSuperUser (boolean) required" });
      }
      await storage.setSuperUser(userId, isSuperUser);
      console.log(`[admin] Set super user for ${userId}: ${isSuperUser}`);
      res.json({ success: true, userId, isSuperUser });
    } catch (error) {
      console.error("Toggle super user error:", error);
      res.status(500).json({ error: "Failed to toggle super user" });
    }
  });

  // Mobile app endpoint: GET /api/user/credits
  app.get("/api/user/credits", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const subscription = await storage.getUserSubscription(userId);
      const credits = subscription?.oneTimeCredits || 0;
      res.json({ credits });
    } catch (error) {
      console.error("Get credits error:", error);
      res.status(500).json({ error: "Failed to get credits" });
    }
  });

  // Mobile app endpoint: POST /api/promo/redeem
  app.post("/api/promo/redeem", requireAuth, async (req: any, res) => {
    try {
      const { code } = req.body;
      const userId = req.session?.userId || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: "Promo code required" });
      }
      
      const promo = await storage.getPromoCode(code.trim());
      
      if (!promo) {
        return res.status(404).json({ error: "Invalid promo code" });
      }
      
      if (!promo.isActive) {
        return res.status(400).json({ error: "This promo code is no longer active" });
      }
      
      if (promo.expiresAt && new Date() > promo.expiresAt) {
        return res.status(400).json({ error: "This promo code has expired" });
      }
      
      if (promo.maxRedemptions && promo.currentRedemptions >= promo.maxRedemptions) {
        return res.status(400).json({ error: "This promo code has reached its usage limit" });
      }
      
      const alreadyRedeemed = await storage.hasUserRedeemedCode(userId, promo.id);
      if (alreadyRedeemed) {
        return res.status(400).json({ error: "You have already used this promo code" });
      }
      
      await storage.addOneTimeCredits(userId, promo.credits, "promo");
      await storage.incrementPromoRedemptions(promo.id);
      await storage.createPromoRedemption(userId, promo.id);
      
      res.json({ 
        success: true, 
        credits: promo.credits,
        message: `You received ${promo.credits} free analyses!`
      });
    } catch (error) {
      console.error("Redeem promo error:", error);
      res.status(500).json({ error: "Failed to redeem promo code" });
    }
  });

  // Web app endpoint (kept for backwards compatibility)
  app.post("/api/redeem-promo", requireAuth, async (req: any, res) => {
    try {
      const { code } = req.body;
      const userId = req.session.userId;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: "Promo code required" });
      }
      
      const promo = await storage.getPromoCode(code.trim());
      
      if (!promo) {
        return res.status(404).json({ error: "Invalid promo code" });
      }
      
      if (!promo.isActive) {
        return res.status(400).json({ error: "This promo code is no longer active" });
      }
      
      if (promo.expiresAt && new Date() > promo.expiresAt) {
        return res.status(400).json({ error: "This promo code has expired" });
      }
      
      if (promo.maxRedemptions && promo.currentRedemptions >= promo.maxRedemptions) {
        return res.status(400).json({ error: "This promo code has reached its usage limit" });
      }
      
      const alreadyRedeemed = await storage.hasUserRedeemedCode(userId, promo.id);
      if (alreadyRedeemed) {
        return res.status(400).json({ error: "You have already used this promo code" });
      }
      
      await storage.addOneTimeCredits(userId, promo.credits);
      await storage.incrementPromoRedemptions(promo.id);
      await storage.createPromoRedemption(userId, promo.id);
      
      res.json({ 
        success: true, 
        credits: promo.credits,
        message: `You received ${promo.credits} free analyses!`
      });
    } catch (error) {
      console.error("Redeem promo error:", error);
      res.status(500).json({ error: "Failed to redeem promo code" });
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
