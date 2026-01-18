import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import crypto from "crypto";
import { db } from "./db";
import { users, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, passwordResetTokens, type SafeUser } from "@shared/models/auth";
import { userSubscriptions, promoCodes, promoRedemptions } from "@shared/models/swipebetter";
import { eq, and, sql, or, gt } from "drizzle-orm";
import type { Express, RequestHandler } from "express";
import { signToken } from "./jwt";
import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";
import { sendPasswordResetEmail } from "./email";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const SALT_ROUNDS = 12;

export function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: sessionTtl,
      },
    })
  );
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function sanitizeUser(user: typeof users.$inferSelect): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function registerAuthRoutes(app: Express) {
  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId))
        .limit(1);

      if (!user) {
        return res.json({ user: null });
      }

      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json({ user: null });
    }
  });

  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: parsed.error.errors[0]?.message || "Invalid input" 
        });
      }

      const { email, password, firstName, lastName, promoCode } = parsed.data;

      // Check if user exists
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Validate promo code if provided
      let validPromoCode = null;
      if (promoCode && promoCode.trim()) {
        const [code] = await db
          .select()
          .from(promoCodes)
          .where(and(
            eq(promoCodes.code, promoCode.trim().toUpperCase()),
            eq(promoCodes.isActive, true)
          ))
          .limit(1);

        if (code) {
          const now = new Date();
          const notExpired = !code.expiresAt || new Date(code.expiresAt) > now;
          const hasCapacity = !code.maxRedemptions || code.currentRedemptions < code.maxRedemptions;
          
          if (notExpired && hasCapacity) {
            validPromoCode = code;
          }
        }
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          passwordHash,
          firstName: firstName || null,
          lastName: lastName || null,
        })
        .returning();

      // Create subscription record with credits from promo code
      const oneTimeCredits = validPromoCode ? validPromoCode.credits : 0;
      await db.insert(userSubscriptions).values({
        userId: newUser.id,
        freeAnalysesUsed: 0,
        status: "inactive",
        oneTimeCredits,
      });

      // Record promo code redemption if used
      if (validPromoCode) {
        await db.insert(promoRedemptions).values({
          promoCodeId: validPromoCode.id,
          userId: newUser.id,
        });
        await db
          .update(promoCodes)
          .set({ currentRedemptions: sql`${promoCodes.currentRedemptions} + 1` })
          .where(eq(promoCodes.id, validPromoCode.id));
      }

      // Set session
      req.session.userId = newUser.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
        res.json({ 
          user: sanitizeUser(newUser),
          promoApplied: !!validPromoCode,
          promoCredits: validPromoCode ? validPromoCode.credits : 0,
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: parsed.error.errors[0]?.message || "Invalid input" 
        });
      }

      const { email, password } = parsed.data;

      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
        res.json({ user: sanitizeUser(user) });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  // Sign in with Apple (for mobile app)
  app.post("/api/auth/apple", async (req, res) => {
    try {
      const { identityToken, user: appleUser } = req.body;
      
      if (!identityToken) {
        return res.status(400).json({ message: "Missing identity token" });
      }

      let payload;
      try {
        payload = await appleSignin.verifyIdToken(identityToken, {
          audience: process.env.APPLE_CLIENT_ID,
          ignoreExpiration: false,
        });
      } catch (verifyError) {
        console.error("Apple token verification failed:", verifyError);
        return res.status(401).json({ message: "Invalid Apple identity token" });
      }

      const appleId = payload.sub;
      const email = payload.email || appleUser?.email;
      const firstName = appleUser?.name?.firstName || null;
      const lastName = appleUser?.name?.lastName || null;

      // First, try to find user by appleId (Apple only provides email on first sign-in)
      let [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.appleId, appleId))
        .limit(1);

      // If not found by appleId, try by email (if provided)
      if (!existingUser && email) {
        [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
      }

      // If still no user and no email, we can't create a new account
      if (!existingUser && !email) {
        return res.status(400).json({ message: "Email is required for new accounts" });
      }

      if (existingUser) {
        if (!existingUser.appleId) {
          await db
            .update(users)
            .set({ appleId })
            .where(eq(users.id, existingUser.id));
          existingUser.appleId = appleId;
        }
      } else {
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            appleId,
            firstName,
            lastName,
          })
          .returning();
        
        await db.insert(userSubscriptions).values({
          userId: newUser.id,
          freeAnalysesUsed: 0,
          status: "inactive",
          oneTimeCredits: 0,
        });
        
        existingUser = newUser;
      }

      const token = signToken({ userId: existingUser.id, email: existingUser.email });
      
      res.json({
        token,
        user: sanitizeUser(existingUser),
      });
    } catch (error) {
      console.error("Apple sign in error:", error);
      res.status(500).json({ message: "Failed to sign in with Apple" });
    }
  });

  // Sign in with Google (for mobile app)
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: "Missing ID token" });
      }

      const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      let payload;
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyError) {
        console.error("Google token verification failed:", verifyError);
        return res.status(401).json({ message: "Invalid Google ID token" });
      }

      if (!payload) {
        return res.status(401).json({ message: "Invalid Google ID token" });
      }

      const googleId = payload.sub;
      const email = payload.email;
      const firstName = payload.given_name || null;
      const lastName = payload.family_name || null;
      const profileImageUrl = payload.picture || null;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      let [existingUser] = await db
        .select()
        .from(users)
        .where(or(eq(users.googleId, googleId), eq(users.email, email)))
        .limit(1);

      if (existingUser) {
        if (!existingUser.googleId) {
          await db
            .update(users)
            .set({ googleId, profileImageUrl: profileImageUrl || existingUser.profileImageUrl })
            .where(eq(users.id, existingUser.id));
          existingUser.googleId = googleId;
        }
      } else {
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            googleId,
            firstName,
            lastName,
            profileImageUrl,
          })
          .returning();
        
        await db.insert(userSubscriptions).values({
          userId: newUser.id,
          freeAnalysesUsed: 0,
          status: "inactive",
          oneTimeCredits: 0,
        });
        
        existingUser = newUser;
      }

      const token = signToken({ userId: existingUser.id, email: existingUser.email });
      
      res.json({
        token,
        user: sanitizeUser(existingUser),
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      res.status(500).json({ message: "Failed to sign in with Google" });
    }
  });

  // Token refresh endpoint for mobile
  app.post("/api/auth/refresh", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing authorization header" });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const { verifyToken } = await import("./jwt");
      const payload = verifyToken(token);
      
      if (!payload || !payload.userId) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const newToken = signToken({ userId: user.id, email: user.email });
      
      res.json({
        token: newToken,
        user: sanitizeUser(user),
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ message: "Failed to refresh token" });
    }
  });

  // Forgot password - send reset email
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: parsed.error.errors[0]?.message || "Invalid email" 
        });
      }

      const { email } = parsed.data;

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: "If an account exists with that email, we've sent a password reset link." });
      }

      // Generate secure token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store token in database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: resetToken,
        expiresAt,
      });

      // Send email
      await sendPasswordResetEmail(user.email, resetToken, user.firstName);

      res.json({ message: "If an account exists with that email, we've sent a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: parsed.error.errors[0]?.message || "Invalid input" 
        });
      }

      const { token, password } = parsed.data;

      // Find valid token
      const [resetRecord] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!resetRecord || resetRecord.usedAt) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }

      // Hash new password
      const passwordHash = await hashPassword(password);

      // Update user password
      await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, resetRecord.userId));

      // Mark token as used
      await db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, resetRecord.id));

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
}

// Middleware to require authentication
export const requireAuth: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Helper to get current user ID from session
export function getCurrentUserId(req: any): string | null {
  return req.session?.userId || null;
}
