"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const TEXT = "BASE62 •  LOADING •  ";
const REPEATED = TEXT.repeat(4);

export function CircularLoader({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "done">("loading");
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const duration = 2200;
    const interval = 16;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      setProgress(Math.min((current / steps) * 100, 100));
      if (current >= steps) {
        clearInterval(timer);
        setPhase("done");
        setTimeout(() => onFinishRef.current(), 600);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []); // Intentionally no deps — runs once on mount

  return (
    <AnimatePresence>
      {phase === "loading" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* Circular Spinning Text */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-28 h-28 sm:w-32 sm:h-32"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f2ca50" />
                    <stop offset="100%" stopColor="#d4af37" />
                  </linearGradient>
                </defs>
                <path
                  id="circlePath"
                  d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text
                  fill="url(#loaderGrad)"
                  fontSize="8.2"
                  fontWeight="600"
                  letterSpacing="4"
                  fontFamily="JetBrains Mono, monospace"
                >
                  <textPath href="#circlePath" startOffset="0%">
                    {REPEATED}
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* Center Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-primary/10 border border-primary/30 flex items-center justify-center"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f2ca50"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-10 w-48 sm:w-56 max-w-xs">
            <div className="h-[1px] bg-outline-variant/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          <p className="mt-4 text-sm text-on-surface-variant/50 font-code-md tracking-[0.2em] uppercase">
            {progress < 50
              ? "Initializing"
              : progress < 80
                ? "Optimizing"
                : "Almost Ready"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
