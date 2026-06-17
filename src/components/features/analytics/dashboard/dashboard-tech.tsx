"use client";

import { motion } from "framer-motion";
import { Monitor, Cpu, Smartphone } from "lucide-react";

interface TechItem {
  label: string;
  count: number;
}

function TechBar({ label, count, maxCount }: TechItem & { maxCount: number }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3 group">
      <span className="w-28 truncate text-sm text-on-surface font-code-md text-code-md">
        {label}
      </span>
      <div className="flex-1 h-5 bg-surface-container-high/50 relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 bg-primary/15 border-r border-primary/30"
        />
      </div>
      <span className="w-10 text-right text-sm text-on-surface-variant font-code-md text-code-md tabular-nums">
        {count}
      </span>
    </div>
  );
}

interface TechSectionProps {
  browsers: Array<{ browser: string | null; count: number }>;
  oss: Array<{ os: string | null; count: number }>;
  devices: Array<{ device: string | null; count: number }>;
}

export function TechSection({ browsers, oss, devices }: TechSectionProps) {
  const hasData = browsers.length > 0 || oss.length > 0 || devices.length > 0;

  if (!hasData) {
    return (
      <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
        <div className="flex items-center gap-2 mb-4">
          <Monitor size={16} className="text-primary" />
          <h3 className="font-title-md text-title-md text-on-surface">
            Technology
          </h3>
        </div>
        <p className="text-sm text-on-surface-variant/50">
          No browser / OS data yet.
        </p>
      </div>
    );
  }

  const maxBrowser = Math.max(...browsers.map((b) => b.count), 1);
  const maxOs = Math.max(...oss.map((o) => o.count), 1);
  const maxDevice = Math.max(...devices.map((d) => d.count), 1);

  return (
    <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
      <div className="flex items-center gap-2 mb-5">
        <Monitor size={16} className="text-primary" />
        <h3 className="font-title-md text-title-md text-on-surface">
          Technology
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Browsers */}
        <div>
          <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Monitor size={12} /> Browsers
          </h4>
          <div className="space-y-1.5">
            {browsers.slice(0, 8).map((b) => (
              <TechBar
                key={b.browser ?? "unknown"}
                label={b.browser ?? "Unknown"}
                count={b.count}
                maxCount={maxBrowser}
              />
            ))}
            {browsers.length === 0 && (
              <p className="text-xs text-on-surface-variant/40">No data</p>
            )}
          </div>
        </div>

        {/* OS */}
        <div>
          <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Cpu size={12} /> Operating Systems
          </h4>
          <div className="space-y-1.5">
            {oss.slice(0, 8).map((o) => (
              <TechBar
                key={o.os ?? "unknown"}
                label={o.os ?? "Unknown"}
                count={o.count}
                maxCount={maxOs}
              />
            ))}
            {oss.length === 0 && (
              <p className="text-xs text-on-surface-variant/40">No data</p>
            )}
          </div>
        </div>

        {/* Devices */}
        <div>
          <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Smartphone size={12} /> Device Types
          </h4>
          <div className="space-y-1.5">
            {/* Map null/undefined to "Desktop" since that's what UA parser returns for desktop */}
            {devices.slice(0, 8).map((d) => (
              <TechBar
                key={d.device ?? "desktop"}
                label={
                  d.device
                    ? d.device.charAt(0).toUpperCase() + d.device.slice(1)
                    : "Desktop"
                }
                count={d.count}
                maxCount={maxDevice}
              />
            ))}
            {devices.length === 0 && (
              <p className="text-xs text-on-surface-variant/40">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
