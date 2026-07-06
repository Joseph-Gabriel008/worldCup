/**
 * StadiumPulse AI - Rate Limiting Middleware
 *
 * Applies stricter rate limits on AI/Gemini endpoints to prevent
 * API cost overrun and abuse. General endpoints have a more generous limit.
 */
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Rate limiter for AI-powered endpoints (chat, forecast, translation).
 * Default: 20 requests per minute per IP.
 */
export const aiRateLimiter = rateLimit({
  windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
  max: env.AI_RATE_LIMIT_MAX,
  message: {
    success: false,
    error: 'Too many AI requests. Please wait before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General rate limiter for standard API endpoints.
 * Default: 100 requests per minute per IP.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints (login, register).
 * Default: 10 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
