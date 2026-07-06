"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingDown, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, Target } from "lucide-react";
import axios from "axios";

interface HistoryRecord {
  id: string;
  tanggal: string;
  model: string;
  skenario: any;
  hasil_inflasi: number;
}

export default function HasilAnalisisPage() {
  const [actualData, setActualData] = useState<any>(null);
  const [bestScenario, setBestScenario] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const generateInsights = async () => {
      try {
        const userId = localStorage.getItem("ecodss_user_id"); // [BARU] Ambil ID

        // 1. Ambil Data Kondisi Aktual dengan menyisipkan Header
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/`, {
          headers: { "x-user-id": userId } // [BARU] Sisipkan KTP
        });
        const data = res.data.data;
        if (data && data.length > 0) {
          setActualData(data[0]); 
        }

        // 2. Ambil History Simulasi dari Local Storage (Dengan Gembok KTP)
        const storageKey = `eco_dss_history_${userId}`;
        const savedHistory = localStorage.getItem(storageKey);
        
        if (savedHistory) {
          const historyArray: HistoryRecord[] = JSON.parse(savedHistory);
          
          if (historyArray.length > 0) {
            const sortedHistory = [...historyArray].sort((a, b) => a.hasil_inflasi - b.hasil_inflasi);
            setBestScenario(sortedHistory[0]); 
          }
        }
      } catch (err) {
        console.error("Gagal memuat data untuk analisis", err);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, []);

  if (!isClient) return null;

  if (loading) {
    return <div className="p-10 text-center text-slate-500 animate-pulse">Menyusun Rekomendasi Kebijakan...</div>;
  }

  if (!bestScenario || !actualData) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-amber-50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-3xl text-center">
        <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-amber-800 dark:text-amber-500 mb-2">Data Analisis Belum Cukup</h2>
        <p className="text-amber-700 dark:text-amber-400/80 mb-6">
          Sistem DSS membutuhkan minimal 1 data aktual di database dan 1 riwayat simulasi skenario untuk dapat merumuskan rekomendasi kebijakan.
        </p>
      </div>
    );
  }

  const insights = [];
  const deltaBI = Number((bestScenario.skenario.bi_rate - actualData.bi_rate).toFixed(2));
  const deltaKurs = Number((bestScenario.skenario.kurs_usd - actualData.kurs_usd).toFixed(2));
  const deltaM2 = Number((bestScenario.skenario.jumlah_uang_beredar_m2 - actualData.jumlah_uang_beredar_m2).toFixed(2));

  if (deltaBI > 0) {
    insights.push({ icon: <TrendingUp className="text-red-500"/>, title: "Kenaikan Suku Bunga (BI Rate)", text: `Sistem merekomendasikan kenaikan BI Rate sebesar ${deltaBI}% (menjadi ${bestScenario.skenario.bi_rate}%). Langkah hawkish ini diperlukan untuk meredam laju uang beredar dan menekan ekspektasi inflasi.` });
  } else if (deltaBI < 0) {
    insights.push({ icon: <TrendingDown className="text-emerald-500"/>, title: "Penurunan Suku Bunga (BI Rate)", text: `Terdapat ruang untuk menurunkan BI Rate sebesar ${Math.abs(deltaBI)}% (menjadi ${bestScenario.skenario.bi_rate}%). Kebijakan dovish ini aman dilakukan berdasarkan skenario terbaik tanpa memicu lonjakan inflasi yang signifikan.` });
  }

  if (deltaKurs < 0) {
    insights.push({ icon: <CheckCircle2 className="text-emerald-500"/>, title: "Intervensi Penguatan Rupiah", text: `Penguatan nilai tukar Rupiah sebesar Rp ${Math.abs(deltaKurs)} terhadap USD terbukti signifikan dalam skenario ini untuk menekan imported inflation (inflasi barang impor).` });
  }

  if (deltaM2 < 0) {
     insights.push({ icon: <TrendingDown className="text-indigo-500"/>, title: "Pengetatan Likuiditas (M2)", text: `Mengurangi jumlah uang beredar sebesar ${Math.abs(deltaM2)} Miliar direkomendasikan untuk menstabilkan harga pasar domestik.` });
  }

  if (insights.length === 0) {
    insights.push({ icon: <CheckCircle2 className="text-emerald-500"/>, title: "Pertahankan Kebijakan Saat Ini", text: "Berdasarkan skenario terbaik yang dijalankan, mempertahankan variabel ekonomi pada angka saat ini adalah keputusan paling optimal." });
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-12">
      <div className="flex items-start sm:items-center gap-4">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl shrink-0 mt-1 sm:mt-0">
          <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">Rekomendasi Kebijakan AI</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Sintesis keputusan cerdas berdasarkan perbandingan skenario simulasi terbaik
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Kondisi Aktual</p>
          <p className="text-5xl font-black text-slate-800 dark:text-white">{actualData.inflasi_yoy}%</p>
          <p className="text-sm text-slate-400 mt-2">Inflasi bulan terakhir</p>
        </div>
        
        <div className="hidden md:flex justify-center items-center bg-white dark:bg-slate-900 z-10 -mx-6">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full">
            <ArrowRight className="w-8 h-8" />
          </div>
        </div>

        <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400 mb-2 uppercase tracking-wider flex items-center gap-2"><Target className="w-4 h-4"/> Skenario Terbaik</p>
          <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{bestScenario.hasil_inflasi}%</p>
          <p className="text-sm text-indigo-400/80 mt-2">Model: {bestScenario.model === 'random_forest' ? 'Random Forest' : 'XGBoost'}</p>
        </div>
      </motion.div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
           Action Plan Eksekutif
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg h-fit">
                  {insight.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{insight.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}