"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Menghindari Hydration Error
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const applyTheme = () => {
      const root = window.document.documentElement;
      let isDark = false;

      if (mode === 'auto') {
        // Logika Deteksi Waktu Realtime
        const currentHour = new Date().getHours();
        // Jika jam 18:00 ke atas ATAU jam 05:59 ke bawah, maka malam (dark)
        isDark = currentHour >= 18 || currentHour < 6;
      } else {
        isDark = mode === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(); // Terapkan saat komponen dimuat atau mode berubah

    // Jika mode auto, pasang interval untuk mengecek perubahan jam setiap menit
    let interval: NodeJS.Timeout;
    if (mode === 'auto') {
      interval = setInterval(applyTheme, 60000); // 60.000 ms = 1 menit
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, mounted]);

  // Render kosong sejenak sebelum mounted agar tidak kedap-kedip (flashing)
  if (!mounted) return <div className="invisible h-screen">{children}</div>;

  return <>{children}</>;
}