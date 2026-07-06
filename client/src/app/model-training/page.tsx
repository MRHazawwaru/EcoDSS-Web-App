"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Cpu, Play, CheckCircle2, AlertCircle, RefreshCcw, 
  Activity, BarChart3, Target, Info, TrendingUp 
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface FeatureData {
  feature: string;
  importance_percent: number;
}

export default function ModelTrainingAndAnalyticsPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState<any>({ random_forest: null, xgboost: null });
  
  const [featureData, setFeatureData] = useState<FeatureData[]>([]);
  const [selectedAnalyticsModel, setSelectedAnalyticsModel] = useState("random_forest");
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const fetchAnalytics = async (modelType: string) => {
    try {
      setIsLoadingAnalytics(true);
      const userId = localStorage.getItem("ecodss_user_id"); 
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/feature-importance?model_type=${modelType}`, {
        headers: { "x-user-id": userId } 
      });
      setFeatureData(response.data.data);
    } catch (err: any) {
      console.error("Gagal memuat analitik:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedAnalyticsModel);
  }, [selectedAnalyticsModel]);

  const handleTrainAllModels = async () => {
    setIsTraining(true);

    try {
      const userId = localStorage.getItem("ecodss_user_id"); 
      
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/training/run`, {}, {
        headers: { "x-user-id": userId }
      });

      setMetrics({
        random_forest: res.data.metrics.random_forest,
        xgboost: res.data.metrics.xgboost
      });

      toast.success(res.data.message || "Semua Model berhasil dilatih & disimpan!");
      fetchAnalytics(selectedAnalyticsModel);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Gagal melatih model. Pastikan dataset sudah terisi minimal 24 baris.");
    } finally {
      setIsTraining(false);
    }
  };

  const colors = ['#3b82f6', '#60a5fa', '#10b981', '#34d399', '#f59e0b', '#fbbf24', '#8b5cf6', '#a78bfa', '#64748b'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-sm z-50">
          <p className="font-semibold mb-1">{payload[0].payload.feature}</p>
          <p className="text-blue-400">
            Pengaruh: <span className="font-bold text-white">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-10 pb-12">
      {/* HEADER UTAMA */}
      {/* [UPDATE] flex-col di HP agar tidak bertabrakan, md:flex-row di laptop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl shrink-0 mt-1 sm:mt-0">
            <Cpu className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">Model Training (MLOps)</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Latih ulang pipeline Machine Learning dengan dataset terbaru.
            </p>
          </div>
        </div>
        
        {/* [UPDATE] w-full di HP agar tombol merentang penuh, md:w-auto di laptop */}
        <button
          onClick={handleTrainAllModels}
          disabled={isTraining}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
        >
          {isTraining ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
          {isTraining ? "Mengeksekusi Pipeline..." : "Train Semua Model"}
        </button>
      </div>

      {/* SEKSI 1: KARTU HASIL EVALUASI MODEL */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
           <Activity className="w-5 h-5 text-indigo-500"/> Hasil Evaluasi Metrik
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white">Random Forest</h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">Ensemble Learning Algorithm</p>
              </div>
              {metrics.random_forest && <CheckCircle2 className="text-emerald-500 w-6 h-6 shrink-0" />}
            </div>

            {metrics.random_forest ? (
              <div className="mb-2 p-4 md:p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Akurasi (100-MAPE)</p>
                    <p className="text-xl md:text-2xl font-black text-emerald-500">
                      {(100 - metrics.random_forest.mape).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">RMSE (Error)</p>
                    <p className="text-xl md:text-2xl font-black text-slate-700 dark:text-white">
                      {metrics.random_forest.rmse.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-2 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-500 text-sm">
                Belum ada data evaluasi. Klik "Train Semua Model" di atas.
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white">XGBoost</h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">Extreme Gradient Boosting</p>
              </div>
              {metrics.xgboost && <CheckCircle2 className="text-emerald-500 w-6 h-6 shrink-0" />}
            </div>

            {metrics.xgboost ? (
              <div className="mb-2 p-4 md:p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Akurasi (100-MAPE)</p>
                    <p className="text-xl md:text-2xl font-black text-emerald-500">
                      {(100 - metrics.xgboost.mape).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">RMSE (Error)</p>
                    <p className="text-xl md:text-2xl font-black text-slate-700 dark:text-white">
                      {metrics.xgboost.rmse.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-2 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-500 text-sm">
                Belum ada data evaluasi. Klik "Train Semua Model" di atas.
              </div>
            )}
          </motion.div>

        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8"></div>

      {/* SEKSI 2: FEATURE IMPORTANCE ANALYTICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
           <BarChart3 className="w-5 h-5 text-blue-500"/> Feature Importance (Explainable AI)
        </h2>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full md:w-auto">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">Lihat Grafik:</span>
          <select 
            value={selectedAnalyticsModel} 
            onChange={(e) => setSelectedAnalyticsModel(e.target.value)}
            className="flex-1 md:flex-none bg-indigo-50 dark:bg-indigo-900/30 text-sm font-bold text-indigo-700 dark:text-indigo-300 py-1.5 px-3 rounded-lg outline-none cursor-pointer border-none"
          >
            <option value="random_forest">Random Forest</option>
            <option value="xgboost">XGBoost</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-white dark:bg-slate-900 p-2 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {isLoadingAnalytics ? (
            <div className="h-80 flex flex-col items-center justify-center text-slate-500 gap-3">
              <RefreshCcw className="w-6 h-6 animate-spin" />
              <span>Memuat data grafik...</span>
            </div>
          ) : featureData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {/* [UPDATE] margin left di-nol-kan agar label teks tidak memakan setengah layar HP */}
                <BarChart data={featureData} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" hide />
                  {/* [UPDATE] width pada YAxis dikurangi menjadi 105 dan font diperkecil (11px) supaya batang grafik punya ruang luas */}
                  <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} width={105} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  {/* [UPDATE] barSize disusutkan sedikit agar responsif */}
                  <Bar dataKey="importance_percent" radius={[0, 6, 6, 0]} barSize={18}>
                    {featureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-slate-400 gap-2">
              <AlertCircle className="w-8 h-8 opacity-50" />
              <p>Grafik belum tersedia. Silakan Train Model terlebih dahulu.</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
            <h3 className="text-md font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-3">
              <Target className="w-5 h-5"/> Top Driver Inflasi
            </h3>
            {isLoadingAnalytics || featureData.length === 0 ? (
              <div className="text-sm text-indigo-400">Menunggu data model...</div>
            ) : (
              <div>
                <p className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{featureData[0].feature}</p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300/80 leading-relaxed mt-2">
                  Menyumbang bobot <strong>{featureData[0].importance_percent}%</strong> terhadap pembentukan nilai inflasi pada model <em className="uppercase not-italic font-bold">{selectedAnalyticsModel.replace('_', ' ')}</em>.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}