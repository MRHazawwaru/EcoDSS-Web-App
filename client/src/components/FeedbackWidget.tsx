"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, X, ChevronRight, Upload, CheckCircle, Send, Loader2, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Daftar Menu untuk UAT
const MENUS = [
  { code: "DS", label: "Manajemen Dataset" },
  { code: "MT", label: "Model Training (MLOps)" },
  { code: "SM", label: "Simulasi Skenario" },
  { code: "HA", label: "Hasil Analisis" },
  { code: "UI", label: "Tampilan & Navigasi Umum" }
];

type FeedbackData = { text: string; file: File | null; previewUrl: string | null };

export default function FeedbackWidget() {
  // 1. SEMUA HOOKS DIKLARASIKAN DI ATAS (TIDAK BOLEH ADA RETURN SEBELUM INI)
  const [role, setRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackData>>({});
  
  // State Form Aktif
  const [currentText, setCurrentText] = useState("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Proses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("ecodss_role"));
  }, []);

  // 2. FUNGSI-FUNGSI LOGIKA
  const handleOpenMenuForm = (code: string) => {
    setActiveMenu(code);
    if (feedbacks[code]) {
      setCurrentText(feedbacks[code].text);
      setCurrentFile(feedbacks[code].file);
      setCurrentPreview(feedbacks[code].previewUrl);
    } else {
      setCurrentText("");
      setCurrentFile(null);
      setCurrentPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      setCurrentPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveDraft = () => {
    if (!currentText.trim()) {
      toast.error("Masukan tidak boleh kosong!");
      return;
    }
    setFeedbacks(prev => ({
      ...prev,
      [activeMenu!]: { text: currentText, file: currentFile, previewUrl: currentPreview }
    }));
    setActiveMenu(null);
  };

  const handleSubmitAll = async () => {
    const keys = Object.keys(feedbacks);
    if (keys.length === 0) return;

    setIsSubmitting(true);
    const username = localStorage.getItem("ecodss_username") || "Pengguna";
    const userId = localStorage.getItem("ecodss_user_id") || "guest";
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      for (const code of keys) {
        const item = feedbacks[code];
        let uploadedImageUrl = "";

        if (item.file && supabaseUrl && supabaseKey) {
          const fileExt = item.file.name.split('.').pop();
          const fileName = `uat_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/feedback_images/${fileName}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': item.file.type
            },
            body: item.file
          });

          if (uploadRes.ok) {
            uploadedImageUrl = `${supabaseUrl}/storage/v1/object/public/feedback_images/${fileName}`;
          }
        }

        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/`, {
          menu_code: code,
          feedback_text: item.text,
          image_url: uploadedImageUrl || null,
          username: username
        }, {
          headers: { "x-user-id": userId }
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFeedbacks({});
      }, 3000);

    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mengirim feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. EARLY RETURN HARUS DILETAKKAN DI SINI (Setelah semua Hooks)
  // Keamanan RBAC: Jika Super Admin, hilangkan widget 100% dari layar!
  if (role === "super_admin") return null;

  // 4. RENDER UI
  return (
    <>
      {/* Floating Action Button (FAB) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9990] bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/30 transition-transform active:scale-90 flex items-center justify-center"
          >
            <MessageSquarePlus className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Modal Popup */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-6 bg-slate-900/20 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] pointer-events-auto"
            >
              {isSuccess ? (
                // LAYAR SUKSES
                <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 h-80">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle className="w-20 h-20 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">Terima Kasih!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Saran & masukanmu sangat berharga untuk pengembangan EcoDSS.</p>
                </div>
              ) : activeMenu ? (
                // LAYAR FORM INPUT (PER MENU)
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-3">
                    <button onClick={() => setActiveMenu(null)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                      <X className="w-4 h-4" />
                    </button>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Tulis Masukan</p>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{MENUS.find(m => m.code === activeMenu)?.label}</h3>
                    </div>
                  </div>
                  
                  <div className="p-5 overflow-y-auto space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Deskripsi Saran / Bug</label>
                      <textarea 
                        rows={4}
                        placeholder="Contoh: Saat saya klik tombol X, warnanya kurang jelas..."
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/20 dark:text-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Lampiran Foto (Opsional)</label>
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                      
                      {currentPreview ? (
                        <div className="relative w-full h-32 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden group">
                          <img src={currentPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button onClick={() => {setCurrentFile(null); setCurrentPreview(null);}} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                          <Upload className="w-5 h-5 mb-2" />
                          <span className="text-xs font-bold">Upload Screenshot</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <button onClick={handleSaveDraft} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm py-3.5 rounded-xl hover:scale-[0.98] transition-transform">
                      Simpan Masukan Ini
                    </button>
                  </div>
                </div>
              ) : (
                // LAYAR UTAMA (DAFTAR MENU)
                <div className="flex flex-col h-full">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
                    <div>
                      <h3 className="font-black text-lg">Feedback</h3>
                      <p className="text-indigo-200 text-xs">Bantu kami menjadi lebih baik.</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 bg-indigo-700/50 hover:bg-indigo-500 rounded-xl transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-2 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/50">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest p-3">Pilih Halaman / Fitur</p>
                    <div className="space-y-1 px-2">
                      {MENUS.map((menu) => {
                        const isFilled = !!feedbacks[menu.code];
                        return (
                          <button
                            key={menu.code}
                            onClick={() => handleOpenMenuForm(menu.code)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                              isFilled 
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 shadow-sm" 
                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isFilled ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <ImageIcon className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                              <span className="text-sm font-bold text-left">{menu.label}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 ${isFilled ? "text-emerald-400" : "text-slate-300 dark:text-slate-600"}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {Object.keys(feedbacks).length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <button 
                        onClick={handleSubmitAll}
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-70"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        {isSubmitting ? "Mengirim Data & Foto..." : `Kirim ${Object.keys(feedbacks).length} Feedback`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}