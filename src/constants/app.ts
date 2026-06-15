export const APP_NAME = "Base62";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION =
  "Gold standard URL shortener with sophisticated analytics for the discerning brand.";

export const STORAGE_KEYS = {
  urls: "my_urls",
} as const;

export const API_PREFIX = "/api/v1";

export const LIMITS = {
  maxUrlLength: 2048,
  shortUrlLength: 7,
  copyTimeoutMs: 2000,
  toastDurationMs: 3000,
} as const;
