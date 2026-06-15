import type { RangeKey, RangeConfig } from "@/types/analytics";

export const RANGES: Record<RangeKey, RangeConfig> = {
  "15m": {
    label: "15m",
    humanLabel: "Past 15 minutes",
    windowMs: 15 * 60 * 1000,
    bucketMs: 60 * 1000,
    labelFormat: "minute",
  },
  "1h": {
    label: "1h",
    humanLabel: "Past hour",
    windowMs: 60 * 60 * 1000,
    bucketMs: 5 * 60 * 1000,
    labelFormat: "minute",
  },
  "3h": {
    label: "3h",
    humanLabel: "Past 3 hours",
    windowMs: 3 * 60 * 60 * 1000,
    bucketMs: 15 * 60 * 1000,
    labelFormat: "minute",
  },
  "24h": {
    label: "24h",
    humanLabel: "Past 24 hours",
    windowMs: 24 * 60 * 60 * 1000,
    bucketMs: 60 * 60 * 1000,
    labelFormat: "hour",
  },
  "7d": {
    label: "7d",
    humanLabel: "Past 7 days",
    windowMs: 7 * 24 * 60 * 60 * 1000,
    bucketMs: 24 * 60 * 60 * 1000,
    labelFormat: "day",
  },
  "30d": {
    label: "30d",
    humanLabel: "Past 30 days",
    windowMs: 30 * 24 * 60 * 60 * 1000,
    bucketMs: 24 * 60 * 60 * 1000,
    labelFormat: "day",
  },
  "90d": {
    label: "90d",
    humanLabel: "Past 90 days",
    windowMs: 90 * 24 * 60 * 60 * 1000,
    bucketMs: 24 * 60 * 60 * 1000,
    labelFormat: "day",
  },
};

export const RANGE_GROUPS: { group: string; keys: RangeKey[] }[] = [
  { group: "Real-time", keys: ["15m", "1h", "3h"] },
  { group: "Today", keys: ["24h"] },
  { group: "Long-term", keys: ["7d", "30d", "90d"] },
];
