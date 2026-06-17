"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MousePointerClick, QrCode, Clock } from "lucide-react";
import { RANGES } from "@/constants/analytics";
import type { RangeKey } from "@/types/analytics";
import { timeAgo } from "@/lib/utils/time";

interface ClickMapProps {
  history: Array<{ type: string; timestamp: string }>;
  rangeKey: RangeKey;
}

export function ClickMap({ history, rangeKey }: ClickMapProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cfg = RANGES[rangeKey];
  const nowMs = Date.now();
  const startMs = nowMs - cfg.windowMs;

  // Bucket events into time slices
  const bucketCount = Math.min(cfg.windowMs / cfg.bucketMs, 120);
  const buckets = useMemo(() => {
    const b: { count: number; events: { type: string; timestamp: string }[] }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      b.push({ count: 0, events: [] });
    }
    if (Array.isArray(history)) {
      for (const ev of history) {
        const ts = new Date(ev.timestamp).getTime();
        if (ts < startMs || ts > nowMs) continue;
        const idx = Math.min(
          Math.floor(((ts - startMs) / cfg.windowMs) * bucketCount),
          bucketCount - 1,
        );
        if (idx >= 0 && idx < bucketCount) {
          b[idx].count++;
          b[idx].events.push(ev);
        }
      }
    }
    return b;
  }, [history, startMs, nowMs, cfg.windowMs, bucketCount]);

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  // Show last 50 individual events in a feed
  const sortedEvents = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return [...history]
      .filter((ev) => {
        const ts = new Date(ev.timestamp).getTime();
        return ts >= startMs && ts <= nowMs;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  }, [history, startMs, nowMs]);

  const hasData = sortedEvents.length > 0;

  return (
    <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
      <div className="flex items-center gap-2 mb-5">
        <MousePointerClick size={16} className="text-primary" />
        <h3 className="font-title-md text-title-md text-on-surface">
          Click Map
        </h3>
        <span className="text-xs text-on-surface-variant/40 ml-auto">
          {sortedEvents.length} events in this period
        </span>
      </div>

      {/* Density bars */}
      <div className="flex items-end gap-px h-16 mb-6">
        {buckets.map((b, i) => {
          const height = b.count > 0 ? Math.max((b.count / maxCount) * 100, 8) : 2;
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.4, delay: i * 0.003 }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex-1 cursor-pointer transition-all duration-150 ${
                b.count > 0
                  ? "bg-primary/40 hover:bg-primary/70"
                  : "bg-outline-variant/10"
              }`}
              title={`${b.count} events`}
            />
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredIdx !== null && buckets[hoveredIdx].count > 0 && (
        <div className="mb-4 text-xs text-on-surface-variant bg-surface-container-high px-3 py-2 border border-outline-variant/20">
          <span className="text-primary font-medium">{buckets[hoveredIdx].count}</span>{" "}
          events in this interval
        </div>
      )}

      {/* Individual event feed */}
      {hasData ? (
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {sortedEvents.map((ev, idx) => (
            <motion.div
              key={`${ev.timestamp}-${idx}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.008 }}
              className="flex items-center gap-3 px-2 py-1.5 hover:bg-surface-container/50 transition-colors text-xs"
            >
              {ev.type === "scan" ? (
                <QrCode size={11} className="text-primary/60 shrink-0" />
              ) : (
                <MousePointerClick size={11} className="text-primary/60 shrink-0" />
              )}
              <span className="text-on-surface-variant/50 w-14 shrink-0 font-code-md tabular-nums">
                {timeAgo(new Date(ev.timestamp))}
              </span>
              <span className="text-on-surface-variant/70 truncate">
                {ev.type === "scan" ? "QR Scan" : "Click"}
              </span>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant/50">
          No events in this time range.
        </p>
      )}
    </div>
  );
}
