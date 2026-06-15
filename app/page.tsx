"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import {
  Link,
  Copy,
  Trash2,
  ArrowRight,
  Sparkles,
  QrCode,
  BarChart3,
  Zap,
  Globe,
  Shield,
  Infinity,
  ExternalLink,
  Check,
  ChevronRight,
  Tag,
  Lock,
  ChartNoAxesColumn,
  MousePointerClick,
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { QRCodeModal } from "../components/qr-code-modal";
import { AnalyticsModal } from "../components/analytics-modal";
import { CircularLoader } from "../components/circular-loader";

/* ─── Types ─── */
interface UrlData {
  code: string;
  longUrl: string;
  shortUrl: string;
  createdAt: number;
}

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

const bentoFeatures = [
  {
    icon: ChartNoAxesColumn,
    title: "Advanced Analytics Dashboards",
    desc: "Deep dive into geography, device types, and referrers with our monochromatic reporting interface.",
    size: "large",
    chart: true,
  },
  {
    icon: Tag,
    title: "Custom Aliases",
    desc: "Secure bespoke brand domains to ensure every click builds trust with your audience.",
    size: "small",
    link: true,
  },
  {
    icon: Lock,
    title: "Password Protection",
    desc: "Gate sensitive content behind elegant password screens with expiring credentials.",
    size: "small",
  },
  {
    icon: Globe,
    title: "Global CDN Redirection",
    desc: "Industry-leading redirection speeds using our high-end edge computing nodes across the globe.",
    size: "wide",
  },
];

/* ─── Component ─── */
export default function Home() {
  const [longUrl, setLongUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null);
  const [activeAnalyticsCode, setActiveAnalyticsCode] = useState<string | null>(
    null
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ─── Load saved URLs ─── */
  useEffect(() => {
    setMounted(true);
    const savedUrls = localStorage.getItem("my_urls");
    if (savedUrls) {
      try {
        setUrls(JSON.parse(savedUrls));
      } catch (e) {
        console.error("Failed to parse urls", e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("my_urls", JSON.stringify(urls));
    }
  }, [urls, mounted]);

  /* ─── Actions ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;

    setIsLoading(true);
    try {
      const res = await axios.post("/api/shorten", { longUrl });
      const data = res.data;

      const newUrl: UrlData = {
        code: data.code,
        longUrl,
        shortUrl: data.shortUrl,
        createdAt: Date.now(),
      };

      setUrls((prev) => [newUrl, ...prev]);
      setLongUrl("");
      toast.success("URL shortened successfully!");
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = useCallback(
    async (code: string) => {
      const oldUrls = [...urls];
      setUrls((prev) => prev.filter((u) => u.code !== code));
      try {
        await axios.delete(`/api/urls/${code}`);
        toast.info("URL deleted.");
      } catch (error: any) {
        const message =
          error.response?.data?.error || error.message || "Failed to delete";
        toast.error(message);
        setUrls(oldUrls);
      }
    },
    [urls]
  );

  const copyToClipboard = async (text: string, code: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(code);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const focusInput = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
          {/* ════════════════════════════════════════════════
               HEADER
               ════════════════════════════════════════════════ */}
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
                  onClick={focusInput}
                  className="bg-primary text-on-primary px-6 py-2 rounded hover:brightness-110 active:opacity-80 active:scale-95 transition-all font-label-caps text-label-caps uppercase tracking-wider"
                >
                  Shorten Now
                </button>
              </div>
            </nav>
          </motion.header>

          {/* ════════════════════════════════════════════════
               HERO
               ════════════════════════════════════════════════ */}
          <section className="relative min-h-[85vh] flex flex-col items-center justify-center py-margin-desktop px-margin-mobile md:px-margin-desktop overflow-hidden">
            {/* Architectural lines */}
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

              {/* Glass Input */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: springEase, delay: 0.45 }}
                className="glass-panel glow p-2 md:p-4 rounded-xl max-w-3xl mx-auto"
              >
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col md:flex-row gap-4 items-stretch"
                >
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="url"
                      placeholder="Paste your long URL here..."
                      className="w-full bg-surface-container/50 border border-outline-variant/30 focus:border-primary px-6 py-4 font-code-md text-code-md text-on-surface placeholder:text-on-surface-variant/50 transition-all outline-none rounded"
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
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

              {/* Badges */}
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
              {/* Analytics Dashboard - Large */}
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
                {/* Mock Chart */}
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

              {/* Custom Aliases - Small */}
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

              {/* Password Protection - Small */}
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

              {/* Global CDN - Wide */}
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
                      {urls.map((url, index) => (
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
                            {new Date(url.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="py-5">
                            <div className="flex items-center gap-1">
                              {[
                                {
                                  icon:
                                    copiedCode === url.code ? Check : Copy,
                                  label: "Copy",
                                  action: () =>
                                    copyToClipboard(url.shortUrl, url.code),
                                },
                                {
                                  icon: BarChart3,
                                  label: "Analytics",
                                  action: () =>
                                    setActiveAnalyticsCode(url.code),
                                },
                                {
                                  icon: QrCode,
                                  label: "QR Code",
                                  action: () => setActiveQrUrl(url.shortUrl),
                                },
                                {
                                  icon: Trash2,
                                  label: "Delete",
                                  action: () => handleDelete(url.code),
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
                    onClick={focusInput}
                    className="text-primary font-label-caps text-label-caps uppercase flex items-center gap-2 mx-auto hover:gap-4 transition-all tracking-widest"
                  >
                    Shorten Another{" "}
                    <ChevronRight size={14} />
                  </button>
                </motion.div>
              )}
            </div>
          </section>

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

          {/* ════════════════════════════════════════════════
               FOOTER
               ════════════════════════════════════════════════ */}
          <footer className="bg-surface-container-lowest w-full mt-auto border-t border-outline-variant/10">
            <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-10 max-w-container-max mx-auto gap-6">
              <div className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">
                Base62
              </div>
              <div className="flex flex-wrap justify-center gap-6 font-body-sm text-body-sm">
                <span className="text-on-tertiary-fixed-variant hover:text-on-surface transition-colors duration-200 cursor-default">
                  Precision Links
                </span>
                <span className="text-on-tertiary-fixed-variant hover:text-on-surface transition-colors duration-200 cursor-default">
                  Gold Standard
                </span>
                <span className="text-on-tertiary-fixed-variant hover:text-on-surface transition-colors duration-200 cursor-default">
                  Built with &hearts;
                </span>
              </div>
              <div className="font-body-sm text-body-sm text-secondary text-center md:text-right">
                &copy; {new Date().getFullYear()} Base62. All rights reserved.
              </div>
            </div>
          </footer>

          {/* ════════════════════════════════════════════════
               MODALS
               ════════════════════════════════════════════════ */}
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
