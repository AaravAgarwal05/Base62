"use client";

import { motion } from "framer-motion";
import { Clock, MousePointerClick, QrCode } from "lucide-react";
import { timeAgo } from "@/lib/utils/time";

interface EventItem {
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

interface EventFeedProps {
  events: EventItem[];
}

export function EventFeed({ events }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-primary" />
          <h3 className="font-title-md text-title-md text-on-surface">
            Recent Events
          </h3>
        </div>
        <p className="text-sm text-on-surface-variant/50">
          No events recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-primary" />
        <h3 className="font-title-md text-title-md text-on-surface">
          Recent Events
        </h3>
        <span className="text-xs text-on-surface-variant/40 ml-auto">
          Last {events.length}
        </span>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {events.map((ev, idx) => (
          <motion.div
            key={`${ev.timestamp}-${idx}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="flex items-center gap-3 px-3 py-2 hover:bg-surface-container/50 transition-colors text-sm"
          >
            {/* Type icon */}
            <div className="w-6 shrink-0">
              {ev.type === "scan" ? (
                <QrCode size={14} className="text-primary/60" />
              ) : (
                <MousePointerClick size={14} className="text-primary/60" />
              )}
            </div>

            {/* Time */}
            <span className="w-16 shrink-0 text-xs text-on-surface-variant/50 font-code-md tabular-nums">
              {timeAgo(new Date(ev.timestamp))}
            </span>

            {/* IP */}
            <span className="w-24 truncate text-xs text-on-surface font-code-md tabular-nums">
              {ev.ip ?? "—"}
            </span>

            {/* Geo */}
            <span className="w-20 truncate text-xs text-on-surface-variant/60 hidden sm:inline">
              {[ev.country, ev.city].filter(Boolean).join(", ") || "—"}
            </span>

            {/* Browser / OS */}
            <span className="w-28 truncate text-xs text-on-surface-variant/60 hidden md:inline">
              {[ev.browser, ev.os].filter(Boolean).join(" / ") || "—"}
            </span>

            {/* Type badge */}
            <span className="ml-auto text-[10px] uppercase font-label-caps tracking-wider">
              {ev.type === "scan" ? (
                <span className="text-primary/60">QR</span>
              ) : (
                <span className="text-on-surface-variant/40">Click</span>
              )}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
