"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Clock,
  BarChart3,
} from "lucide-react";
import { useAnalyticsDashboard } from "@/hooks/use-analytics-dashboard";

import { TimeRangeSelector } from "@/components/features/analytics/time-range-selector";
import { AnalyticsChart } from "@/components/features/analytics/analytics-chart";
import { DashboardStats } from "@/components/features/analytics/dashboard/dashboard-stats";
import { GeoSection } from "@/components/features/analytics/dashboard/dashboard-geo";
import { ReferrerSection } from "@/components/features/analytics/dashboard/dashboard-referrers";
import { TechSection } from "@/components/features/analytics/dashboard/dashboard-tech";
import { IpTable } from "@/components/features/analytics/dashboard/dashboard-ips";
import { EventFeed } from "@/components/features/analytics/dashboard/dashboard-events";
import { DashboardExport } from "@/components/features/analytics/dashboard/dashboard-export";
import { ClickMap } from "@/components/features/analytics/dashboard/dashboard-clickmap";
import { timeAgo } from "@/lib/utils/time";
import { RANGES } from "@/constants/analytics";

/* ─── Animation ─── */
const springEase = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: springEase },
  },
};

export default function AnalyticsDashboardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const {
    loading,
    data,
    rangeKey,
    chartType,
    chartSeries,
    chartOptions,
    lastUpdated,
    isLive,
    currentClicks,
    currentScans,
    clicksChange,
    scansChange,
    periodClicks,
    periodScans,
    setRangeKey,
    setChartType,
    refetch,
  } = useAnalyticsDashboard(code);

  /* ─── Loading state ─── */
  if (loading && !data) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-28 h-28 sm:w-32 sm:h-32"
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="loaderGradDash"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f2ca50" />
                  <stop offset="100%" stopColor="#d4af37" />
                </linearGradient>
              </defs>
              <path
                id="circlePathDash"
                d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                fill="none"
              />
              <text
                fill="url(#loaderGradDash)"
                fontSize="8.2"
                fontWeight="600"
                letterSpacing="4"
                fontFamily="JetBrains Mono, monospace"
              >
                <textPath href="#circlePathDash" startOffset="0%">
                  ANALYTICS •  LOADING •  ANALYTICS •  LOADING •  {"  ".repeat(4)}
                </textPath>
              </text>
            </svg>
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-primary/10 border border-primary/30 flex items-center justify-center"
            >
              <BarChart3 size={20} className="text-primary" />
            </motion.div>
          </div>
        </div>

        <div className="mt-10 w-48 sm:w-56 max-w-xs">
          <div className="h-[1px] bg-outline-variant/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-on-surface-variant/50 font-code-md tracking-[0.2em] uppercase">
          Loading analytics
        </p>
      </div>
    );
  }

  /* ─── Error / no data ─── */
  if (!data) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="text-center max-w-md">
          <BarChart3
            size={48}
            strokeWidth={1}
            className="mx-auto mb-4 text-outline-variant"
          />
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
            No Analytics Found
          </h1>
          <p className="text-on-surface-variant text-sm mb-6">
            This URL doesn&apos;t exist or hasn&apos;t received any traffic yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-label-caps text-label-caps uppercase tracking-wider hover:gap-3 transition-all"
          >
            <ArrowLeft size={14} /> Back Home
          </Link>
        </div>
      </div>
    );
  }

  const uniqueIps = data.stats.ips.length;
  const uniqueCountries = data.stats.countries.length;
  const humanPeriod = RANGES[rangeKey].humanLabel.toLowerCase();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* ══════════════════════════════════════
           HEADER
           ══════════════════════════════════════ */}
      <header className="border-b border-outline-variant/15 bg-surface/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-8 h-8 rounded flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Back"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                Analytics
                <span className="text-primary font-code-md text-code-md">
                  /{code}
                </span>
              </h1>
              <a
                href={data.longUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-on-surface-variant/50 hover:text-primary flex items-center gap-1 transition-colors mt-0.5 max-w-md truncate"
              >
                <ExternalLink size={10} />
                {data.longUrl}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live indicator */}
            {isLive && (
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-[10px] text-green-400/70 font-label-caps uppercase tracking-wider">
                  Live
                </span>
              </div>
            )}

            <DashboardExport data={data} code={code} />

            <span className="text-[10px] text-outline-variant font-label-caps uppercase tracking-wider hidden sm:flex items-center gap-1">
              <Clock size={10} />
              {timeAgo(lastUpdated)}
            </span>
            <button
              onClick={refetch}
              className="w-7 h-7 rounded flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
           CONTENT
           ══════════════════════════════════════ */}
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-6">
        {/* ─── Stat cards ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <DashboardStats
            label="Total Clicks"
            value={currentClicks}
            icon="clicks"
            change={clicksChange}
            periodLabel={humanPeriod}
          />
          <DashboardStats
            label="QR Scans"
            value={currentScans}
            icon="scans"
            change={scansChange}
            periodLabel={humanPeriod}
          />
          <DashboardStats label="Countries" value={uniqueCountries} icon="countries" />
          <DashboardStats label="Unique IPs" value={uniqueIps} icon="ips" />
        </motion.div>

        {/* ─── Chart + Range ─── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="mb-3 flex items-center justify-between">
            <TimeRangeSelector rangeKey={rangeKey} onChange={setRangeKey} />
          </div>
          <AnalyticsChart
            series={chartSeries}
            options={chartOptions}
            rangeKey={rangeKey}
            chartType={chartType}
            onChartTypeChange={setChartType}
          />
        </motion.div>

        {/* ─── Click Map ─── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <ClickMap history={data.history} rangeKey={rangeKey} />
        </motion.div>

        {/* ─── Geography ─── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <GeoSection
            countries={data.stats.countries}
            cities={data.stats.cities}
          />
        </motion.div>

        {/* ─── Referrers + Tech ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <ReferrerSection referrers={data.stats.referrers} />
          <TechSection
            browsers={data.stats.browsers}
            oss={data.stats.oss}
            devices={data.stats.devices}
          />
        </motion.div>

        {/* ─── IP Addresses ─── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <IpTable ips={data.stats.ips} />
        </motion.div>

        {/* ─── Recent Events ─── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <EventFeed events={data.recentEvents} />
        </motion.div>

        {/* ─── Footer ─── */}
        <div className="text-center py-8 text-[10px] text-outline-variant font-label-caps uppercase tracking-wider">
          Base62 Analytics · Auto-updates every 15s ·{" "}
          {new Date().toLocaleDateString()}
        </div>
      </main>
    </div>
  );
}
