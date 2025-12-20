import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { users, signupSchema, loginSchema, type SafeUser } from "@shared/models/auth";
import { userSubscriptions } from "@shared/models/swipebetter";
import { eq } from "drizzle-orm";
import type { Express, RequestHandler } from "express";

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

      const { email, password, firstName, lastName } = parsed.data;

      // Check if user exists
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
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

      // Create subscription record with free tier
      await db.insert(userSubscriptions).values({
        userId: newUser.id,
        freeAnalysesUsed: 0,
        status: "inactive",
      });

      // Set session
      req.session.userId = newUser.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
        res.json({ user: sanitizeUser(newUser) });
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
