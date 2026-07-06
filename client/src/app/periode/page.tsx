"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Calendar, 
  Trash2, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  PlayCircle,
  RefreshCcw 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

interface Periode {
  bulan: number;
  tahun: number;
}

export default function PeriodePage() {
  const [periods, setPeriods] = useState<Periode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBaseline, setActiveBaseline] = useState<string | null>(null);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("ecodss_user_id") || "guest";

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/periode`, {
        headers: { "x-user-id": userId }
      });
      
      const data = Array.isArray(res.data) ? res.data : [];
      setPeriods(data);
      
      // [UPDATE GEMBOK KTP] Baca Baseline spesifik milik User ini saja
      const savedBaseline = localStorage.getItem(`simulasi_baseline_${userId}`);
      if (savedBaseline) setActiveBaseline(savedBaseline);
    } catch (err) {
      console.error("Gagal ambil data periode:", err);
      toast.error("Gagal memuat daftar periode");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleSetBaseline = async (tahun: number, bulan: number) => {
    try {
      const userId = localStorage.getItem("ecodss_user_id") || "guest";

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/`, {
        headers: { "x-user-id": userId }
      });
      const allData = res.data.data;

      const targetData = allData.find((d: any) => {
        const date = new Date(d.periode);
        return date.getFullYear() === tahun && (date.getMonth() + 1) === bulan;
      });

      if (!targetData) {
        toast.error("Data detail variabel untuk bulan ini tidak ditemukan.");
        return;
      }

      // [UPDATE GEMBOK KTP] Simpan Baseline spesifik milik User
      localStorage.setItem(`active_baseline_${userId}`, JSON.stringify(targetData));
      const baselineKey = `${tahun}-${bulan}`;
      localStorage.setItem(`simulasi_baseline_${userId}`, baselineKey);
      setActiveBaseline(baselineKey);

      toast.success(`Periode acuan berhasil diset! Slider simulasi sudah terhubung.`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menarik data detail untuk baseline.");
    }
  };

  const handleDelete = async (tahun: number, bulan: number) => {
    if (confirm(`Hapus seluruh data ekonomi untuk periode ${namaBulan(bulan)} ${tahun}? Tindakan ini akan mempengaruhi otak AI.`)) {
      try {
        const userId = localStorage.getItem("ecodss_user_id") || "guest";

        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/periode/${tahun}/${bulan}`, {
          headers: { "x-user-id": userId }
        });
        toast.success("Periode berhasil dihapus");
        
        if (activeBaseline === `${tahun}-${bulan}`) {
          // [UPDATE GEMBOK KTP] Hapus Baseline spesifik
          localStorage.removeItem(`simulasi_baseline_${userId}`);
          localStorage.removeItem(`active_baseline_${userId}`);
          setActiveBaseline(null);
        }
        
        fetchPeriods(); 
      } catch (err) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  const namaBulan = (n: number) => {
    return new Date(0, n - 1).toLocaleString('id-ID', { month: 'long' });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Manajemen Periode</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Kelola rentang waktu dataset dan tentukan acuan dasar (baseline) simulasi.</p>
          </div>
        </div>
        
        <button 
          onClick={fetchPeriods}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Grid Periode */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCcw className="w-10 h-10 animate-spin mb-4" />
          <p>Sinkronisasi database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {periods.map((item, idx) => {
            const isBaseline = activeBaseline === `${item.tahun}-${item.bulan}`;
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative group bg-white dark:bg-slate-900 border ${
                  isBaseline ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-800'
                } p-5 rounded-2xl shadow-sm hover:shadow-md transition-all`}
              >
                {isBaseline && (
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-lg">
                      {item.tahun}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-lg leading-tight">
                        {namaBulan(item.bulan)}
                      </p>
                      <p className="text-xs text-slate-400">Data Historis Ready</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => handleSetBaseline(item.tahun, item.bulan)}
                    disabled={isBaseline}
                    className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                      isBaseline 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                    <PlayCircle className="w-4 h-4" />
                    {isBaseline ? "Baseline Aktif" : "Set Baseline"}
                  </button>

                  <button 
                    onClick={() => handleDelete(item.tahun, item.bulan)}
                    className="p-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Hapus periode"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
          
          {periods.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Database Kosong</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Belum ada data periode terdeteksi. Silakan unggah dataset di menu Dataset.</p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-5 rounded-2xl flex gap-4 transition-colors"
      >
        <AlertTriangle className="text-amber-600 dark:text-amber-500 w-6 h-6 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-400">
            Catatan MLOps (Manajemen Data):
          </p>
          <ul className="text-xs text-amber-800/80 dark:text-amber-500/80 list-disc ml-4 space-y-1">
            <li><strong>Set Baseline</strong> menentukan titik awal angka ekonomi pada menu Simulasi Skenario.</li>
            <li>Menghapus periode akan merusak urutan <em>Time-Series</em> dan menurunkan akurasi prediksi AI.</li>
            <li>Setelah melakukan perubahan data (tambah/hapus), lakukan <strong>Model Re-training</strong> di menu Model Training.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}