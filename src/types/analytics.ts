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

export interface AnalyticsEvent {
  urlId: number;
  type: "click" | "scan";
  timestamp: string;
}

export interface AnalyticsData {
  totalClicks: number;
  totalScans: number;
  history: Array<{
    type: "click" | "scan";
    timestamp: string;
  }>;
}
