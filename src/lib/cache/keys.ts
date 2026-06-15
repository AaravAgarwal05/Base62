/* ─── Redis cache key patterns ─── */

export const CACHE_KEYS = {
  /** Maps short code → long URL string */
  url: (code: string) => `url:${code}`,

  /** Redis List holding buffered analytics events */
  analyticsBuffer: "analytics:events",
} as const;
