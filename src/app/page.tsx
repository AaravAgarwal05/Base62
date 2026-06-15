"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Link,
  Sparkles,
  BarChart3,
  Globe,
  Tag,
  Lock,
  ChartNoAxesColumn,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UrlInput } from "@/components/features/url-shortener/url-input";
import { UrlList } from "@/components/features/url-shortener/url-list";
import { QRCodeModal } from "@/components/features/qr-code/qr-code-modal";
import { AnalyticsModal } from "@/components/features/analytics/analytics-modal";
import { CircularLoader } from "@/components/layout/loader";
import { useUrlShortener } from "@/hooks/use-url-shortener";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: springEase },
  },
};

/* ─── Feature Data ─── */
const processSteps = [
  {
    icon: Link,
    title: "Input",
    desc: "Provide your destination URL with any specific UTM parameters you require.",
  },
  {
    icon: Sparkles,
    title: "Transform",
    desc: "Our engine generates a clean, aesthetic link that maintains your brand integrity.",
  },
  {
    icon: BarChart3,
    title: "Analyze",
    desc: "Monitor performance through our high-fidelity, real-time analytics suite.",
  },
];

/* ─── Component ─── */
export default function Home() {
  const [appReady, setAppReady] = useState(false);
  const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null);
  const [activeAnalyticsCode, setActiveAnalyticsCode] = useState<string | null>(
    null
  );

  const {
    urls,
    longUrl,
    isLoading,
    mounted,
    inputRef,
    setLongUrl,
    handleSubmit,
    handleDelete,
    focusInput,
  } = useUrlShortener();

  const { copiedCode, copyToClipboard } = useCopyToClipboard();

  if (!mounted) return null;

  return (
    <>
      {!appReady && <CircularLoader onFinish={() => setAppReady(true)} />}

      {appReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="min-h-screen bg-background text-on-surface flex flex-col"
        >
          <Header onShortenNow={focusInput} />

          {/* ════════════════════════════════════════════════
               HERO
               ════════════════════════════════════════════════ */}
          <section className="relative min-h-[85vh] flex flex-col items-center justify-center py-margin-desktop px-margin-mobile md:px-margin-desktop overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none border-x border-outline-variant/10 max-w-[1200px] mx-auto" />
            <div className="absolute inset-0 z-0 pointer-events-none border-x border-outline-variant/5 max-w-[600px] mx-auto" />

            <div className="relative z-10 max-w-container-max mx-auto text-center w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: springEase, delay: 0.15 }}
              >
                <span className="font-label-caps text-label-caps uppercase text-primary mb-6 block tracking-[0.15em]">
                  Precision Links
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: springEase, delay: 0.25 }}
                className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-8 max-w-4xl mx-auto leading-[1.1]"
              >
                Elevate Your Digital Reach.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: springEase, delay: 0.35 }}
                className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-16"
              >
                Experience the gold standard in link management. Sophisticated
                tracking for the discerning brand.
              </motion.p>

              <UrlInput
                ref={inputRef}
                longUrl={longUrl}
                isLoading={isLoading}
                onChange={setLongUrl}
                onSubmit={handleSubmit}
              />
            </div>
          </section>

          {/* ════════════════════════════════════════════════
               PROCESS SECTION
               ════════════════════════════════════════════════ */}
          <section
            id="process"
            className="py-margin-desktop bg-surface-container-lowest border-y border-outline-variant/15"
          >
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                className="text-center mb-16"
              >
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  The Process
                </h2>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="grid grid-cols-1 md:grid-cols-3 gap-gutter"
              >
                {processSteps.map((step) => (
                  <motion.div
                    key={step.title}
                    variants={scaleIn}
                    className="text-center group p-8 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors bg-surface/30"
                  >
                    <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                      <step.icon size={32} strokeWidth={1.2} />
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mb-4">
                      {step.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════
               BENTO FEATURES
               ════════════════════════════════════════════════ */}
          <section
            id="features"
            className="py-margin-desktop px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
            >
              <div className="max-w-xl">
                <span className="font-label-caps text-label-caps uppercase text-primary mb-4 block tracking-[0.15em]">
                  Capabilities
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  Refined features for power users.
                </h2>
              </div>
              <button
                onClick={focusInput}
                className="border border-outline text-on-surface px-6 py-2 font-label-caps text-label-caps uppercase hover:bg-surface-container hover:border-outline transition-all rounded tracking-wider"
              >
                Get Started
              </button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-12 gap-gutter"
            >
              <motion.div
                variants={scaleIn}
                className="md:col-span-8 bg-surface-container p-8 md:p-10 rounded border border-outline-variant/20 relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider">
                    Real-Time Data
                  </span>
                  <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mt-4 mb-6">
                    Advanced Analytics Dashboards
                  </h3>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                    Deep dive into geography, device types, and referrers with
                    our monochromatic reporting interface.
                  </p>
                </div>
                <div className="mt-8 h-40 bg-surface border border-outline-variant/20 rounded-t p-6 relative">
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-outline-variant/30" />
                  <div className="flex items-end h-full gap-4 px-4 pb-0">
                    {[30, 50, 45, 80, 60, 75].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 border transition-all duration-300 ${
                          i === 3
                            ? "bg-primary/20 border-primary/50"
                            : "bg-surface-container-high border-outline-variant/30"
                        }`}
                        style={{ height: `${h}%` }}
                      >
                        {i === 3 && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 font-code-md text-xs text-primary">
                            84%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="md:col-span-4 bg-surface-container-low p-8 md:p-10 rounded flex flex-col justify-between border border-outline-variant/20 group"
              >
                <div>
                  <Tag
                    size={36}
                    strokeWidth={1.2}
                    className="text-primary mb-8"
                  />
                  <h3 className="font-title-md text-title-md text-on-surface mb-4">
                    Custom Aliases
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Secure bespoke brand domains to ensure every click builds
                    trust with your audience.
                  </p>
                </div>
                <button
                  onClick={focusInput}
                  className="text-primary font-label-caps text-label-caps uppercase flex items-center gap-2 mt-12 hover:gap-4 transition-all tracking-wider"
                >
                  Learn More <ArrowRight size={14} />
                </button>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="md:col-span-4 bg-surface-container-low p-8 md:p-10 rounded border border-outline-variant/20"
              >
                <Lock
                  size={36}
                  strokeWidth={1.2}
                  className="text-primary mb-8"
                />
                <h3 className="font-title-md text-title-md text-on-surface mb-4">
                  Password Protection
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Gate sensitive content behind elegant password screens with
                  expiring credentials.
                </p>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="md:col-span-8 bg-surface-container-high p-8 md:p-10 rounded flex items-center border border-outline-variant/20 overflow-hidden relative group"
              >
                <div className="flex-1 z-10">
                  <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-4">
                    Global CDN Redirection
                  </h3>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                    Industry-leading redirection speeds using our high-end edge
                    computing nodes across the globe.
                  </p>
                </div>
                <div className="hidden md:block absolute right-[-20px] opacity-5">
                  <Globe size={240} strokeWidth={0.5} />
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* ════════════════════════════════════════════════
               ACTIVITY TABLE
               ════════════════════════════════════════════════ */}
          <UrlList
            urls={urls}
            copiedCode={copiedCode}
            onCopy={copyToClipboard}
            onAnalytics={(code) => setActiveAnalyticsCode(code)}
            onQrCode={(url) => setActiveQrUrl(url)}
            onDelete={handleDelete}
            onShortenAnother={focusInput}
          />

          {/* ════════════════════════════════════════════════
               CTA
               ════════════════════════════════════════════════ */}
          <section className="py-24 bg-surface border-t border-outline-variant/15 relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none border-x border-outline-variant/5 max-w-[800px] mx-auto" />
            <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
              >
                <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-6">
                  Ready to refine your presence?
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-xl mx-auto">
                  Join thousands managing their digital landscape with Base62.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <button
                    onClick={focusInput}
                    className="bg-primary text-on-primary px-10 py-4 rounded font-label-caps text-label-caps uppercase tracking-widest hover:brightness-110 transition-all w-full md:w-auto"
                  >
                    Start for Free
                  </button>
                  <a
                    href="https://github.com/AaravAgarwal05"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-transparent border border-outline text-on-surface px-10 py-4 rounded font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-container transition-all w-full md:w-auto inline-block text-center"
                  >
                    View on GitHub
                  </a>
                </div>
              </motion.div>
            </div>
          </section>

          <Footer />

          <QRCodeModal
            isOpen={!!activeQrUrl}
            onClose={() => setActiveQrUrl(null)}
            url={activeQrUrl || ""}
          />
          <AnalyticsModal
            isOpen={!!activeAnalyticsCode}
            onClose={() => setActiveAnalyticsCode(null)}
            code={activeAnalyticsCode || ""}
          />
        </motion.div>
      )}
    </>
  );
}
