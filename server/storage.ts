import { eq, sql, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  profileAnalyses,
  replyAnalyses,
  userSubscriptions,
  promoCodes,
  promoRedemptions,
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

  getReplyAnalyses(userId: string): Promise<ReplyAnalysis[]>;
  createReplyAnalysis(data: InsertReplyAnalysis): Promise<ReplyAnalysis>;
  getReplyAnalysis(id: number): Promise<ReplyAnalysis | undefined>;

  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(data: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(userId: string, data: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  incrementFreeAnalysesUsed(userId: string): Promise<void>;
  addOneTimeCredits(userId: string, credits: number): Promise<void>;
  decrementOneTimeCredits(userId: string): Promise<void>;

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

  getAdminStats(): Promise<{
    totalUsers: number;
    freeUsers: number;
    paidUsers: number;
    freeCreditsUsers: number;
    userDetails: Array<{
      id: string;
      email: string;
      planType: string | null;
      status: string | null;
      priceId: string | null;
      amount: number | null;
      currency: string | null;
      oneTimeCredits: number | null;
      isPaid: boolean;
      hasFreeCredits: boolean;
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
    return analysis;
  }

  async getProfileAnalysis(id: number): Promise<ProfileAnalysis | undefined> {
    const [analysis] = await db.select().from(profileAnalyses).where(eq(profileAnalyses.id, id));
    return analysis;
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

  async addOneTimeCredits(userId: string, credits: number): Promise<void> {
    const existing = await this.getUserSubscription(userId);
    if (existing) {
      const currentCredits = existing.oneTimeCredits || 0;
      await db.update(userSubscriptions)
        .set({ 
          oneTimeCredits: currentCredits + credits,
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.userId, userId));
    } else {
      await this.createUserSubscription({ userId, oneTimeCredits: credits });
    }
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

  async getAdminStats(): Promise<{
    totalUsers: number;
    freeUsers: number;
    paidUsers: number;
    freeCreditsUsers: number;
    userDetails: Array<{
      id: string;
      email: string;
      planType: string | null;
      status: string | null;
      priceId: string | null;
      amount: number | null;
      currency: string | null;
      oneTimeCredits: number | null;
      isPaid: boolean;
      hasFreeCredits: boolean;
    }>;
  }> {
    // Get all subscriptions with user info
    const subsResult = await db.execute(
      sql`
        SELECT 
          u.id,
          u.email,
          us.plan_type,
          us.status,
          us.stripe_price_id,
          us.one_time_credits,
          p.unit_amount,
          p.currency
        FROM users u
        LEFT JOIN user_subscriptions us ON us.user_id = u.id
        LEFT JOIN stripe.prices p ON p.id = us.stripe_price_id
        ORDER BY u.created_at DESC
      `
    );

    const userDetails: Array<{
      id: string;
      email: string;
      planType: string | null;
      status: string | null;
      priceId: string | null;
      amount: number | null;
      currency: string | null;
      oneTimeCredits: number | null;
      isPaid: boolean;
      hasFreeCredits: boolean;
    }> = [];

    let paidUsers = 0;
    let freeCreditsUsers = 0;

    for (const row of subsResult.rows as any[]) {
      const hasActiveSubscription = row.status === 'active';
      const hasCredits = (row.one_time_credits || 0) > 0;
      const isPaid = hasActiveSubscription;
      const hasFreeCredits = hasCredits && !hasActiveSubscription;
      
      if (isPaid) {
        paidUsers++;
      } else if (hasFreeCredits) {
        freeCreditsUsers++;
      }
      
      userDetails.push({
        id: row.id,
        email: row.email,
        planType: row.plan_type,
        status: row.status,
        priceId: row.stripe_price_id,
        amount: row.unit_amount ? Number(row.unit_amount) : null,
        currency: row.currency,
        oneTimeCredits: row.one_time_credits,
        isPaid,
        hasFreeCredits,
      });
    }

    const totalUsers = userDetails.length;

    return {
      totalUsers,
      freeUsers: totalUsers - paidUsers - freeCreditsUsers,
      paidUsers,
      freeCreditsUsers,
      userDetails,
    };
  }
}

export const storage = new DatabaseStorage();
