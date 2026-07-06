"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import FeedbackWidget from "@/components/FeedbackWidget";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Bypass (Bebas Masuk) untuk halaman publik (Landing Page & Login)
    if (pathname === "/" || pathname === "/login") {
      setIsAuthorized(true);
      return;
    }

    // 2. SATPAM RUTE: Cek apakah user punya KTP
    const userId = localStorage.getItem("ecodss_user_id");
    
    if (!userId) {
      // Jika mencoba inject URL tanpa KTP, tendang ke login secara paksa
      router.replace("/login");
    } else {
      // Jika punya KTP, izinkan halaman dirender
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Efek Loading Transisi: Mencegah halaman Dashboard berkedip/bocor sedetik sebelum ditendang
  if (!isAuthorized && pathname !== "/" && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm font-medium">Memeriksa Hak Akses...</p>
      </div>
    );
  }

  // Aturan Tampilan
  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <>
      <MainLayout>{children}</MainLayout>
      <FeedbackWidget />
    </>
  );
}