"use client";

import { motion } from "framer-motion";
import {
  MousePointerClick,
  QrCode,
  Globe,
  Monitor,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: "clicks" | "scans" | "countries" | "browsers" | "ips";
  change?: number | null;
  periodLabel?: string;
}

const iconMap = {
  clicks: MousePointerClick,
  scans: QrCode,
  countries: Globe,
  browsers: Monitor,
  ips: Users,
};

export function DashboardStats({
  label,
  value,
  icon,
  change,
  periodLabel,
}: StatCardProps) {
  const Icon = iconMap[icon];
  const hasChange = change !== undefined && change !== null && icon !== "countries" && icon !== "ips";
  const isPositive = hasChange && change >= 0;
  const isNegative = hasChange && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-outline-variant/20 p-5 bg-surface-container/50"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        <Icon size={16} className="text-primary/60" />
      </div>
      <p className="font-headline-lg text-headline-lg-mobile text-on-surface tabular-nums">
        {value.toLocaleString()}
      </p>

      {/* Period comparison */}
      {hasChange && (
        <div className="flex items-center gap-1.5 mt-2">
          {isPositive ? (
            <TrendingUp size={12} className="text-green-400" />
          ) : isNegative ? (
            <TrendingDown size={12} className="text-red-400" />
          ) : null}
          <span
            className={`text-[11px] font-code-md tabular-nums ${
              isPositive
                ? "text-green-400"
                : isNegative
                  ? "text-red-400"
                  : "text-on-surface-variant/40"
            }`}
          >
            {change === 0
              ? "No change"
              : `${isPositive ? "+" : ""}${change.toFixed(1)}%`}
          </span>
          {periodLabel && (
            <span className="text-[10px] text-on-surface-variant/40 ml-auto">
              vs {periodLabel}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
