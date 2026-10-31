import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Owly.AI - Your AI Browser Companion for Forms & Web",
  description:
    "Understand any page, fill forms with guidance, and catch mistakes before you submit. Private by design, powered by Baseten Muse Spark Open.",
  keywords: [
    "Owly.AI",
    "Baseten Muse Spark Open",
    "AI Browser Companion",
    "Form Assistant",
    "LPDP Form Coach",
    "Visa Assistant",
    "Accessibility Hub",
  ],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/owly.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900 selection:bg-blue-500/10 selection:text-blue-700">
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
