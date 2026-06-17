"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface ReferrerItem {
  referrer: string | null;
  count: number;
}

interface ReferrerSectionProps {
  referrers: ReferrerItem[];
}

export function ReferrerSection({ referrers }: ReferrerSectionProps) {
  const maxCount = Math.max(...referrers.map((r) => r.count), 1);

  if (referrers.length === 0) {
    return (
      <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
        <div className="flex items-center gap-2 mb-4">
          <ExternalLink size={16} className="text-primary" />
          <h3 className="font-title-md text-title-md text-on-surface">
            Referrers
          </h3>
        </div>
        <p className="text-sm text-on-surface-variant/50">
          No referrer data yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
      <div className="flex items-center gap-2 mb-5">
        <ExternalLink size={16} className="text-primary" />
        <h3 className="font-title-md text-title-md text-on-surface">
          Referrers
        </h3>
      </div>

      <div className="space-y-1.5">
        {referrers.slice(0, 15).map((r) => {
          const pct = (r.count / maxCount) * 100;
          const display =
            r.referrer && r.referrer.length > 0
              ? r.referrer.length > 50
                ? r.referrer.slice(0, 50) + "…"
                : r.referrer
              : "Direct / Unknown";
          return (
            <div key={r.referrer ?? "direct"} className="flex items-center gap-3 group">
              <span className="flex-1 truncate text-sm text-on-surface font-code-md text-code-md">
                {display}
              </span>
              <div className="w-24 h-5 bg-surface-container-high/50 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 bg-primary/20 border-r border-primary/40"
                />
              </div>
              <span className="w-10 text-right text-sm text-on-surface-variant font-code-md text-code-md tabular-nums">
                {r.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
