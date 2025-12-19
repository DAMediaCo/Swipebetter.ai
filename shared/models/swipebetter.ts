import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

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

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan"),
  status: text("status").default("inactive"),
  freeAnalysesUsed: integer("free_analyses_used").default(0),
  currentPeriodEnd: timestamp("current_period_end"),
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
