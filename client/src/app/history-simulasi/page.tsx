"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, Trash2, ArrowRight, TrendingUp, AlertCircle } from "lucide-react";

interface HistoryRecord {
  id: string;
  tanggal: string;
  model: string;
  skenario: {
    bi_rate: number;
    kurs_usd: number;
    harga_minyak_brent: number;
    jumlah_uang_beredar_m2: number;
    // Kolom lain sengaja tidak ditampilkan semua agar tabel tidak terlalu sesak
  };
  hasil_inflasi: number;
}

export default function HistorySimulasiPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Mencegah error Hydration di Next.js saat membaca localStorage
  useEffect(() => {
    setIsClient(true);
    const userId = localStorage.getItem("ecodss_user_id") || "guest";
    const storageKey = `eco_dss_history_${userId}`;
    
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      setHistory(JSON.parse(savedData));
    }
  }, []);

  const clearHistory = () => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh riwayat simulasi?")) {
      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      localStorage.removeItem(`eco_dss_history_${userId}`);
      setHistory([]);
    }
  };

  const deleteItem = (id: string) => {
    const userId = localStorage.getItem("ecodss_user_id") || "guest";
    const storageKey = `eco_dss_history_${userId}`;
    
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  if (!isClient) return null; // Menunggu render di sisi client selesai

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl shrink-0 mt-1 sm:mt-0">
          <History className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">Riwayat Simulasi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Bandingkan hasil dari berbagai skenario kebijakan yang telah Anda jalankan.
          </p>
        </div>
      </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200 dark:border-red-800"
          >
            <Trash2 className="w-4 h-4" /> Bersihkan Riwayat
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <AlertCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Belum Ada Riwayat</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Silakan jalankan simulasi di menu <strong>Simulasi Skenario</strong> terlebih dahulu untuk melihat rekam jejaknya di sini.</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
                  <th className="p-4 font-semibold whitespace-nowrap">Waktu Eksekusi</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Model AI</th>
                  <th className="p-4 font-semibold whitespace-nowrap bg-blue-50/50 dark:bg-blue-900/10">BI Rate</th>
                  <th className="p-4 font-semibold whitespace-nowrap bg-blue-50/50 dark:bg-blue-900/10">Kurs USD</th>
                  <th className="p-4 font-semibold whitespace-nowrap bg-blue-50/50 dark:bg-blue-900/10">Minyak Brent</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-center bg-emerald-50/50 dark:bg-emerald-900/10">Proyeksi Inflasi</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300 text-sm">
                    <td className="p-4 whitespace-nowrap">{item.tanggal}</td>
                    <td className="p-4 whitespace-nowrap font-medium text-indigo-600 dark:text-indigo-400">
                      {item.model === 'random_forest' ? 'Random Forest' : 'XGBoost'}
                    </td>
                    <td className="p-4 whitespace-nowrap bg-blue-50/30 dark:bg-blue-900/5 font-medium">{item.skenario.bi_rate}%</td>
                    <td className="p-4 whitespace-nowrap bg-blue-50/30 dark:bg-blue-900/5">Rp {item.skenario.kurs_usd.toLocaleString('id-ID')}</td>
                    <td className="p-4 whitespace-nowrap bg-blue-50/30 dark:bg-blue-900/5">${item.skenario.harga_minyak_brent}</td>
                    <td className="p-4 whitespace-nowrap text-center bg-emerald-50/30 dark:bg-emerald-900/5">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-base">
                        {item.hasil_inflasi}% <TrendingUp className="w-4 h-4" />
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="w-5 h-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}