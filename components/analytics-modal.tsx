"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart2, MousePointer2, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Lazy load ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  className?: string;
}

type TimeRange = 7 | 30 | 90;
type ChartType = "bar" | "line";

export function AnalyticsModal({ isOpen, onClose, code }: AnalyticsModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(7);
  const [chartType, setChartType] = useState<ChartType>("bar");

  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({});

  useEffect(() => {
    if (isOpen && code) {
      fetchAnalytics(timeRange);
    }
  }, [isOpen, code, timeRange, chartType]);

  const fetchAnalytics = async (days: number) => {
    setLoading(true);
    try {
      console.log(`[Analytics] Fetching data for code: ${code}, days: ${days}`);
      const res = await axios.get(`/api/analytics/${code}?days=${days}`);
      console.log("[Analytics] API Response:", res.data);
      if (!res.data) {
        console.error("[Analytics] No data received from API");
        return;
      }
      setData(res.data);
      processChartData(res.data.history || [], days);
    } catch (error) {
      console.error("[Analytics] Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (history: any[], days: number) => {
    console.log("[Analytics] Processing history:", history.length, "items");

    // Helper to get consistent UTC date key
    const getDateKey = (date: Date) => {
      // Use UTC to avoid timezone issues
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Get today in UTC
    const getUTCToday = () => {
      const now = new Date();
      return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );
    };

    // Create buckets for the last N days (in UTC)
    const statsMap = new Map();
    const categories: string[] = [];
    const clicksData: number[] = [];
    const scansData: number[] = [];

    const utcToday = getUTCToday();

    const lastNDays = Array.from({ length: days }, (_, i) => {
      // Iterate backwards: Today, Yesterday, ...
      const d = new Date(utcToday);
      d.setUTCDate(d.getUTCDate() - (days - 1 - i));
      const key = getDateKey(d);

      // Format label
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const label =
        days > 30
          ? `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(
              d.getUTCDate()
            ).padStart(2, "0")}`
          : `${monthNames[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(
              2,
              "0"
            )}`;

      const item = {
        date: d,
        label: label,
        clicks: 0,
        scans: 0,
        key: key,
      };

      statsMap.set(key, item);
      return item;
    });

    console.log(
      "[Analytics] Date buckets created:",
      Array.from(statsMap.keys())
    );

    if (Array.isArray(history)) {
      history.forEach((event: any) => {
        try {
          const eventDate = new Date(event.timestamp);
          const key = getDateKey(eventDate);

          console.log(
            `[Analytics] Event: ${event.timestamp} -> UTC Key: ${key}, Type: ${event.type}`
          );

          const dayStat = statsMap.get(key);

          if (dayStat) {
            if (event.type === "scan") {
              dayStat.scans += 1;
            } else {
              dayStat.clicks += 1;
            }
          } else {
            console.warn("[Analytics] Event date not in range:", key);
          }
        } catch (e) {
          console.error("Date processing error", e);
        }
      });
    }

    // Convert map to arrays for ApexCharts
    lastNDays.forEach((day) => {
      categories.push(day.label);
      clicksData.push(day.clicks);
      scansData.push(day.scans);
    });

    console.log("[Analytics] Chart Categories:", categories);
    console.log("[Analytics] Clicks Data:", clicksData);
    console.log("[Analytics] Scans Data:", scansData);

    const newSeries = [
      {
        name: "Direct Clicks",
        data: clicksData,
      },
      {
        name: "QR Scans",
        data: scansData,
      },
    ];
    setChartSeries(newSeries);
    console.log("[Analytics] Series set:", newSeries);

    setChartOptions({
      chart: {
        id: "analytics-chart",
        toolbar: {
          show: false,
        },
        fontFamily: "inherit",
        zoom: {
          enabled: false,
        },
        background: "transparent",
        type: chartType, // Explicitly set type here too
      },
      theme: {
        mode: "light",
      },
      colors: ["#ea580c", "#059669"], // orange-600, emerald-600
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      fill: {
        type: chartType === "bar" ? "solid" : "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: "#f3f4f6", // gray-100 (update for dark mode in component logic if needed)
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        categories: categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: "#9ca3af", // gray-400
            fontSize: "12px",
          },
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "12px",
          },
          formatter: (value) => value.toFixed(0),
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        offsetY: -20,
        itemMargin: {
          horizontal: 10,
          vertical: 0,
        },
      },
      tooltip: {
        theme: "dark",
        style: {
          fontSize: "12px",
          fontFamily: "inherit",
        },
        y: {
          formatter: function (val) {
            return val + " visits";
          },
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: days > 30 ? "70%" : "50%",
        },
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BarChart2 className="text-orange-500" />
                Analytics Report
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center min-h-75">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                        <MousePointer2 size={20} />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Clicks
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {data?.totalClicks || 0}
                    </p>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <QrCode size={20} />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total QR Scans
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {data?.totalScans || 0}
                    </p>
                  </div>
                </div>

                {/* Chart Controls */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Performance
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Time Range Toggle */}
                      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                        {([7, 30, 90] as TimeRange[]).map((range) => (
                          <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                              timeRange === range
                                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-xs"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                          >
                            {range}d
                          </button>
                        ))}
                      </div>
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block"></div>
                      {/* Chart Type Toggle */}
                      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                        {(["bar", "line"] as ChartType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
                              chartType === type
                                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-xs"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-75 w-full">
                    {/* ApexChart Component */}
                    {(() => {
                      console.log(
                        "[Analytics Render] chartSeries:",
                        chartSeries
                      );
                      console.log(
                        "[Analytics Render] chartOptions:",
                        chartOptions
                      );
                      console.log("[Analytics Render] chartType:", chartType);
                      console.log(
                        "[Analytics Render] Has categories:",
                        chartOptions?.xaxis?.categories
                      );
                      return null;
                    })()}
                    {chartSeries.length > 0 &&
                    chartOptions?.xaxis?.categories ? (
                      <Chart
                        key={`${chartType}-${timeRange}`}
                        options={chartOptions}
                        series={chartSeries}
                        type={chartType}
                        height={300}
                        width="100%"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No chart data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
