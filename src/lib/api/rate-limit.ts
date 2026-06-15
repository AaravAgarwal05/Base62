import { redisClient } from "@/lib/cache/redis";
import { RateLimitError } from "@/lib/api/errors";
import type { RateLimitScope } from "@/constants/rate-limit";
import { RATE_LIMITS } from "@/constants/rate-limit";

interface RateLimitResult {
  remaining: number;
  reset: number; // unix seconds when the window resets
}

/**
 * Check rate limit for a scope + identifier.
 * - Uses Redis INCR + EXPIRE (fixed window).
 * - Sets EXPIRE on first request in the window.
 * - Throws RateLimitError when exceeded.
 * - Returns `null` when Redis is unavailable (fail open).
 */
export async function checkRateLimit(
  scope: RateLimitScope,
  identifier: string,
): Promise<RateLimitResult | null> {
  const cfg = RATE_LIMITS[scope];
  if (!cfg) return null;

  const key = `ratelimit:${scope}:${identifier}`;
  const now = Date.now();
  const windowStart = Math.floor(now / cfg.windowMs);
  const reset = (windowStart + 1) * (cfg.windowMs / 1000);

  try {
    const count = await redisClient.incr(key);

    // First request — set expiry
    if (count === 1) {
      await redisClient.expire(key, cfg.windowMs / 1000);
    }

    const remaining = Math.max(0, cfg.max - count);

    if (count > cfg.max) {
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(cfg.windowMs / 1000)}s.`,
      );
    }

    return { remaining, reset };
  } catch (err) {
    // If it's already our RateLimitError, rethrow
    if (err instanceof RateLimitError) throw err;

    // Redis unavailable — fail open (don't block traffic)
    console.warn(`[RateLimit] Redis unavailable for scope="${scope}":`, err);
    return null;
  }
}

/**
 * Apply rate limit check and return headers object if successful.
 * Throws RateLimitError on block.
 */
export async function applyRateLimit(
  scope: RateLimitScope,
  identifier: string,
): Promise<Record<string, string>> {
  const result = await checkRateLimit(scope, identifier);

  if (!result) {
    // Redis unavailable — no rate limit headers
    return {};
  }

  return {
    "X-RateLimit-Limit": String(RATE_LIMITS[scope].max),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}
