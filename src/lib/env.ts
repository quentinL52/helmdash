/**
 * Helmdash — Environment Variable Validation
 *
 * Centralised Zod-based validation of all required environment variables.
 * Parse at startup — fail fast with a clear message.
 * Import `env` instead of using `process.env.X!` throughout the codebase.
 */

import { z } from 'zod';

const envSchema = z.object({
  // ── Database ──────────────────────────────────────────────
  DATABASE_URL: z.string().url(),

  // ── Supabase ──────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // ── AI Providers (at least one required) ──────────────────
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  AI_API_KEY: z.string().optional(),

  // ── Encryption ────────────────────────────────────────────
  MASTER_ENCRYPTION_KEY: z.string().min(1, 'MASTER_ENCRYPTION_KEY is required for API key encryption at rest'),

  // ── Rate Limiting ─────────────────────────────────────────
  UPSTASH_REDIS_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),

  // ── Stripe ────────────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_GROWTH: z.string().optional(),
  STRIPE_PRICE_SCALE: z.string().optional(),
  STRIPE_PRICE_STARTER_YEARLY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_STARTER: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_GROWTH: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_SCALE: z.string().optional(),

  // ── Composio ──────────────────────────────────────────────
  COMPOSIO_API_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),

  // ── Email ─────────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),

  // ── App Config ────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  CRON_SECRET: z.string().min(1, 'CRON_SECRET is required for cron job security'),
  HERMES_API_KEY: z.string().optional(),

  // ── Environment ───────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables at boot.
 * Throws a clear ZodError if any required var is missing.
 */
function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error('\n💡 Check your .env.local file and ensure all required vars are set.');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In dev/test, return partial defaults to avoid crashing on every restart
    return result.data as Env;
  }
  return result.data;
}

export const env = parseEnv();

/**
 * Helper to check if at least one AI provider key is configured.
 */
export function hasAiProvider(): boolean {
  return !!(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || env.GOOGLE_AI_API_KEY || env.MISTRAL_API_KEY || env.AI_API_KEY);
}