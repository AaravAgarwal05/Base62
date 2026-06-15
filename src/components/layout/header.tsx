"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const springEase = [0.22, 1, 0.36, 1] as const;

interface HeaderProps {
  onShortenNow: () => void;
}

export function Header({ onShortenNow }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: springEase }}
      className="bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/15"
    >
      <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <div className="font-headline-lg text-headline-lg text-primary tracking-tighter">
          Base62
        </div>
        <div className="hidden md:flex items-center gap-gutter font-title-md text-title-md">
          <a
            href="#process"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#features"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300"
          >
            Capabilities
          </a>
          <a
            href="#activity"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300"
          >
            Activity
          </a>
        </div>
        <div className="flex items-center gap-gutter font-title-md text-title-md">
          <ThemeToggle />
          <button
            onClick={onShortenNow}
            className="bg-primary text-on-primary px-6 py-2 rounded hover:brightness-110 active:opacity-80 active:scale-95 transition-all font-label-caps text-label-caps uppercase tracking-wider"
          >
            Shorten Now
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
