"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // [BARU] Import Senjata Rahasia Portal
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle, AlertCircle, RefreshCw, Database, Clock, X, Info, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Variabel Wajib untuk mengecek kelengkapan
const REQUIRED_VARS = [
  { key: 'inflasi_yoy', label: 'Inflasi YoY' },
  { key: 'bi_rate', label: 'BI Rate' },
  { key: 'kurs_usd', label: 'Kurs USD' },
  { key: 'jumlah_uang_beredar_m2', label: 'Uang Beredar (M2)' },
  { key: 'ihk', label: 'Indeks Harga Konsumen' },
  { key: 'kredit_perbankan', label: 'Kredit Perbankan' },
  { key: 'harga_minyak_brent', label: 'Minyak Brent' },
  { key: 'indeks_pangan_fao', label: 'Pangan FAO' },
  { key: 'harga_cpo', label: 'Harga CPO' },
  { key: 'harga_batubara', label: 'Harga Batubara' }
];

export default function DatasetPage() {
  const [activeTab, setActiveTab] = useState<'staging' | 'ready'>('staging');
  const [stagingData, setStagingData] = useState<any[]>([]);
  const [readyData, setReadyData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false); // State loading untuk Ruang Tunggu
  const [isClearingMain, setIsClearingMain] = useState(false); // [BARU] State loading untuk DB Utama
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  // [BARU] State untuk memastikan browser sudah siap menerima Portal
  const [isMounted, setIsMounted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      
      const resReady = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/`, { headers: { "x-user-id": userId } });
      setReadyData(resReady.data.data);

      const resStaging = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/staging`, { headers: { "x-user-id": userId } });
      setStagingData(resStaging.data.data);

    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true); // Mengizinkan portal aktif setelah halaman termuat
    fetchData();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setUploadStatus({ type: null, message: '' });

      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", "x-user-id": userId },
      });

      setUploadStatus({ type: 'success', message: response.data.details });
      fetchData(); 
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Terjadi kesalahan saat mengunggah file.";
      setUploadStatus({ type: 'error', message: errorMsg });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const deleteStaging = async (id: number) => {
    if (!confirm("Hapus periode ini dari Ruang Tunggu?")) return;
    try {
      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/staging/${id}`, { headers: { "x-user-id": userId } });
      toast.success("Ruangan berhasil dihapus");
      fetchData();
      setSelectedCard(null);
    } catch (err) {
      toast.error("Gagal menghapus ruangan");
      console.error(err);
    }
  };

  const clearAllStaging = async () => {
    if (!confirm(`Peringatan! Apakah kamu yakin ingin menghapus SELURUH ${stagingData.length} data di Ruang Tunggu secara permanen?`)) return;
    try {
      setIsClearingAll(true);
      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/staging/clear-all`, { headers: { "x-user-id": userId } });
      toast.success(res.data.message || "Seluruh Ruang Tunggu berhasil dibersihkan");
      fetchData();
    } catch (err) {
      toast.error("Gagal membersihkan Ruang Tunggu");
      console.error(err);
    } finally {
      setIsClearingAll(false);
    }
  };

  // [BARU] Fungsi Sapu Jagat untuk Database Utama
  const clearAllMainData = async () => {
    if (!confirm(`HATI-HATI! Menghapus ${readyData.length} data utama akan merusak otak AI yang sudah kamu latih. Lanjutkan kosongkan database?`)) return;
    try {
      setIsClearingMain(true);
      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/dataset/clear-all`, { headers: { "x-user-id": userId } });
      toast.success(res.data.message || "Database Utama berhasil dikosongkan");
      fetchData();
    } catch (err) {
      toast.error("Gagal mengosongkan Database Utama");
      console.error(err);
    } finally {
      setIsClearingMain(false);
    }
  };

  const calculateProgress = (item: any) => {
    const filled = REQUIRED_VARS.filter(v => item[v.key] !== null && item[v.key] !== undefined).length;
    return { filled, total: REQUIRED_VARS.length, percent: Math.round((filled / REQUIRED_VARS.length) * 100) };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Manajemen Dataset</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Upload file (Excel/CSV)</p>
      </div>

      {/* UPLOAD SECTION */}
      <motion.div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">AI File Extractor</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload dataset. Sistem akan menahannya sampai periodenya lengkap (10 Variabel).</p>
          </div>
          
          {/* [PERBAIKAN] Flex-col diubah agar tombol merentang sempurna dan teks benar-benar di tengah */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 md:mt-0">
            <input type="file" accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading || isClearingAll || isClearingMain} 
              // [UPDATE] Penambahan flex-1 untuk memastikan tombol memenuhi ruang dan kontennya rata tengah sempurna
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md active:scale-95 text-center"
            >
              {isUploading ? <RefreshCw className="w-5 h-5 animate-spin shrink-0" /> : <Upload className="w-5 h-5 shrink-0" />}
              <span>{isUploading ? "Memindai File..." : "Upload File"}</span>
            </button>
          </div>
        </div>

        {uploadStatus.type && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${uploadStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
            {uploadStatus.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            {uploadStatus.message}
          </div>
        )}
      </motion.div>

      {/* TABS CONTROLLER */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab('staging')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'staging' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <Clock className="w-4 h-4"/> Ruang Tunggu ({stagingData.length})
        </button>
        <button onClick={() => setActiveTab('ready')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'ready' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <Database className="w-4 h-4"/> Database Utama ({readyData.length})
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : (
        <AnimatePresence mode="wait">
          
          {/* VIEW: RUANG TUNGGU (STAGING) */}
          {activeTab === 'staging' && (
            <motion.div key="staging" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              
              {stagingData.length === 0 ? (
                <div className="text-center py-20 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-800/50">
                  <Clock className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-amber-700 dark:text-amber-500">Ruang Tunggu Kosong</h3>
                  <p className="text-amber-600/80 dark:text-amber-400/70 max-w-md mx-auto">Semua data Anda sudah lengkap dan masuk ke Database Utama, atau Anda belum mengupload file apapun.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Menampilkan <span className="text-amber-600 dark:text-amber-400">{stagingData.length}</span> periode tertahan.
                    </p>
                    <button 
                      onClick={clearAllStaging}
                      disabled={isClearingAll || isUploading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {isClearingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      {isClearingAll ? "Menghapus..." : "Hapus Semua Ruangan"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stagingData.map((item) => {
                      const prog = calculateProgress(item);
                      return (
                        <div key={item.id} onClick={() => setSelectedCard(item.id)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-400 cursor-pointer transition-all group">
                          <div className="flex justify-between items-center mb-4">
                            <p className="font-black text-lg text-slate-800 dark:text-white group-hover:text-amber-600 transition-colors">
                              {new Date(item.periode).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                            </p>
                            <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-md">Pending</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-slate-500">
                              <span>Kelengkapan Variabel</span>
                              <span>{prog.filled} / {prog.total}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${prog.percent}%` }}></div>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-4 text-center">Klik untuk melihat detail</p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* VIEW: DATABASE UTAMA (READY) */}
          {activeTab === 'ready' && (
            <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              
              {/* [BARU] Header Controller untuk Database Utama */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Menampilkan <span className="text-emerald-600 dark:text-emerald-400">{readyData.length}</span> data siap simulasi.
                </p>
                {readyData.length > 0 && (
                  <button 
                    onClick={clearAllMainData}
                    disabled={isClearingMain || isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {isClearingMain ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {isClearingMain ? "Mengosongkan..." : "Kosongkan Database"}
                  </button>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Tabel Data Historis</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-4 font-semibold whitespace-nowrap">Periode</th>
                        <th className="p-4 font-semibold whitespace-nowrap">BI Rate</th>
                        <th className="p-4 font-semibold whitespace-nowrap">Kurs USD</th>
                        <th className="p-4 font-semibold whitespace-nowrap">M2 (Miliar)</th>
                        <th className="p-4 font-semibold whitespace-nowrap">Harga CPO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {readyData.length === 0 ? (
                        <tr><td colSpan={5} className="p-10 text-center text-slate-400">Database Utama kosong. Selesaikan pengumpulan data di Ruang Tunggu.</td></tr>
                      ) : (
                        readyData.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                            <td className="p-4 font-medium">{new Date(row.periode).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</td>
                            <td className="p-4">{row.bi_rate}%</td>
                            <td className="p-4">Rp {row.kurs_usd?.toLocaleString('id-ID')}</td>
                            <td className="p-4">Rp {row.jumlah_uang_beredar_m2?.toLocaleString('id-ID')}</td>
                            <td className="p-4">MYR {row.harga_cpo}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* [BARU] TELEPORTASI POPUP MODAL KE LUAR DARI MAIN LAYOUT */}
      {isMounted && selectedCard && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden relative">
            {stagingData.filter(s => s.id === selectedCard).map(item => (
              <div key={item.id}>
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Status Periode</h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{new Date(item.periode).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button onClick={() => setSelectedCard(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5 dark:text-white"/></button>
                </div>
                
                <div className="p-5 max-h-[60vh] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <Info className="w-5 h-5 text-blue-500 shrink-0"/>
                    <p className="text-xs text-blue-700 dark:text-blue-400">Data ini tertahan karena belum lengkap. Silakan upload file tambahan yang mengandung variabel merah di bawah untuk periode ini.</p>
                  </div>

                  <div className="space-y-3">
                    {REQUIRED_VARS.map((v, i) => {
                      const isFilled = item[v.key] !== null && item[v.key] !== undefined;
                      return (
                        <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${isFilled ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/50' : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/50'}`}>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{v.label}</span>
                          {isFilled ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle className="w-4 h-4"/> Terpenuhi ({item[v.key]})</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-500"><AlertCircle className="w-4 h-4"/> Kosong</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-950">
                  <button onClick={() => deleteStaging(item.id)} className="text-sm font-bold text-red-500 hover:text-red-700 px-4 py-2">Hapus Ruangan</button>
                  <button onClick={() => setSelectedCard(null)} className="text-sm font-bold bg-slate-200 dark:bg-slate-800 dark:text-white px-6 py-2 rounded-lg transition-colors">Tutup</button>
                </div>
              </div>
            ))}
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}