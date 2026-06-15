"use client";

import { TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { ChartType, RangeKey } from "@/types/analytics";
import { RANGES } from "@/constants/analytics";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AnalyticsChartProps {
  series: ApexOptions["series"];
  options: ApexOptions;
  rangeKey: RangeKey;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}

export function AnalyticsChart({
  series,
  options,
  rangeKey,
  chartType,
  onChartTypeChange,
}: AnalyticsChartProps) {
  return (
    <div className="border border-outline-variant/20 p-4 sm:p-5 bg-surface-container/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Performance
          </h4>
          <p className="text-[11px] text-outline-variant font-label-caps uppercase tracking-wider mt-0.5">
            {RANGES[rangeKey].humanLabel}
          </p>
        </div>
        <div className="flex bg-surface-container-high/50 rounded p-0.5 border border-outline-variant/20 self-start">
          {(["area", "bar", "line"] as ChartType[]).map((type) => (
            <button
              key={type}
              onClick={() => onChartTypeChange(type)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all capitalize ${
                chartType === type
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 sm:h-80 w-full">
        <Chart
          options={options}
          series={series}
          type={chartType}
          height={330}
          width="100%"
        />
      </div>
    </div>
  );
}
