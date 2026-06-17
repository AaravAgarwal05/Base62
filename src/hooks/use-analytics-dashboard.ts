"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import type { ApexOptions } from "apexcharts";
import { RANGES } from "@/constants/analytics";
import { formatBucketLabel } from "@/lib/utils/time";
import type { RangeKey, ChartType } from "@/types/analytics";

export interface AnalyticsDashboardData {
  longUrl: string;
  totalClicks: number;
  totalScans: number;
  createdAt: string;
  history: Array<{ type: string; timestamp: string }>;
  stats: {
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
  };
  recentEvents: Array<{
    type: string;
    timestamp: string;
    ip: string | null;
    country: string | null;
    city: string | null;
    referrer: string | null;
    browser: string | null;
    os: string | null;
    device: string | null;
  }>;
}

/* ─── Build Apex config from raw history ─── */
function buildChartConfig(
  history: any[],
  rk: RangeKey,
  chartType: ChartType,
): { series: ApexOptions["series"]; options: ApexOptions } {
  const cfg = RANGES[rk];
  const nowMs = Date.now();
  const startMs = nowMs - cfg.windowMs;

  const bucketCount = Math.ceil(cfg.windowMs / cfg.bucketMs);
  const buckets: {
    start: number;
    label: string;
    clicks: number;
    scans: number;
  }[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = startMs + i * cfg.bucketMs;
    buckets.push({
      start: bucketStart,
      label: formatBucketLabel(new Date(bucketStart), cfg.labelFormat),
      clicks: 0,
      scans: 0,
    });
  }

  if (Array.isArray(history)) {
    history.forEach((event: any) => {
      const ts = new Date(event.timestamp).getTime();
      if (ts < startMs || ts > nowMs) return;
      const idx = Math.min(
        Math.floor((ts - startMs) / cfg.bucketMs),
        bucketCount - 1,
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
  const hasData =
    clicksData.some((v) => v > 0) || scansData.some((v) => v > 0);
  const isShortRange = cfg.labelFormat === "minute";
  const isHourRange = cfg.labelFormat === "hour";

  return {
    series: [
      { name: "Direct Clicks", data: clicksData },
      { name: "QR Scans", data: scansData },
    ],
    options: {
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
          formatter: (value: number) =>
            value >= 1000 ? (value / 1000).toFixed(1) + "k" : value.toFixed(0),
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
          formatter: (val: number) =>
            val + " " + (val === 1 ? "visit" : "visits"),
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
    },
  };
}

/* ─── Period comparison helper ─── */
function computePeriodChange(
  history: Array<{ type: string; timestamp: string }>,
  windowMs: number,
) {
  const nowMs = Date.now();
  const currentStart = nowMs - windowMs;
  const prevStart = currentStart - windowMs;

  let currentClicks = 0;
  let currentScans = 0;
  let prevClicks = 0;
  let prevScans = 0;

  for (const ev of history) {
    const ts = new Date(ev.timestamp).getTime();
    if (ts >= currentStart && ts <= nowMs) {
      if (ev.type === "scan") currentScans++;
      else currentClicks++;
    } else if (ts >= prevStart && ts < currentStart) {
      if (ev.type === "scan") prevScans++;
      else prevClicks++;
    }
  }

  return {
    clicksChange: prevClicks > 0 ? ((currentClicks - prevClicks) / prevClicks) * 100 : currentClicks > 0 ? 100 : 0,
    scansChange: prevScans > 0 ? ((currentScans - prevScans) / prevScans) * 100 : currentScans > 0 ? 100 : 0,
    currentClicks,
    currentScans,
  };
}

/* ─── Hook ─── */
export function useAnalyticsDashboard(code: string) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [chartSeries, setChartSeries] = useState<ApexOptions["series"]>([]);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAnalytics = useCallback(
    async (rk: RangeKey, silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await axios.get(`/api/v1/analytics/${code}`);
        if (!res.data) return;
        setData(res.data);
        const { series, options } = buildChartConfig(
          res.data.history || [],
          rk,
          chartType,
        );
        setChartSeries(series);
        setChartOptions(options);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("[Analytics Dashboard] Failed", error);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [code, chartType],
  );

  // Initial fetch + auto-poll
  useEffect(() => {
    if (code) {
      fetchAnalytics(rangeKey);
    }

    // Auto-poll every 15s
    pollingRef.current = setInterval(() => {
      fetchAnalytics(rangeKey, true);
    }, 15_000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [code, rangeKey, chartType, fetchAnalytics]);

  // Period comparison
  const cfg = RANGES[rangeKey];
  const periodChange = data?.history
    ? computePeriodChange(data.history, cfg.windowMs)
    : { clicksChange: 0, scansChange: 0, currentClicks: 0, currentScans: 0 };

  return {
    loading,
    data,
    rangeKey,
    chartType,
    chartSeries,
    chartOptions,
    lastUpdated,
    isLive,
    currentClicks: data?.totalClicks ?? 0,
    currentScans: data?.totalScans ?? 0,
    periodClicks: periodChange.currentClicks,
    periodScans: periodChange.currentScans,
    clicksChange: periodChange.clicksChange,
    scansChange: periodChange.scansChange,
    setRangeKey,
    setChartType,
    setIsLive,
    refetch: () => fetchAnalytics(rangeKey),
  };
}
