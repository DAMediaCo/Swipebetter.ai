import { eq, sql, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  profileAnalyses,
  replyAnalyses,
  userSubscriptions,
  promoCodes,
  promoRedemptions,
  iosTransactions,
  type User,
  type ProfileAnalysis,
  type InsertProfileAnalysis,
  type ReplyAnalysis,
  type InsertReplyAnalysis,
  type UserSubscription,
  type InsertUserSubscription,
  type PromoCode,
  type InsertPromoCode,
  type PromoRedemption,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;

  getProfileAnalyses(userId: string): Promise<ProfileAnalysis[]>;
  createProfileAnalysis(data: InsertProfileAnalysis): Promise<ProfileAnalysis>;
  getProfileAnalysis(id: number): Promise<ProfileAnalysis | undefined>;
  getProfileAnalysisByPollToken(pollToken: string): Promise<ProfileAnalysis | undefined>;
  updateProfileAnalysisStatus(id: number, status: string, result?: { bioSuggestions?: string; photoFeedback?: string; overallScore?: number; improvements?: string; errorMessage?: string }): Promise<void>;
  cleanupOldProfileAnalyses(userId: string, keepCount: number): Promise<void>;

  getReplyAnalyses(userId: string): Promise<ReplyAnalysis[]>;
  createReplyAnalysis(data: InsertReplyAnalysis): Promise<ReplyAnalysis>;
  getReplyAnalysis(id: number): Promise<ReplyAnalysis | undefined>;

  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(data: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(userId: string, data: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  incrementFreeAnalysesUsed(userId: string): Promise<void>;
  addOneTimeCredits(userId: string, credits: number, source?: string): Promise<void>;
  decrementOneTimeCredits(userId: string): Promise<void>;
  updateLastActiveAt(userId: string): Promise<void>;

  getStripeProduct(productId: string): Promise<any>;
  listProducts(active?: boolean): Promise<any[]>;
  listProductsWithPrices(active?: boolean): Promise<any[]>;
  getPrice(priceId: string): Promise<any>;
  listPrices(active?: boolean): Promise<any[]>;
  getPricesForProduct(productId: string): Promise<any[]>;
  getSubscription(subscriptionId: string): Promise<any>;
  updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<UserSubscription | undefined>;

  getPromoCode(code: string): Promise<PromoCode | undefined>;
  getPromoCodeById(id: number): Promise<PromoCode | undefined>;
  listPromoCodes(): Promise<PromoCode[]>;
  createPromoCode(data: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, data: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<void>;
  incrementPromoRedemptions(id: number): Promise<void>;
  hasUserRedeemedCode(userId: string, promoCodeId: number): Promise<boolean>;
  createPromoRedemption(userId: string, promoCodeId: number): Promise<PromoRedemption>;

  // Credit & Subscription System
  getPlanTier(userId: string): Promise<'free' | 'starter' | 'unlimited'>;
  getCredits(userId: string): Promise<number>;
  addCredits(userId: string, amount: number): Promise<void>;
  deductCredit(userId: string): Promise<boolean>;
  setPlanTier(userId: string, tier: 'free' | 'starter' | 'unlimited'): Promise<void>;
  isReportUnlocked(userId: string, reportId: string): Promise<boolean>;
  unlockReport(userId: string, reportId: string): Promise<void>;
  unlockReportWithCredit(userId: string, reportId: string): Promise<{ success: boolean; creditsRemaining: number }>;
  getUnlockedReports(userId: string): Promise<string[]>;
  claimCheckoutSession(userId: string, sessionId: string): Promise<boolean>;
  applyAppleEntitlement(data: {
    userId: string;
    transactionId: string;
    originalTransactionId?: string | null;
    productId: string;
    environment: string;
    purchaseDate?: Date | null;
    expiresDate?: Date | null;
  }): Promise<{ processed: boolean; planTier: 'free' | 'starter' | 'unlimited'; credits: number }>;
  
  // Super User (admin-granted free access)
  isSuperUser(userId: string): Promise<boolean>;
  setSuperUser(userId: string, isSuperUser: boolean): Promise<void>;

  // billingStatus: derived status for billing classification
  // - subscription: has active subscription in Stripe
  // - one_time: has at least one successful payment but no active subscription
  // - refunded: last transaction is a full refund
  // - chargeback: any dispute/chargeback flag
  // - trial: lifetimeSpendCents == 0 AND creditsSource == "trial"
  // - comped: lifetimeSpendCents == 0 AND creditsRemaining > 0 AND creditsSource in ["admin_grant","promo","referral","migration"]
  // - free: lifetimeSpendCents == 0 AND creditsRemaining == 0
  getAdminStats(): Promise<{
    totalUsers: number;
    stats: {
      revenueUsers: number;
      compedUsers: number;
      neverConverted: number;
      activeLast7Days: number;
      hasCredits: number;
      newUsers: number;
    };
    userDetails: Array<{
      id: string;
      email: string;
      createdAt: string;
      lastActiveAt: string | null;
      billingStatus: 'subscription' | 'one_time' | 'refunded' | 'chargeback' | 'trial' | 'comped' | 'free';
      creditsSource: string;
      creditsTotal: number;
      creditsUsed: number;
      creditsRemaining: number;
      lifetimeSpendCents: number;
      lastPaymentAt: string | null;
      userState: 'New User' | 'Active Today' | 'Active This Week' | 'Dormant 7+ Days' | 'Dormant 30+ Days' | 'Never Used';
    }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getProfileAnalyses(userId: string): Promise<ProfileAnalysis[]> {
    return db.select().from(profileAnalyses).where(eq(profileAnalyses.userId, userId)).orderBy(desc(profileAnalyses.createdAt));
  }

  async createProfileAnalysis(data: InsertProfileAnalysis): Promise<ProfileAnalysis> {
    const [analysis] = await db.insert(profileAnalyses).values(data).returning();
    
    // Keep only the last 10 analyses per user
    if (data.userId) {
      await this.cleanupOldProfileAnalyses(data.userId, 10);
    }
    
    return analysis;
  }

  async cleanupOldProfileAnalyses(userId: string, keepCount: number): Promise<void> {
    // Get all analysis IDs for this user, ordered by newest first
    const allAnalyses = await db.select({ id: profileAnalyses.id })
      .from(profileAnalyses)
      .where(eq(profileAnalyses.userId, userId))
      .orderBy(desc(profileAnalyses.createdAt));
    
    // If we have more than keepCount, delete the extras
    if (allAnalyses.length > keepCount) {
      const idsToDelete = allAnalyses.slice(keepCount).map(a => a.id);
      for (const id of idsToDelete) {
        await db.delete(profileAnalyses).where(eq(profileAnalyses.id, id));
      }
    }
  }

  async getProfileAnalysis(id: number): Promise<ProfileAnalysis | undefined> {
    const [analysis] = await db.select().from(profileAnalyses).where(eq(profileAnalyses.id, id));
    return analysis;
  }

  async getProfileAnalysisByPollToken(pollToken: string): Promise<ProfileAnalysis | undefined> {
    const [analysis] = await db.select().from(profileAnalyses).where(eq(profileAnalyses.pollToken, pollToken));
    return analysis;
  }

  async updateProfileAnalysisStatus(id: number, status: string, result?: { bioSuggestions?: string; photoFeedback?: string; overallScore?: number; improvements?: string; errorMessage?: string }): Promise<void> {
    const updateData: any = { analysisStatus: status };
    if (result) {
      if (result.bioSuggestions !== undefined) updateData.bioSuggestions = result.bioSuggestions;
      if (result.photoFeedback !== undefined) updateData.photoFeedback = result.photoFeedback;
      if (result.overallScore !== undefined) updateData.overallScore = result.overallScore;
      if (result.improvements !== undefined) updateData.improvements = result.improvements;
      if (result.errorMessage !== undefined) updateData.errorMessage = result.errorMessage;
    }
    await db.update(profileAnalyses).set(updateData).where(eq(profileAnalyses.id, id));
  }

  async getReplyAnalyses(userId: string): Promise<ReplyAnalysis[]> {
    return db.select().from(replyAnalyses).where(eq(replyAnalyses.userId, userId)).orderBy(desc(replyAnalyses.createdAt));
  }

  async createReplyAnalysis(data: InsertReplyAnalysis): Promise<ReplyAnalysis> {
    const [analysis] = await db.insert(replyAnalyses).values(data).returning();
    return analysis;
  }

  async getReplyAnalysis(id: number): Promise<ReplyAnalysis | undefined> {
    const [analysis] = await db.select().from(replyAnalyses).where(eq(replyAnalyses.id, id));
    return analysis;
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId));
    return subscription;
  }

  async createUserSubscription(data: InsertUserSubscription): Promise<UserSubscription> {
    const [subscription] = await db.insert(userSubscriptions).values(data).returning();
    return subscription;
  }

  async updateUserSubscription(userId: string, data: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const [subscription] = await db.update(userSubscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userSubscriptions.userId, userId))
      .returning();
    return subscription;
  }

  async incrementFreeAnalysesUsed(userId: string): Promise<void> {
    await db.update(userSubscriptions)
      .set({ 
        freeAnalysesUsed: sql`${userSubscriptions.freeAnalysesUsed} + 1`,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.userId, userId));
  }

  async addOneTimeCredits(userId: string, credits: number, source: string = 'promo'): Promise<void> {
    const existing = await this.getUserSubscription(userId);
    if (existing) {
      const currentCredits = existing.oneTimeCredits || 0;
      await db.update(userSubscriptions)
        .set({ 
          oneTimeCredits: currentCredits + credits,
          creditsSource: source,
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.userId, userId));
    } else {
      await this.createUserSubscription({ userId, oneTimeCredits: credits, creditsSource: source });
    }
  }

  async updateLastActiveAt(userId: string): Promise<void> {
    await db.update(users)
      .set({ lastActiveAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async decrementOneTimeCredits(userId: string): Promise<void> {
    const existing = await this.getUserSubscription(userId);
    if (existing && (existing.oneTimeCredits || 0) > 0) {
      await db.update(userSubscriptions)
        .set({ 
          oneTimeCredits: Math.max((existing.oneTimeCredits || 0) - 1, 0),
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.userId, userId));
    }
  }

  async getStripeProduct(productId: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async listProducts(active = true): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = ${active}`
    );
    return result.rows;
  }

  async listProductsWithPrices(active = true): Promise<any[]> {
    const result = await db.execute(
      sql`
        WITH paginated_products AS (
          SELECT id, name, description, metadata, active
          FROM stripe.products
          WHERE active = ${active}
          ORDER BY id
        )
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.active as price_active,
          pr.metadata as price_metadata
        FROM paginated_products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        ORDER BY p.id, pr.unit_amount
      `
    );
    return result.rows;
  }

  async getPrice(priceId: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE id = ${priceId}`
    );
    return result.rows[0] || null;
  }

  async listPrices(active = true): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE active = ${active}`
    );
    return result.rows;
  }

  async getPricesForProduct(productId: string): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE product = ${productId} AND active = true`
    );
    return result.rows;
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<UserSubscription | undefined> {
    const existing = await this.getUserSubscription(userId);
    if (existing) {
      return this.updateUserSubscription(userId, stripeInfo);
    } else {
      return this.createUserSubscription({
        userId,
        stripeCustomerId: stripeInfo.stripeCustomerId,
        stripeSubscriptionId: stripeInfo.stripeSubscriptionId,
      });
    }
  }

  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase()));
    return promo;
  }

  async getPromoCodeById(id: number): Promise<PromoCode | undefined> {
    const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.id, id));
    return promo;
  }

  async listPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async createPromoCode(data: InsertPromoCode): Promise<PromoCode> {
    const [promo] = await db.insert(promoCodes).values({
      ...data,
      code: data.code.toUpperCase(),
    }).returning();
    return promo;
  }

  async updatePromoCode(id: number, data: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const updateData = data.code ? { ...data, code: data.code.toUpperCase() } : data;
    const [promo] = await db.update(promoCodes)
      .set(updateData)
      .where(eq(promoCodes.id, id))
      .returning();
    return promo;
  }

  async deletePromoCode(id: number): Promise<void> {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
  }

  async incrementPromoRedemptions(id: number): Promise<void> {
    await db.update(promoCodes)
      .set({ currentRedemptions: sql`${promoCodes.currentRedemptions} + 1` })
      .where(eq(promoCodes.id, id));
  }

  async hasUserRedeemedCode(userId: string, promoCodeId: number): Promise<boolean> {
    const [redemption] = await db.select()
      .from(promoRedemptions)
      .where(sql`${promoRedemptions.userId} = ${userId} AND ${promoRedemptions.promoCodeId} = ${promoCodeId}`);
    return !!redemption;
  }

  async createPromoRedemption(userId: string, promoCodeId: number): Promise<PromoRedemption> {
    const [redemption] = await db.insert(promoRedemptions).values({
      userId,
      promoCodeId,
    }).returning();
    return redemption;
  }

  // Credit & Subscription System Methods
  async getPlanTier(userId: string): Promise<'free' | 'starter' | 'unlimited'> {
    const sub = await this.getUserSubscription(userId);
    if (!sub) return 'free';
    const tier = (sub as any).planTier;
    if (tier === 'unlimited' || tier === 'starter') return tier;
    return 'free';
  }

  async getCredits(userId: string): Promise<number> {
    const sub = await this.getUserSubscription(userId);
    if (!sub) return 0;
    return (sub as any).credits || 0;
  }

  async addCredits(userId: string, amount: number): Promise<void> {
    const existing = await this.getUserSubscription(userId);
    if (existing) {
      const currentCredits = (existing as any).credits || 0;
      await db.update(userSubscriptions)
        .set({ 
          credits: currentCredits + amount,
          updatedAt: new Date()
        } as any)
        .where(eq(userSubscriptions.userId, userId));
    } else {
      await db.insert(userSubscriptions).values({
        userId,
        credits: amount,
        planTier: 'starter',
      } as any);
    }
  }

  async deductCredit(userId: string): Promise<boolean> {
    // Atomic credit deduction - only deducts if credits > 0
    const result = await db.execute(
      sql`UPDATE user_subscriptions 
          SET credits = credits - 1, updated_at = NOW()
          WHERE user_id = ${userId} AND credits > 0
          RETURNING credits`
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  async setPlanTier(userId: string, tier: 'free' | 'starter' | 'unlimited'): Promise<void> {
    const existing = await this.getUserSubscription(userId);
    if (existing) {
      await db.update(userSubscriptions)
        .set({ 
          planTier: tier,
          updatedAt: new Date()
        } as any)
        .where(eq(userSubscriptions.userId, userId));
    } else {
      await db.insert(userSubscriptions).values({
        userId,
        planTier: tier,
      } as any);
    }
  }

  async isReportUnlocked(userId: string, reportId: string): Promise<boolean> {
    const sub = await this.getUserSubscription(userId);
    if (!sub) return false;
    const unlocked = (sub as any).reportsUnlocked || [];
    return unlocked.includes(reportId);
  }

  async unlockReport(userId: string, reportId: string): Promise<void> {
    // Atomic report unlock using array_append
    await db.execute(
      sql`UPDATE user_subscriptions 
          SET reports_unlocked = array_append(COALESCE(reports_unlocked, '{}'), ${reportId}),
              updated_at = NOW()
          WHERE user_id = ${userId} 
          AND NOT (${reportId} = ANY(COALESCE(reports_unlocked, '{}')))`
    );
  }

  // Atomic unlock report with credit deduction (single transaction)
  async unlockReportWithCredit(userId: string, reportId: string): Promise<{ success: boolean; creditsRemaining: number }> {
    // Single atomic SQL that deducts credit AND unlocks report
    const result = await db.execute(
      sql`UPDATE user_subscriptions 
          SET credits = credits - 1,
              reports_unlocked = array_append(COALESCE(reports_unlocked, '{}'), ${reportId}),
              updated_at = NOW()
          WHERE user_id = ${userId} 
          AND credits > 0
          AND NOT (${reportId} = ANY(COALESCE(reports_unlocked, '{}')))
          RETURNING credits`
    );
    
    if (result.rowCount !== null && result.rowCount > 0) {
      const remaining = (result.rows[0] as any).credits;
      return { success: true, creditsRemaining: remaining };
    }
    
    // Check if already unlocked
    const isUnlocked = await this.isReportUnlocked(userId, reportId);
    if (isUnlocked) {
      const credits = await this.getCredits(userId);
      return { success: true, creditsRemaining: credits };
    }
    
    return { success: false, creditsRemaining: 0 };
  }

  async getUnlockedReports(userId: string): Promise<string[]> {
    const sub = await this.getUserSubscription(userId);
    if (!sub) return [];
    return (sub as any).reportsUnlocked || [];
  }

  // Atomic claim of checkout session - returns true if claimed, false if already processed
  async claimCheckoutSession(userId: string, sessionId: string): Promise<boolean> {
    // Atomic update: only set session ID if it's not already this session ID
    // This uses a conditional WHERE to prevent race conditions
    const result = await db.execute(
      sql`UPDATE user_subscriptions 
          SET last_checkout_session_id = ${sessionId},
              updated_at = NOW()
          WHERE user_id = ${userId} 
          AND (last_checkout_session_id IS NULL OR last_checkout_session_id != ${sessionId})
          RETURNING id`
    );
    
    return result.rowCount !== null && result.rowCount > 0;
  }

  async applyAppleEntitlement(data: {
    userId: string;
    transactionId: string;
    originalTransactionId?: string | null;
    productId: string;
    environment: string;
    purchaseDate?: Date | null;
    expiresDate?: Date | null;
  }): Promise<{ processed: boolean; planTier: 'free' | 'starter' | 'unlimited'; credits: number }> {
    const productConfig: Record<string, { tier: 'starter' | 'unlimited'; credits: number; planType: string; priceCents: number }> = {
      "ai.swipebetter.starter": { tier: "starter", credits: 1, planType: "starter", priceCents: 399 },
      "ai.swipebetter.unlimited.monthly": { tier: "unlimited", credits: 0, planType: "monthly", priceCents: 1699 },
      "ai.swipebetter.unlimited.annual": { tier: "unlimited", credits: 0, planType: "annual", priceCents: 10499 },
    };
    const config = productConfig[data.productId];
    if (!config) {
      throw new Error(`Unsupported Apple product ID: ${data.productId}`);
    }

    return db.transaction(async (tx) => {
      const [inserted] = await tx.insert(iosTransactions).values({
        userId: data.userId,
        transactionId: data.transactionId,
        originalTransactionId: data.originalTransactionId || null,
        productId: data.productId,
        environment: data.environment,
        purchaseDate: data.purchaseDate || null,
        expiresDate: data.expiresDate || null,
      }).onConflictDoNothing({ target: iosTransactions.transactionId }).returning();

      if (!inserted) {
        const [existing] = await tx.select().from(userSubscriptions).where(eq(userSubscriptions.userId, data.userId));
        return {
          processed: false,
          planTier: ((existing as any)?.planTier || "free") as 'free' | 'starter' | 'unlimited',
          credits: (existing as any)?.credits || 0,
        };
      }

      const [existing] = await tx.select().from(userSubscriptions).where(eq(userSubscriptions.userId, data.userId));
      const currentCredits = (existing as any)?.credits || 0;
      const currentSpend = (existing as any)?.lifetimeSpendCents || 0;
      const patch = config.tier === "unlimited"
        ? {
            planTier: "unlimited",
            plan: "ios_unlimited",
            planType: config.planType,
            status: "active",
            creditsSource: "purchased",
            lifetimeSpendCents: currentSpend + config.priceCents,
            lastPaymentAt: data.purchaseDate || new Date(),
            currentPeriodEnd: data.expiresDate || null,
            updatedAt: new Date(),
          }
        : {
            planTier: "starter",
            plan: "ios_starter",
            planType: "starter",
            status: "active",
            credits: currentCredits + config.credits,
            creditsSource: "purchased",
            lifetimeSpendCents: currentSpend + config.priceCents,
            lastPaymentAt: data.purchaseDate || new Date(),
            updatedAt: new Date(),
          };

      if (existing) {
        await tx.update(userSubscriptions)
          .set(patch as any)
          .where(eq(userSubscriptions.userId, data.userId));
      } else {
        await tx.insert(userSubscriptions).values({
          userId: data.userId,
          ...(patch as any),
        });
      }

      const [updated] = await tx.select().from(userSubscriptions).where(eq(userSubscriptions.userId, data.userId));
      return {
        processed: true,
        planTier: ((updated as any)?.planTier || "free") as 'free' | 'starter' | 'unlimited',
        credits: (updated as any)?.credits || 0,
      };
    });
  }

  async isSuperUser(userId: string): Promise<boolean> {
    const sub = await this.getUserSubscription(userId);
    if (!sub) {
      return false;
    }
    const superUserValue = (sub as any).isSuperUser;
    return superUserValue === true || superUserValue === 't' || superUserValue === 1 || superUserValue === 'true';
  }

  async setSuperUser(userId: string, isSuperUser: boolean): Promise<void> {
    const existing = await this.getUserSubscription(userId);
    if (existing) {
      await db.update(userSubscriptions)
        .set({ isSuperUser, updatedAt: new Date() })
        .where(eq(userSubscriptions.userId, userId));
    } else {
      await db.insert(userSubscriptions).values({
        userId,
        isSuperUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    stats: {
      revenueUsers: number;
      compedUsers: number;
      neverConverted: number;
      activeLast7Days: number;
      hasCredits: number;
      newUsers: number;
    };
    userDetails: Array<{
      id: string;
      email: string;
      createdAt: string;
      lastActiveAt: string | null;
      billingStatus: 'subscription' | 'one_time' | 'refunded' | 'chargeback' | 'trial' | 'comped' | 'free';
      creditsSource: string;
      creditsTotal: number;
      creditsUsed: number;
      creditsRemaining: number;
      lifetimeSpendCents: number;
      lastPaymentAt: string | null;
      userState: 'New User' | 'Active Today' | 'Active This Week' | 'Dormant 7+ Days' | 'Dormant 30+ Days' | 'Never Used';
    }>;
  }> {
    // Get all users with subscription info and analysis counts
    const result = await db.execute(
      sql`
        SELECT 
          u.id,
          u.email,
          u.created_at,
          u.last_active_at,
          us.status,
          us.one_time_credits,
          us.credits_source,
          us.lifetime_spend_cents,
          us.last_payment_at,
          us.free_analyses_used,
          COALESCE((SELECT COUNT(*) FROM profile_analyses pa WHERE pa.user_id = u.id), 0) as profile_count,
          COALESCE((SELECT COUNT(*) FROM reply_analyses ra WHERE ra.user_id = u.id), 0) as reply_count
        FROM users u
        LEFT JOIN user_subscriptions us ON us.user_id = u.id
        ORDER BY u.created_at DESC
      `
    );

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    type UserDetail = {
      id: string;
      email: string;
      createdAt: string;
      lastActiveAt: string | null;
      billingStatus: 'subscription' | 'one_time' | 'refunded' | 'chargeback' | 'trial' | 'comped' | 'free';
      creditsSource: string;
      creditsTotal: number;
      creditsUsed: number;
      creditsRemaining: number;
      lifetimeSpendCents: number;
      lastPaymentAt: string | null;
      userState: 'New User' | 'Active Today' | 'Active This Week' | 'Dormant 7+ Days' | 'Dormant 30+ Days' | 'Never Used';
    };

    const userDetails: UserDetail[] = [];
    let revenueUsers = 0;
    let compedUsers = 0;
    let neverConverted = 0;
    let activeLast7Days = 0;
    let hasCreditsCount = 0;
    let newUsers = 0;

    for (const row of result.rows as any[]) {
      const createdAt = new Date(row.created_at);
      const lastActiveAt = row.last_active_at ? new Date(row.last_active_at) : null;
      const creditsUsed = Number(row.profile_count || 0) + Number(row.reply_count || 0);
      const creditsTotal = (row.one_time_credits || 0) + creditsUsed;
      const creditsRemaining = row.one_time_credits || 0;
      const lifetimeSpendCents = row.lifetime_spend_cents || 0;
      const creditsSource = row.credits_source || 'none';
      const hasActiveSubscription = row.status === 'active';
      
      // Compute billingStatus
      let billingStatus: UserDetail['billingStatus'];
      if (hasActiveSubscription) {
        billingStatus = 'subscription';
      } else if (lifetimeSpendCents > 0) {
        billingStatus = 'one_time';
      } else if (creditsSource === 'trial') {
        billingStatus = 'trial';
      } else if (creditsRemaining > 0 && ['admin_grant', 'promo', 'referral', 'migration'].includes(creditsSource)) {
        billingStatus = 'comped';
      } else {
        billingStatus = 'free';
      }
      
      // Compute userState based on createdAt, lastActiveAt, creditsUsed
      let userState: UserDetail['userState'];
      const isNewUser = createdAt > oneDayAgo;
      
      if (isNewUser && !lastActiveAt && creditsUsed === 0) {
        userState = 'New User';
      } else if (lastActiveAt) {
        const today = new Date();
        const isSameDay = lastActiveAt.toDateString() === today.toDateString();
        if (isSameDay) {
          userState = 'Active Today';
        } else if (lastActiveAt > sevenDaysAgo) {
          userState = 'Active This Week';
        } else if (lastActiveAt > thirtyDaysAgo) {
          userState = 'Dormant 7+ Days';
        } else {
          userState = 'Dormant 30+ Days';
        }
      } else if (creditsUsed === 0 && !isNewUser) {
        userState = 'Never Used';
      } else {
        userState = 'Never Used';
      }
      
      // Count stats
      // Revenue users are those with active subscriptions or one-time payments
      const isRevenueUser = billingStatus === 'subscription' || billingStatus === 'one_time';
      if (isRevenueUser) {
        revenueUsers++;
      }
      // Comped users have free credits from promo/admin/referral sources
      if (billingStatus === 'comped' || ['promo', 'admin_grant', 'referral', 'migration'].includes(creditsSource)) {
        compedUsers++;
      }
      // Never converted: users who haven't paid AND don't have active subscriptions
      // This excludes revenue users since they have "converted" even if lifetimeSpendCents isn't populated yet
      if (!isRevenueUser && lifetimeSpendCents === 0) {
        neverConverted++;
      }
      if (lastActiveAt && lastActiveAt > sevenDaysAgo) {
        activeLast7Days++;
      }
      if (creditsRemaining > 0) {
        hasCreditsCount++;
      }
      if (isNewUser) {
        newUsers++;
      }
      
      userDetails.push({
        id: row.id,
        email: row.email,
        createdAt: createdAt.toISOString(),
        lastActiveAt: lastActiveAt ? lastActiveAt.toISOString() : null,
        billingStatus,
        creditsSource,
        creditsTotal,
        creditsUsed,
        creditsRemaining,
        lifetimeSpendCents,
        lastPaymentAt: row.last_payment_at ? new Date(row.last_payment_at).toISOString() : null,
        userState,
      });
    }

    return {
      totalUsers: userDetails.length,
      stats: {
        revenueUsers,
        compedUsers,
        neverConverted,
        activeLast7Days,
        hasCredits: hasCreditsCount,
        newUsers,
      },
      userDetails,
    };
  }
}

export const storage = new DatabaseStorage();
