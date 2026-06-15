"use client";

import { useState, useEffect, useRef } from "react";
import { MousePointerClick, QrCode } from "lucide-react";

interface StatsCardProps {
  value: number;
  label: string;
}

function AnimatedValue({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const duration = 800;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    prevValue.current = end;
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <p className="font-headline-lg text-headline-lg-mobile text-on-surface tabular-nums">
      {display.toLocaleString()}
    </p>
  );
}

export function StatsCard({ value, label }: StatsCardProps) {
  return (
    <div className="border border-outline-variant/20 p-5 bg-surface-container/50">
      <div className="flex items-center gap-3 mb-3">
        {label === "Clicks" ? (
          <MousePointerClick size={18} className="text-primary" />
        ) : (
          <QrCode size={18} className="text-primary" />
        )}
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
      </div>
      <AnimatedValue value={value} />
    </div>
  );
}
