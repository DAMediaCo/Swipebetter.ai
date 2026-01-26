import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// analysisStatus values:
// - 'pending': Job submitted, waiting to process
// - 'processing': Currently being analyzed
// - 'completed': Analysis finished successfully
// - 'failed': Analysis failed with error
export const profileAnalyses = pgTable("profile_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  gender: text("gender").notNull(),
  intent: text("intent").notNull(),
  screenshots: text("screenshots").array().notNull(),
  bioSuggestions: text("bio_suggestions"),
  photoFeedback: text("photo_feedback"),
  overallScore: integer("overall_score"),
  improvements: text("improvements"),
  analysisStatus: text("analysis_status").default("completed"), // 'pending' | 'processing' | 'completed' | 'failed'
  errorMessage: text("error_message"),
  enm: boolean("enm").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const replyAnalyses = pgTable("reply_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  tone: text("tone").notNull(),
  screenshots: text("screenshots").array().notNull(),
  suggestedReplies: text("suggested_replies").array(),
  conversationContext: text("conversation_context"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// creditsSource tracks where credits came from:
// - "none": No credits granted
// - "purchased": Credits from a one-time purchase
// - "trial": Trial credits (legacy)
// - "promo": Credits from promo code redemption
// - "admin_grant": Manually granted by admin
// - "referral": Credits from referral program
// - "migration": Credits migrated from old system
// planTier values:
// - 'free': No paid access
// - 'starter': Has purchased one-time credits
// - 'unlimited': Has active monthly or annual subscription
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  plan: text("plan"),
  planType: text("plan_type"),
  status: text("status").default("inactive"),
  freeAnalysesUsed: integer("free_analyses_used").default(0),
  oneTimeCredits: integer("one_time_credits").default(0),
  creditsSource: text("credits_source").default("none"),
  lifetimeSpendCents: integer("lifetime_spend_cents").default(0),
  lastPaymentAt: timestamp("last_payment_at"),
  currentPeriodEnd: timestamp("current_period_end"),
  // New credit/subscription system fields
  planTier: text("plan_tier").default("free"), // 'free' | 'starter' | 'unlimited'
  credits: integer("credits").default(0), // Number of credits remaining
  reportsUnlocked: text("reports_unlocked").array().default([]), // Array of report IDs permanently unlocked
  lastCheckoutSessionId: text("last_checkout_session_id"), // Prevents double-crediting from same session
  isSuperUser: boolean("is_super_user").default(false), // Admin-granted 100% free access
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertProfileAnalysisSchema = createInsertSchema(profileAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertReplyAnalysisSchema = createInsertSchema(replyAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProfileAnalysis = typeof profileAnalyses.$inferSelect;
export type InsertProfileAnalysis = z.infer<typeof insertProfileAnalysisSchema>;
export type ReplyAnalysis = typeof replyAnalyses.$inferSelect;
export type InsertReplyAnalysis = z.infer<typeof insertReplyAnalysisSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  credits: integer("credits").notNull().default(3),
  maxRedemptions: integer("max_redemptions"),
  currentRedemptions: integer("current_redemptions").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const promoRedemptions = pgTable("promo_redemptions", {
  id: serial("id").primaryKey(),
  promoCodeId: integer("promo_code_id").notNull().references(() => promoCodes.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  redeemedAt: timestamp("redeemed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  currentRedemptions: true,
  createdAt: true,
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoRedemption = typeof promoRedemptions.$inferSelect;

export const archetypePages = pgTable("archetype_pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  archetypeId: varchar("archetype_id", { length: 50 }).notNull(),
  archetypeName: varchar("archetype_name", { length: 100 }).notNull(),
  archetypeDescription: text("archetype_description").notNull(),
  datingApp: varchar("dating_app", { length: 50 }).notNull(),
  metaTitle: varchar("meta_title", { length: 200 }).notNull(),
  metaDescription: text("meta_description").notNull(),
  examples: text("examples").notNull(),
  relatedPages: text("related_pages").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertArchetypePageSchema = createInsertSchema(archetypePages).omit({
  id: true,
  createdAt: true,
});

export type ArchetypePage = typeof archetypePages.$inferSelect;
export type InsertArchetypePage = z.infer<typeof insertArchetypePageSchema>;
