"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check, QrCode, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const springEase = [0.34, 1.1, 0.55, 1] as const;

export function QRCodeModal({ isOpen, onClose, url }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 280,
      height: 280,
      type: "svg",
      data: `${url}?source=qr`,
      image: "/a&a-logo.png",
      dotsOptions: {
        color: "#d4af37",
        type: "extra-rounded",
        gradient: {
          type: "linear",
          rotation: 45,
          colorStops: [
            { offset: 0, color: "#f2ca50" },
            { offset: 1, color: "#d4af37" },
          ],
        },
      },
      backgroundOptions: { color: "#1c1b1b" },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 8,
        imageSize: 0.35,
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#f2ca50",
      },
      cornersDotOptions: {
        type: "dot",
        color: "#d4af37",
      },
      qrOptions: {
        errorCorrectionLevel: "M",
      },
    });

    setQrCode(qr);
  }, []);

  useEffect(() => {
    if (qrCode && isOpen && ref.current) {
      qrCode.update({ data: `${url}?source=qr` });
      ref.current.innerHTML = "";
      qrCode.append(ref.current);
    }
  }, [qrCode, url, isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    if (qrCode) {
      qrCode.download({ name: "qrcode", extension: "png" });
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

  // Short display URL
  const displayUrl = url.replace(/^https?:\/\//, "");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.4, ease: springEase }}
            className="relative bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 w-full max-w-sm shadow-2xl overflow-hidden"
          >
            {/* Subtle gold glow at top */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <QrCode size={18} className="text-primary" />
                </div>
                <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">
                  QR Code
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* ── QR Code ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: springEase }}
              className="flex flex-col items-center gap-5"
            >
              {/* QR Frame */}
              <div className="relative p-5 bg-surface-container-low rounded-xl border border-outline-variant/15">
                {/* Inner glow ring */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-primary/10 pointer-events-none" />
                <div
                  ref={ref}
                  className="overflow-hidden rounded-lg mx-auto flex justify-center"
                />
              </div>

              {/* ── URL Display ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-surface-container/70 rounded-lg border border-outline-variant/15 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ExternalLink size={13} className="text-primary shrink-0" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-code-md text-code-md text-primary hover:underline truncate"
                  >
                    {displayUrl}
                  </a>
                </div>
                <button
                  onClick={handleCopy}
                  className={`shrink-0 p-1.5 rounded transition-all duration-200 ${
                    copied
                      ? "text-primary bg-primary/10"
                      : "text-outline-variant opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10"
                  }`}
                  title="Copy link"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </motion.div>

              {/* ── Actions ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-full flex gap-3"
              >
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 font-label-caps text-label-caps uppercase tracking-wider text-sm ${
                    copied
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-outline-variant/25 text-on-surface-variant hover:border-outline-variant/50 hover:bg-surface-container active:scale-[0.98]"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 font-label-caps text-label-caps uppercase tracking-wider text-sm ${
                    downloaded
                      ? "bg-primary/10 border border-primary/30 text-primary"
                      : "bg-primary text-on-primary hover:brightness-110 active:scale-[0.98]"
                  }`}
                >
                  <Download size={14} />
                  {downloaded ? "Done" : "Download PNG"}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
