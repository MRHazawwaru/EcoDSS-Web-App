"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SlidersHorizontal, Save, RefreshCcw, 
  AlertCircle, Activity, Info, TrendingUp, TrendingDown, CheckCircle, X, Scale
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SimulasiPage() {
  const [params, setParams] = useState({
    bi_rate: 6.0,
    kurs_usd: 15500,
    jumlah_uang_beredar_m2: 8500000,
    ihk: 118.0,
    kredit_perbankan: 7000000,
    harga_minyak_brent: 85.0,
    indeks_pangan_fao: 120.0,
    harga_cpo: 4000,
    harga_batubara: 135
  });

  const [baseline, setBaseline] = useState(params);
  // [BARU] Menyimpan nilai aktual inflasi dan nama periode dari baseline
  const [baselineInflasi, setBaselineInflasi] = useState<number | null>(null);
  const [baselinePeriode, setBaselinePeriode] = useState<string>("Bulan Terakhir");
  
  const [selectedModel, setSelectedModel] = useState("random_forest");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isSaved, setIsSaved] = useState(false);

  // [BARU] State untuk Pop-up Simpan Skenario
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scenarioName, setScenarioName] = useState("");

  useEffect(() => {
    const fetchBaseline = async () => {
      try {
        const userId = localStorage.getItem("ecodss_user_id") || "guest";
        const savedBaseline = localStorage.getItem(`active_baseline_${userId}`);
        
        if (savedBaseline) {
          const parsed = JSON.parse(savedBaseline);
          const targetBaseline = {
            bi_rate: Number(parsed.bi_rate),
            kurs_usd: Number(parsed.kurs_usd),
            jumlah_uang_beredar_m2: Number(parsed.jumlah_uang_beredar_m2),
            ihk: Number(parsed.ihk),
            kredit_perbankan: Number(parsed.kredit_perbankan),
            harga_minyak_brent: Number(parsed.harga_minyak_brent),
            indeks_pangan_fao: Number(parsed.indeks_pangan_fao),
            harga_cpo: Number(parsed.harga_cpo),
            harga_batubara: Number(parsed.harga_batubara)
          };
          
          setParams(targetBaseline);
          setBaseline(targetBaseline);
          // [UPDATE] Tangkap nilai inflasi aktual dan nama periode dari baseline
          if (parsed.inflasi_yoy) setBaselineInflasi(Number(parsed.inflasi_yoy));
          if (parsed.periode) setBaselinePeriode(new Date(parsed.periode).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
          return; 
        }

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/`, {
          headers: { "x-user-id": userId }
        });

        if (res.data.data?.length > 0) {
          const latest = res.data.data[0]; 
          const latestParams = {
            bi_rate: Number(latest.bi_rate),
            kurs_usd: Number(latest.kurs_usd),
            jumlah_uang_beredar_m2: Number(latest.jumlah_uang_beredar_m2),
            ihk: Number(latest.ihk),
            kredit_perbankan: Number(latest.kredit_perbankan),
            harga_minyak_brent: Number(latest.harga_minyak_brent),
            indeks_pangan_fao: Number(latest.indeks_pangan_fao),
            harga_cpo: Number(latest.harga_cpo),
            harga_batubara: Number(latest.harga_batubara)
          };
          setParams(latestParams);
          setBaseline(latestParams);
          // [UPDATE] Tangkap dari database utama jika belum ada baseline tersimpan
          if (latest.inflasi_yoy) setBaselineInflasi(Number(latest.inflasi_yoy));
          if (latest.periode) setBaselinePeriode(new Date(latest.periode).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
        }
      } catch (e) {
        console.error("Gagal sinkronisasi baseline:", e);
      }
    };
    
    fetchBaseline();
  }, []);

  const handleReset = () => {
    setParams(baseline); 
    setResult(null);
    toast.success("Parameter dikembalikan ke Kondisi Baseline.");
  };

  const runSimulation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/simulasi/run`, {
        model_type: selectedModel,
        ...params
      }, {
        headers: { "x-user-id": userId }
      });

      setResult(response.data.prediksi_inflasi_yoy);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Gagal sinkronisasi variabel ke AI.");
    } finally {
      setIsLoading(false);
    }
  }, [params, selectedModel]);

  useEffect(() => {
    const timer = setTimeout(() => runSimulation(), 600);
    return () => clearTimeout(timer);
  }, [params, selectedModel, runSimulation]);

  const handleManualInput = (key: string, rawValue: string) => {
    const cleanValue = rawValue.replace(/\./g, "");
    let numValue = parseInt(cleanValue) || 0;
    if (cleanValue === "" || numValue === 0) numValue = 0;
    setParams(prev => ({ ...prev, [key]: numValue }));
  };

  // [BARU] Fungsi memunculkan pop-up
  const triggerSaveModal = () => {
    if (result === null) return;
    setShowSaveModal(true);
  };

  // [BARU] Fungsi mengeksekusi penyimpanan sesungguhnya dengan Nama Skenario
  const confirmSaveToHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (result === null) return;

    const historyRecord = {
      id: Date.now().toString(),
      tanggal: new Date().toLocaleString('id-ID'),
      nama_skenario: scenarioName || "Skenario Tanpa Nama",
      model: selectedModel,
      skenario: params,
      hasil_inflasi: result,
      baseline_aktual: baselineInflasi 
    };
    
    const userId = localStorage.getItem("ecodss_user_id") || "guest";
    const storageKey = `eco_dss_history_${userId}`;
    
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    localStorage.setItem(storageKey, JSON.stringify([historyRecord, ...existing]));
    
    toast.success("Skenario berhasil disimpan!");
    
    setShowSaveModal(false);
    setScenarioName("");
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Simulasi Skenario</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Eksperimen variabel ekonomi secara instan berbasis Acuan Baseline.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 ml-2 uppercase">Model AI</span>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-sm font-bold p-2 rounded-lg outline-none border-none dark:text-white"
          >
            <option value="random_forest">Random Forest</option>
            <option value="xgboost">XGBoost</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2 dark:text-white">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500"/> Variabel Independen
              </h3>
              <button onClick={handleReset} className="text-xs flex items-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors">
                <RefreshCcw className="w-3 h-3"/> Reset ke Baseline
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-6">
                <SliderItem label="BI Rate (%)" val={params.bi_rate} min={3} max={9} step={0.25} onChange={(v: number) => setParams({...params, bi_rate: v})} />
                <SliderItem label="Kurs USD/IDR" val={params.kurs_usd} min={13000} max={18000} step={50} onChange={(v: number) => setParams({...params, kurs_usd: v})} suffix="Rp" />
                <SliderItem label="Minyak Brent" val={params.harga_minyak_brent} min={40} max={150} step={1} onChange={(v: number) => setParams({...params, harga_minyak_brent: v})} suffix="$" />
                <SliderItem label="Indeks Pangan FAO" val={params.indeks_pangan_fao} min={80} max={180} step={0.5} onChange={(v: number) => setParams({...params, indeks_pangan_fao: v})} />
              </div>

              <div className="space-y-6">
                <ManualInput label="Uang Beredar M2 (Miliar)" val={params.jumlah_uang_beredar_m2} onChange={(v: string) => handleManualInput("jumlah_uang_beredar_m2", v)} />
                <ManualInput label="Kredit Perbankan (Miliar)" val={params.kredit_perbankan} onChange={(v: string) => handleManualInput("kredit_perbankan", v)} />
                <SliderItem label="Harga CPO" val={params.harga_cpo} min={2000} max={6000} step={100} onChange={(v: number) => setParams({...params, harga_cpo: v})} suffix="MYR" />
                <SliderItem label="Harga Batubara" val={params.harga_batubara} min={50} max={450} step={5} onChange={(v: number) => setParams({...params, harga_batubara: v})} suffix="$" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* PANEL KANAN: KOMPARASI SIDE-BY-SIDE */}
        <div className="lg:sticky lg:top-8 space-y-4">
          <div className="bg-slate-900 dark:bg-black p-6 rounded-[2rem] shadow-2xl border border-slate-800 text-white overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full"></div>
            
            <div className="flex items-center gap-2 mb-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <Scale className="w-3 h-3 text-indigo-500" /> Analisis Komparasi (YoY)
            </div>

            {/* [BARU] Grid Perbandingan Aktual vs Prediksi */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
              {/* KOTAK AKTUAL */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col justify-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1 truncate">Aktual ({baselinePeriode})</p>
                <div className="text-2xl lg:text-3xl font-black text-slate-300">
                  {baselineInflasi !== null ? baselineInflasi.toFixed(2) : "0.00"}%
                </div>
              </div>

              {/* KOTAK PREDIKSI */}
              <div className="bg-indigo-600/20 p-4 rounded-2xl border border-indigo-500/40 flex flex-col justify-center">
                <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest mb-1 truncate">Prediksi AI</p>
                {isLoading ? (
                  <div className="flex items-center gap-2 h-8">
                    <RefreshCcw className="w-4 h-4 animate-spin text-indigo-400" />
                  </div>
                ) : error ? (
                  <div className="text-red-400 text-xs flex items-center h-8">Error</div>
                ) : (
                  <div className="text-2xl lg:text-3xl font-black text-white">
                    {result?.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>

            {/* [BARU] Indikator Selisih Dampak Kebijakan */}
            {!isLoading && result !== null && baselineInflasi !== null && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                result > baselineInflasi 
                  ? 'bg-amber-900/20 border-amber-800/50 text-amber-400' 
                  : 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400'
              }`}>
                {result > baselineInflasi ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                {result > baselineInflasi ? 'Simulasi menaikkan Inflasi ' : 'Simulasi menurunkan Inflasi '}
                {Math.abs(result - baselineInflasi).toFixed(2)}%
              </div>
            )}

            <button 
              onClick={triggerSaveModal}
              disabled={isLoading || !!error || isSaved}
              className={`w-full mt-8 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                isSaved 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/50" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30"
              }`}
            >
              {isSaved ? (
                <><CheckCircle size={16}/> Tersimpan!</>
              ) : (
                <><Save size={16}/> Simpan Skenario</>
              )}
            </button>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-5 rounded-2xl flex gap-3">
             <Info className="w-5 h-5 text-amber-600 shrink-0" />
             <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
               Gunakan kotak perbandingan di atas untuk melihat dampak langsung (deviasi) antara Kondisi Eksisting dengan skenario yang sedang Anda buat.
             </p>
          </div>
        </div>
      </div>

      {/* [BARU] Modal Pop-up Simpan Skenario */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Simpan Skenario</h3>
                <button onClick={() => setShowSaveModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={confirmSaveToHistory} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Skenario</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Suku Bunga Naik Kuartal 1"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20 dark:text-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-2">Nama ini akan mempermudah Anda mencari skenario ini di menu History Simulasi.</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowSaveModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors">
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SliderItem({ label, val, min, max, step, onChange, suffix = "" }: any) {
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider group-hover:text-indigo-500 transition-colors">{label}</label>
        <span className="text-xs font-bold dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{suffix} {val.toLocaleString('id-ID')}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} value={val}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 z-20 relative"
      />
    </div>
  );
}

function ManualInput({ label, val, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">{label}</label>
      <input 
        type="text"
        value={new Intl.NumberFormat("id-ID").format(val)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20 dark:text-white transition-all"
      />
    </div>
  );
}