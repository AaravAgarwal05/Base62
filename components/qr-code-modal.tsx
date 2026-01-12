"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export function QRCodeModal({ isOpen, onClose, url }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 300,
      height: 300,
      type: "svg",
      data: `${url}?source=qr`,
      image: "/a&a-logo.png",
      dotsOptions: {
        color: "#ea580c",
        type: "extra-rounded",
        gradient: {
          type: "linear",
          rotation: 45,
          colorStops: [
            { offset: 0, color: "#ea580c" }, // orange-600
            { offset: 1, color: "#059669" }, // emerald-600
          ],
        },
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
        imageSize: 0.4,
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#ea580c",
      },
      cornersDotOptions: {
        type: "dot",
        color: "#059669",
      },
    });

    setQrCode(qr);
  }, []);

  useEffect(() => {
    if (qrCode && isOpen && ref.current) {
      qrCode.update({
        data: `${url}?source=qr`,
      });
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
      qrCode.download({
        name: "qrcode",
        extension: "png",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-orange-600 to-emerald-600 dark:from-orange-400 dark:to-emerald-400">
                QR Code
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100">
                <div
                  ref={ref}
                  className="overflow-hidden rounded-lg mx-auto flex justify-center"
                />
              </div>

              <div className="w-full flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy URL"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-opacity font-medium text-sm"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
