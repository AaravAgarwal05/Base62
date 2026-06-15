"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, Clock } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { timeAgo } from "@/lib/utils/time";
import { StatsCard } from "@/components/features/analytics/stats-cards";
import { TimeRangeSelector } from "@/components/features/analytics/time-range-selector";
import { AnalyticsChart } from "@/components/features/analytics/analytics-chart";

/* ─── Types ─── */
interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

/* ─── Component ─── */
export function AnalyticsModal({ isOpen, onClose, code }: AnalyticsModalProps) {
  const {
    loading,
    rangeKey,
    chartType,
    chartSeries,
    chartOptions,
    lastUpdated,
    currentClicks,
    currentScans,
    setRangeKey,
    setChartType,
  } = useAnalytics(code, isOpen);

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
                  <StatsCard value={currentClicks} label="Clicks" />
                  <StatsCard value={currentScans} label="QR Scans" />
                </motion.div>

                {/* ─── Range Selector ─── */}
                <TimeRangeSelector
                  rangeKey={rangeKey}
                  onChange={setRangeKey}
                />

                {/* ─── Chart ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <AnalyticsChart
                    series={chartSeries}
                    options={chartOptions}
                    rangeKey={rangeKey}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                  />
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
