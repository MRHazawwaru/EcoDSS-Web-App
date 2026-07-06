"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { motion, Variants } from "framer-motion"; 
import { TrendingUp, DollarSign, Droplet, Activity, AlertCircle } from "lucide-react"; 
import axios from "axios";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';

import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface EconomicData {
  periode: string;
  inflasi_yoy: number;
  bi_rate: number;
  kurs_usd: number;
  harga_minyak_brent: number;
  jumlah_uang_beredar_m2: number;
}

export default function Dashboard() {
  const router = useRouter(); 
  const { currency } = useCurrencyStore();
  const { isLoading: isCurrencyLoading, formatCurrency } = useExchangeRate();

  const [isAuthValid, setIsAuthValid] = useState(false);
  const [historicalData, setHistoricalData] = useState<EconomicData[]>([]);
  const [latestData, setLatestData] = useState<EconomicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem("ecodss_auth");
    if (!isAuth) {
      router.push("/login"); 
    } else {
      setIsAuthValid(true); 
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthValid) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // [UPDATE] Ambil KTP/User ID dari localStorage
        const userId = localStorage.getItem("ecodss_user_id");

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/`, {
          headers: {
            "x-user-id": userId // [BARU] Selipkan ID di sini
          }
        });
        
        const data = response.data.data;
        if (data && data.length > 0) {
          setLatestData(data[0]);
          const chartData = [...data].slice(0, 12).reverse();
          setHistoricalData(chartData);
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
        setError("Gagal terhubung ke database. Pastikan server backend menyala.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthValid]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-sm">
          <p className="font-semibold mb-1 text-slate-300">Periode: {label}</p>
          <p className="text-emerald-400 font-bold">Inflasi: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  if (!isAuthValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 font-medium animate-pulse">Memverifikasi akses keamanan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Dashboard Ekonomi Global</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Pantau indikator makroekonomi utama dan konversi nilai tukar secara real-time.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 font-medium border border-red-100 dark:border-red-800">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Grid Cards Metrik */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">Inflasi Aktual (YoY)</h3>
            <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"><TrendingUp size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{isLoading ? "..." : `${latestData?.inflasi_yoy || 0}%`}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">Data bulan terakhir</p>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">BI Rate</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"><Activity size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{isLoading ? "..." : `${latestData?.bi_rate || 0}%`}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">Suku bunga acuan domestik</p>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">Harga Minyak (Brent)</h3>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg transition-colors"><Droplet size={20} /></div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white transition-colors truncate">
            {isLoading || isCurrencyLoading || !latestData ? "Menghitung..." : formatCurrency(latestData.harga_minyak_brent * latestData.kurs_usd, true)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">Per barel (Nilai dalam {currency})</p>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">Uang Beredar (M2)</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"><DollarSign size={20} /></div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white truncate transition-colors">
            {isLoading || isCurrencyLoading || !latestData ? "Menghitung..." : formatCurrency(latestData.jumlah_uang_beredar_m2 * 1000000000, true)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">Estimasi (Nilai dalam {currency})</p>
        </motion.div>
      </motion.div>

      {/* Bagian Chart Historis */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: "spring" }} className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Tren Inflasi (12 Bulan Terakhir)</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Visualisasi data historis sebelum dilakukan simulasi AI.</p>
        </div>

        {isLoading ? (
          <div className="h-80 flex items-center justify-center text-slate-500">Memuat grafik...</div>
        ) : historicalData.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <TrendingUp className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600" />
            <p>Belum ada data historis di database.</p>
          </div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflasi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="periode" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="inflasi_yoy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInflasi)" activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
}