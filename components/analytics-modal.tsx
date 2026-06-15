"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BarChart3,
  MousePointerClick,
  QrCode,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ─── Types ─── */
interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

type RangeKey = "15m" | "1h" | "3h" | "24h" | "7d" | "30d" | "90d";
type ChartType = "bar" | "line" | "area";

interface RangeConfig {
  label: string;
  humanLabel: string;
  windowMs: number;
  bucketMs: number;
  labelFormat: "minute" | "hour" | "day";
}

/* ─── Time Range Config ─── */
const RANGES: Record<RangeKey, RangeConfig> = {
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

const RANGE_GROUPS: { group: string; keys: RangeKey[] }[] = [
  { group: "Real-time", keys: ["15m", "1h", "3h"] },
  { group: "Today", keys: ["24h"] },
  { group: "Long-term", keys: ["7d", "30d", "90d"] },
];

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, label }: { value: number; label: string }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const duration = 800;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    prevValue.current = end;
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div className="border border-outline-variant/20 p-5 bg-surface-container/50">
      <div className="flex items-center gap-3 mb-3">
        {label === "Clicks" ? (
          <MousePointerClick size={18} className="text-primary" />
        ) : (
          <QrCode size={18} className="text-primary" />
        )}
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="font-headline-lg text-headline-lg-mobile text-on-surface tabular-nums">
        {display.toLocaleString()}
      </p>
    </div>
  );
}

/* ─── Helpers ─── */
function formatBucketLabel(date: Date, format: "minute" | "hour" | "day"): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  switch (format) {
    case "minute":
      return `${h}:${m}`;
    case "hour":
      return `${h}:00`;
    case "day":
      return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  }
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

