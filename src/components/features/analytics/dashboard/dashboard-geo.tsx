"use client";

import { motion } from "framer-motion";
import { Globe, MapPin } from "lucide-react";

interface GeoItem {
  country: string | null;
  city: string | null;
  count: number;
}

interface GeoSectionProps {
  countries: Array<{ country: string | null; count: number }>;
  cities: Array<{ city: string | null; count: number }>;
}

function GeoBar({
  label,
  count,
  maxCount,
  icon,
}: {
  label: string;
  count: number;
  maxCount: number;
  icon: React.ReactNode;
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-5 shrink-0 text-outline-variant">{icon}</div>
      <span className="w-24 truncate text-sm text-on-surface font-code-md text-code-md">
        {label}
      </span>
      <div className="flex-1 h-6 bg-surface-container-high/50 relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 bg-primary/20 border-r border-primary/40"
        />
      </div>
      <span className="w-12 text-right text-sm text-on-surface-variant font-code-md text-code-md tabular-nums">
        {count}
      </span>
    </div>
  );
}

export function GeoSection({ countries, cities }: GeoSectionProps) {
  const hasData =
    countries.length > 0 || cities.length > 0;

  if (!hasData) {
    return (
      <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-primary" />
          <h3 className="font-title-md text-title-md text-on-surface">
            Geography
          </h3>
        </div>
        <p className="text-sm text-on-surface-variant/50">
          No geographic data yet.
        </p>
      </div>
    );
  }

  const maxCountry = Math.max(...countries.map((c) => c.count), 1);
  const maxCity = Math.max(...cities.map((c) => c.count), 1);

  return (
    <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
      <div className="flex items-center gap-2 mb-5">
        <Globe size={16} className="text-primary" />
        <h3 className="font-title-md text-title-md text-on-surface">
          Geography
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Countries */}
        <div>
          <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-3">
            Countries
          </h4>
          <div className="space-y-1.5">
            {countries.slice(0, 10).map((c) => (
              <GeoBar
                key={c.country ?? "unknown"}
                label={c.country ?? "Unknown"}
                count={c.count}
                maxCount={maxCountry}
                icon={<Globe size={14} />}
              />
            ))}
            {countries.length === 0 && (
              <p className="text-xs text-on-surface-variant/40">No data</p>
            )}
          </div>
        </div>

        {/* Cities */}
        <div>
          <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-3">
            Cities
          </h4>
          <div className="space-y-1.5">
            {cities.slice(0, 10).map((c) => (
              <GeoBar
                key={c.city ?? "unknown"}
                label={c.city ?? "Unknown"}
                count={c.count}
                maxCount={maxCity}
                icon={<MapPin size={14} />}
              />
            ))}
            {cities.length === 0 && (
              <p className="text-xs text-on-surface-variant/40">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
