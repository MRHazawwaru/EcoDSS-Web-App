"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, RefreshCcw, CheckCircle, Clock, ChevronRight, X, Image as ImageIcon, ExternalLink, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const MENUS = [
  { code: "DS", label: "Manajemen Dataset" },
  { code: "MT", label: "Model Training (MLOps)" },
  { code: "SM", label: "Simulasi Skenario" },
  { code: "HA", label: "Hasil Analisis" },
  { code: "UI", label: "Tampilan & Navigasi Umum" }
];

export default function UatFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/`, {
        headers: { "x-user-id": userId }
      });
      setFeedbacks(res.data.data);
    } catch (error) {
      toast.error("Gagal memuat data feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const markAsResolved = async (id: string) => {
    try {
      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}/resolve`, {}, {
        headers: { "x-user-id": userId }
      });
      toast.success("Feedback diselesaikan!");
      fetchFeedbacks();
      setSelectedFeedback(null);
    } catch (error) {
      toast.error("Gagal mengupdate status.");
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Yakin ingin menghapus feedback ini secara permanen?")) return;
    
    try {
      const userId = localStorage.getItem("ecodss_user_id") || "guest";
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}`, {
        headers: { "x-user-id": userId }
      });
      toast.success("Feedback berhasil dihapus permanen!");
      fetchFeedbacks(); // Refresh tabel
      setSelectedFeedback(null); // Tutup popup
    } catch (error) {
      toast.error("Gagal menghapus feedback.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <MessageSquarePlus className="w-8 h-8 text-amber-500" /> User Feedback Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pantau dan kelola masukan dari pengguna.</p>
        </div>
        <button onClick={fetchFeedbacks} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors">
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex justify-center"><RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : feedbacks.length === 0 ? (
          <div className="p-20 text-center text-slate-500">Belum ada feedback masuk.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="p-4 font-bold">Pengirim</th>
                  <th className="p-4 font-bold">Menu</th>
                  <th className="p-4 font-bold">Cuplikan Pesan</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {feedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-white">{item.username}</p>
                      <p className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md font-black text-[10px] uppercase tracking-widest">
                        {item.menu_code}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate font-medium">
                      {item.feedback_text}
                    </td>
                    <td className="p-4">
                      {item.status === 'resolved' ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500"><CheckCircle className="w-4 h-4"/> Selesai</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500"><Clock className="w-4 h-4"/> Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button onClick={() => setSelectedFeedback(item)} className="bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold px-4 py-2 rounded-lg transition-colors">
                        Buka Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL POP-UP DETAIL FEEDBACK (Mirip UI User) */}
      <AnimatePresence>
        {selectedFeedback && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
                <div>
                  <h3 className="font-black text-lg">Laporan Pengguna</h3>
                  <p className="text-indigo-200 text-xs">Dari: {selectedFeedback.username}</p>
                </div>
                <button onClick={() => setSelectedFeedback(null)} className="p-2 bg-indigo-700/50 hover:bg-indigo-500 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-slate-50 dark:bg-slate-950/50">
                {/* Visualisasi Pilihan Menu ala Widget User */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Lokasi Menu</p>
                  <div className="space-y-1">
                    {MENUS.map((menu) => {
                      const isMatch = menu.code === selectedFeedback.menu_code;
                      return (
                        <div
                          key={menu.code}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isMatch 
                              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/50" 
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isMatch ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <ImageIcon className="w-4 h-4" />}
                            <span className={`text-sm font-bold ${isMatch ? '' : 'text-xs font-medium'}`}>{menu.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pesan & Saran</p>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedFeedback.feedback_text}
                  </div>
                </div>

                {selectedFeedback.image_url && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> Bukti Lampiran
                    </p>
                    <a href={selectedFeedback.image_url} target="_blank" rel="noopener noreferrer" className="block relative w-full h-40 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden group">
                      <img src={selectedFeedback.image_url} alt="Screenshot Bug" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                        <span className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                          <ExternalLink className="w-3 h-3" /> Buka Penuh
                        </span>
                      </div>
                    </a>
                  </div>
                )}
              </div>

            {/* [UPDATE] Logika Tombol Selesai vs Hapus */}
              {selectedFeedback.status === 'resolved' ? (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
                  <button onClick={() => deleteFeedback(selectedFeedback.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/20">
                    <Trash2 className="w-5 h-5" /> Hapus Permanen
                  </button>
                </div>
              ) : (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
                  <button onClick={() => markAsResolved(selectedFeedback.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                    <CheckCircle className="w-5 h-5" /> Tandai Selesai Diperbaiki
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}