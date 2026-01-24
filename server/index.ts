import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { setupSession, registerAuthRoutes } from "./auth";

const app = express();

// CORS configuration for dev domains (mobile app, etc.)
const allowedOrigins = [
  "https://d3927c46-4ca2-4bc4-a717-3a83b7527b76-00-2zgdzqdobgm8a.janeway.replit.dev",
  "https://swipebetter.replit.app",
];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.replit.dev') || origin.endsWith('.replit.app')) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
}));
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    log("DATABASE_URL not set, skipping Stripe initialization", "stripe");
    return;
  }

  try {
    log("Initializing Stripe schema...", "stripe");
    await runMigrations({ 
      databaseUrl,
      schema: 'stripe'
    });
    log("Stripe schema ready", "stripe");

    const stripeSync = await getStripeSync();

    log("Setting up managed webhook...", "stripe");
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    try {
      const result = await stripeSync.findOrCreateManagedWebhook(
        `${webhookBaseUrl}/api/stripe/webhook`);
      if (result?.webhook?.url) {
        log(`Webhook configured: ${result.webhook.url}`, "stripe");
      } else {
        log("Webhook setup returned, continuing...", "stripe");
      }
    } catch (webhookError) {
      log("Webhook setup skipped (may need to configure later)", "stripe");
    }

    log("Syncing Stripe data...", "stripe");
    stripeSync.syncBackfill()
      .then(() => {
        log("Stripe data synced", "stripe");
      })
      .catch((err: any) => {
        log("Error syncing Stripe data (will retry on next restart)", "stripe");
      });
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
  }
}

(async () => {
  await initStripe();

  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];

      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }

      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;

        if (!Buffer.isBuffer(req.body)) {
          console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer.');
          return res.status(500).json({ error: 'Webhook processing error' });
        }

        await WebhookHandlers.processWebhook(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );

  app.use(
    express.json({
      limit: "50mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false, limit: "50mb" }));
  app.use(cookieParser());

  setupSession(app);
  registerAuthRoutes(app);

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        log(logLine);
      }
    });

    next();
  });

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Ensure super user access for key accounts on startup
  try {
    const { storage } = await import("./storage");
    const superUserEmail = "dave@d1t2.com";
    
    // Look up user by email to get correct ID in any environment
    const user = await storage.getUserByEmail(superUserEmail);
    if (user) {
      const isSuperUser = await storage.isSuperUser(user.id);
      log(`[startup] Found user ${superUserEmail} with ID ${user.id}, isSuperUser=${isSuperUser}`);
      if (!isSuperUser) {
        await storage.setSuperUser(user.id, true);
        log(`[startup] Set super user status for ${superUserEmail} (${user.id})`);
      } else {
        log(`[startup] Super user ${superUserEmail} already configured`);
      }
    } else {
      log(`[startup] User ${superUserEmail} not found in database`);
    }
  } catch (err) {
    log(`[startup] Error setting up super user: ${err}`);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