/* ─── Component ─── */
export function AnalyticsModal({ isOpen, onClose, code }: AnalyticsModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const renderCount = useRef(0);
  const chartId = useRef(`chart-${Date.now()}`);

  // No clock interval — avoids unnecessary re-renders that break ApexCharts

  const fetchAnalytics = useCallback(async (rk: RangeKey) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/analytics/${code}`);
      if (!res.data) return;
      setData(res.data);
      processChartData(res.data.history || [], rk);
      renderCount.current += 1;
      setLastUpdated(new Date());
    } catch (error) {
      console.error("[Analytics] Failed", error);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (isOpen && code) {
      fetchAnalytics(rangeKey);
    }
  }, [isOpen, code, rangeKey, chartType, fetchAnalytics]);

  const processChartData = (history: any[], rk: RangeKey) => {
    const cfg = RANGES[rk];
    const nowMs = Date.now();
    const startMs = nowMs - cfg.windowMs;

    // Build buckets
    const bucketCount = Math.ceil(cfg.windowMs / cfg.bucketMs);
    const buckets: { start: number; label: string; clicks: number; scans: number }[] = [];

    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = startMs + i * cfg.bucketMs;
      buckets.push({
        start: bucketStart,
        label: formatBucketLabel(new Date(bucketStart), cfg.labelFormat),
        clicks: 0,
        scans: 0,
      });
    }

    // Place events into buckets
    if (Array.isArray(history)) {
      history.forEach((event: any) => {
        const ts = new Date(event.timestamp).getTime();
        if (ts < startMs || ts > nowMs) return;
        const idx = Math.min(
          Math.floor((ts - startMs) / cfg.bucketMs),
          bucketCount - 1
        );
        if (idx >= 0 && idx < buckets.length) {
          if (event.type === "scan") buckets[idx].scans++;
          else buckets[idx].clicks++;
        }
      });
    }

    const categories = buckets.map((b) => b.label);
    const clicksData = buckets.map((b) => b.clicks);
    const scansData = buckets.map((b) => b.scans);

    setChartSeries([
      { name: "Direct Clicks", data: clicksData },
      { name: "QR Scans", data: scansData },
    ]);

    const hasData = clicksData.some((v) => v > 0) || scansData.some((v) => v > 0);
    const isShortRange = cfg.labelFormat === "minute";
    const isHourRange = cfg.labelFormat === "hour";

    setChartOptions({
      chart: {
        id: "analytics-chart",
        toolbar: { show: false },
        fontFamily: "Geist, sans-serif",
        zoom: { enabled: false },
        background: "transparent",
        type: chartType,
        foreColor: "#6b7280",
        animations: {
          enabled: true,
          speed: 600,
          animateGradually: { enabled: true, delay: 60 },
          dynamicAnimation: { enabled: true, speed: 300 },
        },
      },
      theme: { mode: "dark" },
      colors: ["#f2ca50", "#d4af37"],
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: isShortRange ? 1.5 : 2,
        dashArray: hasData ? [0, 3] : [0, 0],
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.8,
          opacityFrom: 0.45,
          opacityTo: 0.02,
          stops: [0, 85, 100],
        },
      },
      grid: {
        borderColor: "rgba(77, 70, 53, 0.25)",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: "#6b7280", fontSize: "10px" },
          rotate: isHourRange ? -30 : isShortRange ? -45 : 0,
          show: bucketCount <= 60,
          hideOverlappingLabels: true,
          trim: true,
          maxHeight: 40,
        },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#6b7280", fontSize: "10px" },
          formatter: (value: number) => (value >= 1000 ? (value / 1000).toFixed(1) + "k" : value.toFixed(0)),
        },
        min: 0,
        forceNiceScale: true,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        offsetY: -14,
        itemMargin: { horizontal: 10, vertical: 0 },
        labels: { colors: "#d1d5db" },
        markers: { size: 6 },
      },
      tooltip: {
        theme: "dark",
        style: { fontSize: "12px", fontFamily: "inherit" },
        marker: { show: true },
        y: {
          formatter: (val: number) => val + " " + (val === 1 ? "visit" : "visits"),
        },
      },
      markers: {
        size: isShortRange ? 2 : 3,
        hover: { size: 5 },
        strokeColors: "#f2ca50",
        strokeWidth: 0,
      },
      plotOptions: {
        bar: {
          borderRadius: 1,
          columnWidth: isShortRange ? "80%" : "60%",
        },
      },
    });
  };

  const currentClicks = data?.totalClicks ?? 0;
  const currentScans = data?.totalScans ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-surface border border-outline-variant/20 rounded p-6 sm:p-7 w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl"
          >
            {/* ─── Header ─── */}
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <BarChart3 size={22} className="text-primary" />
                <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">
                  Analytics
                </h3>
                {!loading && (
                  <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-outline-variant font-label-caps uppercase tracking-wider">
                    <Clock size={12} />
                    Updated {timeAgo(lastUpdated)}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center min-h-80">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-xs text-on-surface-variant/50 font-label-caps uppercase tracking-wider">
                    Loading
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-5">
                {/* ─── Stats Cards ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                >
                  <AnimatedCounter value={currentClicks} label="Clicks" />
                  <AnimatedCounter value={currentScans} label="QR Scans" />
                </motion.div>

                {/* ─── Range Selector ─── */}
                <div className="flex flex-wrap items-center gap-1">
                  {RANGE_GROUPS.map((g) => (
                    <div key={g.group} className="flex items-center gap-0.5">
                      {g.keys.map((rk) => (
                        <button
                          key={rk}
                          onClick={() => setRangeKey(rk)}
                          className={`px-2.5 py-1 text-[11px] font-label-caps tracking-wider uppercase rounded transition-all ${
                            rangeKey === rk
                              ? "bg-primary text-on-primary"
                              : "text-outline-variant hover:text-on-surface"
                          }`}
                        >
                          {RANGES[rk].label}
                        </button>
                      ))}
                      <span className="w-px h-3 bg-outline-variant/20 mx-1 last:hidden" />
                    </div>
                  ))}
                </div>

                {/* ─── Chart ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="border border-outline-variant/20 p-4 sm:p-5 bg-surface-container/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        Performance
                      </h4>
                      <p className="text-[11px] text-outline-variant font-label-caps uppercase tracking-wider mt-0.5">
                        {RANGES[rangeKey].humanLabel}
                      </p>
                    </div>
                    <div className="flex bg-surface-container-high/50 rounded p-0.5 border border-outline-variant/20 self-start">
                      {(["area", "bar", "line"] as ChartType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setChartType(type)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all capitalize ${
                            chartType === type
                              ? "bg-primary text-on-primary"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-72 sm:h-80 w-full">
                    <Chart
                      options={chartOptions}
                      series={chartSeries}
                      type={chartType}
                      height={330}
                      width="100%"
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
