import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Only enable social providers if credentials are available
const socialProviders: any = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  };
}

console.log("[BetterAuth] Initializing with baseURL:", appUrl);
console.log("[BetterAuth] Database URL exists:", !!process.env.DATABASE_URL);
console.log("[BetterAuth] Secret exists:", !!process.env.BETTER_AUTH_SECRET);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-build-only",
  baseURL: appUrl,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    cookiePrefix: "acquisitor",
  },
});

console.log("[BetterAuth] Initialized successfully");

export type AuthSession = typeof auth.$Infer.Session;
export { appUrl };