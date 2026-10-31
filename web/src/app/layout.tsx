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
    "Understand any page, fill forms with guidance, and catch mistakes before you submit. Private by design, powered by Muse Spark",
  keywords: [
    "Owly.AI",
    "Meta Global AI Hackathon",
    "Form Assistant",
    "LPDP Form Coach",
    "Visa Assistant",
    "Accessibility Hub",
  ],
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
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900 selection:bg-blue-500/10 selection:text-blue-700">
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
