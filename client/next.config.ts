import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Konfigurasi PWA yang dioptimalkan
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // PWA hanya aktif saat production (build/deploy)
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

// Konfigurasi bawaan Next.js
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Menghilangkan error bentrokan Turbopack vs Webpack (Sesuai panduan Next 16)
  turbopack: {}, 
};

// Bungkus nextConfig dengan PWA
export default withPWA(nextConfig);