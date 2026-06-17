/* ─── Analytics types ─── */

export type RangeKey = "15m" | "1h" | "3h" | "24h" | "7d" | "30d" | "90d";
export type ChartType = "bar" | "line" | "area";

export interface RangeConfig {
  label: string;
  humanLabel: string;
  windowMs: number;
  bucketMs: number;
  labelFormat: "minute" | "hour" | "day";
}

/* ─── Event shape (publisher / buffer / consumer) ─── */
export interface AnalyticsEvent {
  urlId: number;
  type: "click" | "scan";
  timestamp: string;
  ip?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
}

/* ─── API response shapes ─── */
export interface AnalyticsStats {
  countries: Array<{ country: string | null; count: number }>;
  cities: Array<{ city: string | null; count: number }>;
  referrers: Array<{ referrer: string | null; count: number }>;
  browsers: Array<{ browser: string | null; count: number }>;
  oss: Array<{ os: string | null; count: number }>;
  devices: Array<{ device: string | null; count: number }>;
  ips: Array<{
    ip: string | null;
    count: number;
    country: string | null;
    city: string | null;
    region: string | null;
  }>;
}

export interface AnalyticsEventRecord {
  type: string;
  timestamp: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
}

export interface AnalyticsData {
  longUrl: string;
  totalClicks: number;
  totalScans: number;
  createdAt: string;
  history: Array<{ type: string; timestamp: string }>;
  stats: AnalyticsStats;
  recentEvents: AnalyticsEventRecord[];
}
