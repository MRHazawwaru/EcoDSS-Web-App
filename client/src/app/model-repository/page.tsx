"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Archive, Cpu, DatabaseZap, Clock, HardDrive, CheckCircle } from "lucide-react";
import axios from "axios";

interface SavedModel {
  filename: string;
  type: string;
  size_kb: number;
  last_modified: string;
}

export default function ModelRepositoryPage() {
  const [models, setModels] = useState<SavedModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const userId = localStorage.getItem("ecodss_user_id"); // [BARU]
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/repository/`, {
          headers: { "x-user-id": userId } // [BARU]
        });
        setModels(response.data.data);
      } catch (error) {
        console.error("Gagal memuat repository:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start sm:items-center gap-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-1 sm:mt-0">
          <Archive className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">Repository Model AI</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Gudang penyimpanan model machine learning dan data preprocessor yang siap digunakan untuk simulasi skenario.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Memuat repository...</div>
      ) : models.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <DatabaseZap className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Repository Masih Kosong</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Belum ada model AI yang dilatih. Silakan lakukan pelatihan model di menu Model Training terlebih dahulu.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {models.map((model) => (
            <motion.div 
              key={model.filename} variants={itemVariants}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> READY
              </div>

              <div className="flex items-center gap-4 mb-6 mt-2">
                <div className={`p-3 rounded-lg ${model.type.includes('AI') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
                  {model.type.includes('AI') ? <Cpu className="w-6 h-6" /> : <DatabaseZap className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={model.filename}>
                    {model.filename}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{model.type}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><HardDrive className="w-4 h-4"/> Ukuran File</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{model.size_kb} KB</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Update Terakhir</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">{model.last_modified}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}