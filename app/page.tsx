"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Link as LinkIcon,
  Copy,
  Trash2,
  ArrowRight,
  Sparkles,
  Github,
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";

interface UrlData {
  code: string;
  longUrl: string;
  shortUrl: string;
  createdAt: number;
}

export default function Home() {
  const [longUrl, setLongUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [mounted, setMounted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;

    setIsLoading(true);
    try {
      const res = await axios.post("/api/shorten", { longUrl });
      const data = res.data;

      const newUrl: UrlData = {
        code: data.code,
        longUrl: longUrl,
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

  const handleDelete = async (code: string) => {
    // Optimistic update
    const oldUrls = [...urls];
    setUrls((prev) => prev.filter((u) => u.code !== code));

    try {
      await axios.delete(`/api/urls/${code}`);
      toast.info("URL deleted.");
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Failed to delete";
      toast.error(message);
      setUrls(oldUrls); // Revert on error
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-linear-to-br from-orange-500 to-emerald-600 p-2 rounded-lg text-white">
              <LinkIcon size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-orange-600 to-emerald-600 dark:from-orange-400 dark:to-emerald-400">
              ShortLink
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <Github size={20} />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Shorten Your Links, <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-500 via-amber-500 to-emerald-500">
                Expand Your Reach
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              A modern, fast, and secure URL shortener built for performance.
              Paste your long link below and get a short one instantly.
            </p>
          </motion.div>

          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-linear-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center bg-white dark:bg-gray-900 rounded-xl p-2 shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="pl-4 text-gray-400">
                <LinkIcon size={20} />
              </div>
              <input
                type="url"
                placeholder="Paste your long URL here..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-4 py-3 text-lg w-full outline-none"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-linear-to-r from-orange-600 to-emerald-600 hover:from-orange-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                  <>
                    Shorten <Sparkles size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </section>

        {/* URL List */}
        <section className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
              Your Recent Links
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {urls.length} links
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {urls.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
                    <LinkIcon size={32} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No links shortened yet. Try one above!
                  </p>
                </motion.div>
              ) : (
                urls.map((url) => (
                  <motion.div
                    key={url.code}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <a
                            href={url.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xl font-bold text-orange-600 dark:text-orange-400 hover:underline truncate"
                          >
                            {url.shortUrl}
                          </a>
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {new Date(url.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                          <ArrowRight size={14} className="shrink-0" />
                          {url.longUrl}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copyToClipboard(url.shortUrl)}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(url.code)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete link"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
