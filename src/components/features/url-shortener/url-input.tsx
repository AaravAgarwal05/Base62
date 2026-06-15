"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

interface UrlInputProps {
  longUrl: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const springEase = [0.22, 1, 0.36, 1] as const;

export const UrlInput = forwardRef<HTMLInputElement, UrlInputProps>(
  function UrlInput({ longUrl, isLoading, onChange, onSubmit }, ref) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: springEase, delay: 0.45 }}
          className="glass-panel glow p-2 md:p-4 rounded-xl max-w-3xl mx-auto"
        >
          <form
            onSubmit={onSubmit}
            className="flex flex-col md:flex-row gap-4 items-stretch"
          >
            <div className="flex-1 relative">
              <input
                ref={ref}
                type="url"
                placeholder="Paste your long URL here..."
                className="w-full bg-surface-container/50 border border-outline-variant/30 focus:border-primary px-6 py-4 font-code-md text-code-md text-on-surface placeholder:text-on-surface-variant/50 transition-all outline-none rounded"
                value={longUrl}
                onChange={(e) => onChange(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-wider rounded transition-all active:scale-95 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-on-primary/30 border-t-on-primary" />
              ) : (
                <>
                  Shorten Now
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: springEase, delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider"
        >
          <span className="flex items-center gap-2">
            <Check size={14} className="text-primary" />
            Unlimited Analytics
          </span>
          <span className="flex items-center gap-2">
            <Check size={14} className="text-primary" />
            Custom Aliases
          </span>
          <span className="flex items-center gap-2">
            <Check size={14} className="text-primary" />
            Enterprise Security
          </span>
        </motion.div>
      </>
    );
  }
);
