"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";

interface IpItem {
  ip: string | null;
  count: number;
  country: string | null;
  city: string | null;
  region: string | null;
}

interface IpTableProps {
  ips: IpItem[];
}

export function IpTable({ ips }: IpTableProps) {
  if (ips.length === 0) {
    return (
      <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-primary" />
          <h3 className="font-title-md text-title-md text-on-surface">
            IP Addresses
          </h3>
        </div>
        <p className="text-sm text-on-surface-variant/50">
          No IP data yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/20 p-5 bg-surface-container/30">
      <div className="flex items-center gap-2 mb-4">
        <Globe size={16} className="text-primary" />
        <h3 className="font-title-md text-title-md text-on-surface">
          IP Addresses
        </h3>
        <span className="text-xs text-on-surface-variant/40 ml-auto">
          {ips.length} unique
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="pb-2 pr-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-xs">
                IP
              </th>
              <th className="pb-2 pr-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-xs hidden sm:table-cell">
                Country
              </th>
              <th className="pb-2 pr-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-xs hidden sm:table-cell">
                City
              </th>
              <th className="pb-2 pr-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-xs">
                Visits
              </th>
            </tr>
          </thead>
          <tbody>
            {ips.slice(0, 50).map((ip) => (
              <motion.tr
                key={ip.ip ?? "unknown"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-outline-variant/5 hover:bg-surface-container/50 transition-colors"
              >
                <td className="py-2.5 pr-3 text-sm text-on-surface font-code-md text-code-md tabular-nums">
                  {ip.ip ?? "Unknown"}
                </td>
                <td className="py-2.5 pr-3 text-sm text-on-surface-variant hidden sm:table-cell">
                  {ip.country ?? "—"}
                </td>
                <td className="py-2.5 pr-3 text-sm text-on-surface-variant hidden sm:table-cell">
                  {ip.city ?? "—"}
                </td>
                <td className="py-2.5 text-sm text-on-surface-variant tabular-nums">
                  {ip.count}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
