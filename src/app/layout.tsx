import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CursorTrail } from "@/components/layout/cursor-trail";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Base62 | Elevate Your Digital Reach",
  description: "Gold standard URL shortener with sophisticated analytics for the discerning brand.",
  icons: {
    icon: "/a%26a-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${jetbrainsMono.variable} antialiased bg-background text-on-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <CursorTrail />
          <Toaster
            position="top-right"
            closeButton
            theme="dark"
            duration={3000}
            gap={12}
            offset={{ right: 20, top: 80 }}
            toastOptions={{
              className: "toast-premium",
              style: {
                fontFamily: "Geist, sans-serif",
                fontSize: "14px",
                lineHeight: "1.4",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
