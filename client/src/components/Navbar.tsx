"use client";

import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Globe, Sun, Moon, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { currency, setCurrency } = useCurrencyStore();
  const { mode, setMode } = useThemeStore();

  const toggleTheme = () => {
    if (mode === 'auto') setMode('light');
    else if (mode === 'light') setMode('dark');
    else setMode('auto');
  };

  return (
    // [UPDATE] Padding dikecilkan di HP (px-3), kembali normal di laptop (sm:px-6)
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 shadow-sm z-10 transition-colors duration-300">
      
      {/* BAGIAN KIRI: Judul */}
      <div className="flex items-center gap-2">
        {/* [UPDATE] Teks panjang disembunyikan di layar HP (hidden), muncul di tablet/laptop (sm:block) */}
        <h2 className="hidden sm:block text-lg font-semibold text-slate-800 dark:text-white transition-colors">
          Sistem Analisis Kebijakan Ekonomi
        </h2>
        {/* [OPSIONAL UX] Teks singkat khusus layar HP agar tidak kosong melompong */}
        <h2 className="block sm:hidden text-base font-bold text-slate-800 dark:text-white transition-colors">
          <span className="text-indigo-500">Eco</span>DSS
        </h2>
      </div>

      {/* BAGIAN KANAN: Tools */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
        
        {/* Toggle Theme Interaktif */}
        <button 
          onClick={toggleTheme}
          // [UPDATE] Ukuran disusutkan di HP (w-8 h-8), normal di laptop (sm:w-10 sm:h-10)
          className="relative shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors overflow-hidden"
          title={`Mode saat ini: ${mode.toUpperCase()}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* [UPDATE] Icon juga dikecilkan di HP */}
              {mode === 'light' && <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
              {mode === 'dark' && <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
              {mode === 'auto' && <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Toggle Konversi Kurs */}
        {/* [UPDATE] Gap dan padding disusutkan di HP */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          
          {/* [UPDATE] Tulisan "Kurs:" dihilangkan di HP untuk menghemat space */}
          <span className="hidden sm:inline text-sm font-medium text-slate-600 dark:text-slate-300">Kurs:</span>
          
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            // [UPDATE] Teks lebih kecil dan dibatasi lebarnya di HP
            className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer w-[60px] sm:w-auto text-ellipsis overflow-hidden"
          >
            <option value="IDR" className="text-black">IDR - Rupiah</option>
            <option value="USD" className="text-black">USD - US Dollar</option>
            <option value="AUD" className="text-black">AUD - Australian Dollar</option>
            <option value="GBP" className="text-black">GBP - British Pound</option>
          </select>
        </div>
      </div>
    </header>
  );
}