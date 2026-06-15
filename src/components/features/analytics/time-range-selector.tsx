"use client";

import type { RangeKey } from "@/types/analytics";
import { RANGES, RANGE_GROUPS } from "@/constants/analytics";

interface TimeRangeSelectorProps {
  rangeKey: RangeKey;
  onChange: (key: RangeKey) => void;
}

export function TimeRangeSelector({
  rangeKey,
  onChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {RANGE_GROUPS.map((g) => (
        <div key={g.group} className="flex items-center gap-0.5">
          {g.keys.map((rk) => (
            <button
              key={rk}
              onClick={() => onChange(rk)}
              className={`px-2.5 py-1 text-[11px] font-label-caps tracking-wider uppercase rounded transition-all ${
                rangeKey === rk
                  ? "bg-primary text-on-primary"
                  : "text-outline-variant hover:text-on-surface"
              }`}
            >
              {RANGES[rk].label}
            </button>
          ))}
          <span className="w-px h-3 bg-outline-variant/20 mx-1 last:hidden" />
        </div>
      ))}
    </div>
  );
}
