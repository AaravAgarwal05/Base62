export const RATE_LIMITS = {
  /** POST /api/v1/shorten — 10 req/min per IP */
  shorten: { windowMs: 60_000, max: 10 },
  /** GET /api/v1/analytics/* — 30 req/min per IP */
  analytics: { windowMs: 60_000, max: 30 },
} as const;

export type RateLimitScope = keyof typeof RATE_LIMITS;
