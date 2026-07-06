/**
 * StadiumPulse AI - Environment Configuration
 *
 * Centralizes all environment variable access with Zod validation.
 * Fails fast at startup if required variables are missing.
 */
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (one level up from server/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  JWT_REFRESH_SECRET: z.string().min(8, 'JWT_REFRESH_SECRET must be at least 8 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  AI_RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  AI_RATE_LIMIT_MAX: z.string().default('20').transform(Number),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.format();
  throw new Error(`❌ Invalid environment variables:\n${JSON.stringify(formatted, null, 2)}`);
}

export const env = parsed.data;
