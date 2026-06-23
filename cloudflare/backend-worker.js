import { Container } from "@cloudflare/containers";

const DEFAULT_APP_URL = "https://swipebetter.ai";
const SECRET_NAMES = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "AI_INTEGRATIONS_OPENAI_API_KEY",
  "AI_INTEGRATIONS_OPENAI_BASE_URL",
  "XAI_API_KEY",
  "APPLE_CLIENT_ID",
  "GOOGLE_CLIENT_ID",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
];

export class SwipeBetterApi extends Container {
  defaultPort = 5000;
  requiredPorts = [5000];
  sleepAfter = "30m";
  enableInternet = true;
  pingEndpoint = "/api/auth/user";
}

function containerEnv(env) {
  const vars = {
    NODE_ENV: "production",
    PORT: "5000",
    APP_URL: env.APP_URL || DEFAULT_APP_URL,
  };

  for (const name of SECRET_NAMES) {
    if (env[name]) {
      vars[name] = env[name];
    }
  }

  return vars;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "swipebetter-api" });
    }

    const container = env.SWIPEBETTER_API.getByName("primary");
    await container.startAndWaitForPorts({
      ports: [5000],
      startOptions: { envVars: containerEnv(env) },
    });

    return container.fetch(request);
  },
};
