import type { Express } from "express";

// Register auth-specific routes
// Note: /api/auth/user is defined in server/routes.ts to handle both authenticated and unauthenticated states
export function registerAuthRoutes(app: Express): void {
  // Auth routes (/api/login, /api/callback, /api/logout) are registered in setupAuth()
  // No additional routes needed here
}
