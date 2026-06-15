"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { ApexOptions } from "apexcharts";
import { RANGES } from "@/constants/analytics";
import { formatBucketLabel } from "@/lib/utils/time";
import type { RangeKey, ChartType } from "@/types/analytics";

/* ─── Build Apex config from raw history ─── */
function buildChartConfig(
  history: any[],
  rk: RangeKey,
  chartType: ChartType
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

/* ─── Hook ─── */
export function useAnalytics(code: string, isOpen: boolean) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [chartSeries, setChartSeries] = useState<ApexOptions["series"]>([]);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalytics = useCallback(
    async (rk: RangeKey) => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/analytics/${code}`);
        if (!res.data) return;
        setData(res.data);
        const { series, options } = buildChartConfig(
          res.data.history || [],
          rk,
          chartType
        );
        setChartSeries(series);
        setChartOptions(options);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("[Analytics] Failed", error);
      } finally {
        setLoading(false);
      }
    },
    [code, chartType]
  );

  useEffect(() => {
    if (isOpen && code) {
      fetchAnalytics(rangeKey);
    }
  }, [isOpen, code, rangeKey, chartType, fetchAnalytics]);

  return {
    loading,
    data,
    rangeKey,
    chartType,
    chartSeries,
    chartOptions,
    lastUpdated,
    currentClicks: data?.totalClicks ?? 0,
    currentScans: data?.totalScans ?? 0,
    setRangeKey,
    setChartType,
  };
}
