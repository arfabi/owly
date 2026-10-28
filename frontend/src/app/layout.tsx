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
  title: "Savvy.AI — Pahami. Isi. Periksa. Sebelum Anda Menekan Submit.",
  description:
    "Asisten browser cerdas berbasis Compound Multi-Agent System (Meta Muse Spark 1.3) untuk warga dan pendaftar formulir publik — bimbingan juknis RAG resmi, autofill aman Zero-Knowledge, dan audit deterministik.",
  keywords: [
    "Savvy.AI",
    "Meta Global AI Hackathon",
    "Form Assistant",
    "LPDP Form Coach",
    "Visa Assistant",
    "Accessibility Hub",
  ],
};

import { LanguageProvider } from "@/lib/i18n/LanguageContext";

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
      </body>
    </html>
  );
}
