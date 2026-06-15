import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
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
          <Toaster
            position="top-right"
            closeButton
            theme="dark"
            duration={3000}
            toastOptions={{
              className: "toast-premium",
              style: {
                background: "rgba(32, 31, 31, 0.92)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(77, 70, 53, 0.3)",
                borderRadius: "12px",
                boxShadow:
                  "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(242,202,80,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
                fontFamily: "Geist, sans-serif",
                fontSize: "14px",
                lineHeight: "1.4",
                padding: "12px 44px 12px 18px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
