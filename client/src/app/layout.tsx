import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ConditionalLayout from "@/components/ConditionalLayout"; // <-- Ini yang baru

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Tambahkan konfigurasi Viewport untuk mencegah zoom tidak sengaja di HP (Syarat PWA)
export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

// 2. Modifikasi Metadata bawaan menjadi identitas project EcoDSS milikmu
export const metadata: Metadata = {
  title: "EcoDSS - Simulasi Kebijakan Ekonomi",
  description: "Web App Model-Driven Decision Support System berbasis Hybrid Machine Learning",
  manifest: "/manifest.json", 
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EcoDSS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <ThemeProvider>
          {/* MainLayout diganti dengan jembatan pendeteksi URL kita */}
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}