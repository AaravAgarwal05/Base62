"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { API_PREFIX, STORAGE_KEYS } from "@/constants/app";
import type { UrlData } from "@/types/common";

export function useUrlShortener() {
  const [longUrl, setLongUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ─── Load from localStorage ─── */
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.urls);
      if (saved) setUrls(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to parse urls", e);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEYS.urls, JSON.stringify(urls));
    }
  }, [urls, mounted]);

  /* ─── Submit new URL ─── */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // longUrl is captured via closure — use ref or check current value
    // We check via the state setter pattern below
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_PREFIX}/shorten`, { longUrl });
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
      const msg =
        error.response?.data?.error || error.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [longUrl]);

  /* ─── Delete URL with optimistic removal ─── */
  const handleDelete = useCallback(
    async (code: string) => {
      const oldUrls = [...urls];
      setUrls((prev) => prev.filter((u) => u.code !== code));
      try {
        await axios.delete(`${API_PREFIX}/urls/${code}`);
        toast.info("URL deleted.");
      } catch (error: any) {
        const msg =
          error.response?.data?.error || error.message || "Failed to delete";
        toast.error(msg);
        setUrls(oldUrls);
      }
    },
    [urls]
  );

  /* ─── Focus input field ─── */
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return {
    urls,
    longUrl,
    isLoading,
    mounted,
    inputRef,
    setLongUrl,
    handleSubmit,
    handleDelete,
    focusInput,
  };
}
