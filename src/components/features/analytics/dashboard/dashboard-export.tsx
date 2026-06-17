"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileCode } from "lucide-react";
import type { AnalyticsDashboardData } from "@/hooks/use-analytics-dashboard";

interface ExportProps {
  data: AnalyticsDashboardData;
  code: string;
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DashboardExport({ data, code }: ExportProps) {
  const [open, setOpen] = useState(false);

  const handleCSV = () => {
    const header = "Type,Timestamp,IP,Country,City,Referrer,Browser,OS,Device";
    const rows = data.recentEvents.map(
      (e) =>
        `${e.type},${e.timestamp},${e.ip ?? ""},${e.country ?? ""},${e.city ?? ""},"${e.referrer ?? ""}",${e.browser ?? ""},${e.os ?? ""},${e.device ?? ""}`,
    );
    download(
      `base62-${code}-events.csv`,
      [header, ...rows].join("\n"),
      "text/csv",
    );
    setOpen(false);
  };

  const handleJSON = () => {
    download(
      `base62-${code}-analytics.json`,
      JSON.stringify(
        {
          code,
          exportedAt: new Date().toISOString(),
          summary: {
            totalClicks: data.totalClicks,
            totalScans: data.totalScans,
            countries: data.stats.countries,
            referrers: data.stats.referrers,
            browsers: data.stats.browsers,
          },
          recentEvents: data.recentEvents,
        },
        null,
        2,
      ),
      "application/json",
    );
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-outline-variant hover:text-on-surface font-label-caps uppercase tracking-wider transition-colors"
        title="Export"
      >
        <Download size={14} />
        Export
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-outline-variant/20 shadow-lg min-w-[160px]">
            <button
              onClick={handleCSV}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
            >
              <FileSpreadsheet size={14} className="text-primary/60" />
              Export as CSV
            </button>
            <button
              onClick={handleJSON}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
            >
              <FileCode size={14} className="text-primary/60" />
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
