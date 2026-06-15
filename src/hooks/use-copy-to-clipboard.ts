"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useCopyToClipboard(timeoutMs = 2000) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, code: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(code);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedCode(null), timeoutMs);
  }, [timeoutMs]);

  return { copiedCode, copyToClipboard };
}
