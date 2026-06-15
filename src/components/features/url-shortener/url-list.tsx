"use client";

import { motion } from "framer-motion";
import {
  Link,
  Copy,
  Trash2,
  BarChart3,
  QrCode,
  Check,
  ChevronRight,
} from "lucide-react";

import type { UrlData } from "@/types/common";

export type { UrlData };

/* ─── Animation Variants ─── */
const springEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: springEase },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

/* ─── Props ─── */
interface UrlListProps {
  urls: UrlData[];
  copiedCode: string | null;
  onCopy: (text: string, code: string) => void;
  onAnalytics: (code: string) => void;
  onQrCode: (url: string) => void;
  onDelete: (code: string) => void;
  onShortenAnother: () => void;
}

/* ─── Component ─── */
export function UrlList({
  urls,
  copiedCode,
  onCopy,
  onAnalytics,
  onQrCode,
  onDelete,
  onShortenAnother,
}: UrlListProps) {
  return (
    <section
      id="activity"
      className="py-margin-desktop bg-surface-container-lowest border-t border-outline-variant/15"
    >
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Recent Activity
          </h2>
          <div className="hidden sm:flex items-center gap-3">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              {urls.length > 0 ? `${urls.length} links` : "No links yet"}
            </span>
            {urls.length > 0 && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        </motion.div>

        {urls.length === 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center py-20 border border-dashed border-outline-variant/20 rounded"
          >
            <Link
              size={40}
              strokeWidth={1}
              className="mx-auto mb-4 text-outline-variant"
            />
            <p className="text-on-surface-variant font-body-lg text-body-lg">
              No links yet — shorten one above.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="overflow-x-auto"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-4 pr-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Original Link
                  </th>
                  <th className="py-4 pr-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Short Link
                  </th>
                  <th className="py-4 pr-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">
                    Date
                  </th>
                  <th className="py-4 pr-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="font-code-md text-code-md text-on-surface">
                {urls.map((url) => (
                  <motion.tr
                    key={url.code}
                    variants={fadeUp}
                    className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors group"
                  >
                    <td className="py-5 pr-4 truncate max-w-[200px] sm:max-w-[300px] text-on-surface-variant/70">
                      {url.longUrl}
                    </td>
                    <td className="py-5 pr-4 text-primary">
                      <a
                        href={url.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {url.shortUrl.replace(/https?:\/\//, "")}
                      </a>
                    </td>
                    <td className="py-5 pr-4 text-on-surface-variant/50 hidden sm:table-cell">
                      {new Date(url.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-1">
                        {[
                          {
                            icon: copiedCode === url.code ? Check : Copy,
                            label: "Copy",
                            action: () => onCopy(url.shortUrl, url.code),
                          },
                          {
                            icon: BarChart3,
                            label: "Analytics",
                            action: () => onAnalytics(url.code),
                          },
                          {
                            icon: QrCode,
                            label: "QR Code",
                            action: () => onQrCode(url.shortUrl),
                          },
                          {
                            icon: Trash2,
                            label: "Delete",
                            action: () => onDelete(url.code),
                          },
                        ].map((btn) => (
                          <button
                            key={btn.label}
                            onClick={btn.action}
                            title={btn.label}
                            className={`p-2 rounded transition-all duration-200 hover:scale-105 active:scale-95 ${
                              btn.label === "Copy" && copiedCode === url.code
                                ? "text-primary bg-primary/10"
                                : btn.label === "Delete"
                                  ? "text-outline-variant hover:text-error hover:bg-error-container/10"
                                  : "text-outline-variant hover:text-primary hover:bg-primary/10"
                            }`}
                          >
                            <btn.icon size={15} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {urls.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-10 text-center"
          >
            <button
              onClick={onShortenAnother}
              className="text-primary font-label-caps text-label-caps uppercase flex items-center gap-2 mx-auto hover:gap-4 transition-all tracking-widest"
            >
              Shorten Another <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
