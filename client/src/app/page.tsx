"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Database, BrainCircuit, LineChart, ShieldCheck, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Background Ornamen Ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Navbar Sederhana */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-wider">
          <span className="text-indigo-500">Eco</span>DSS.
        </div>
        <Link 
          href="/login" 
          className="px-6 py-2.5 text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all backdrop-blur-md"
        >
          Masuk / Daftar
        </Link>
      </nav>

      {/* Section Hero Utama */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Platform MLOps Publik
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6 max-w-4xl"
        >
          Simulasi Kebijakan Ekonomi dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Kecerdasan Buatan</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed"
        >
          EcoDSS memberikan kebebasan bagi para analis untuk membangun ruang kerja prediksi inflasi yang terisolasi. Upload dataset Anda, latih model AI, dan temukan skenario kebijakan terbaik.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link href="/login" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95">
            Mulai Ruang Kerja Gratis <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="#fitur" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-lg flex items-center justify-center transition-all">
            Pelajari Fitur
          </Link>
        </motion.div>
      </main>

      {/* Section Fitur Unggulan */}
      <section id="fitur" className="relative z-10 bg-slate-900/50 border-y border-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Arsitektur MLOps Skala Industri</h2>
            <p className="text-slate-400">Dibangun untuk memastikan akurasi data dan keamanan ruang lingkup pengujian.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-400">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Isolasi Database (Multi-Tenant)</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Setiap pengguna memiliki ruang database tersendiri. Data historis SEKI/BPS yang Anda unggah tidak akan pernah tumpang tindih dengan pengguna lain.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Private Model Training</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Sistem melatih model Machine Learning (Random Forest & XGBoost) secara eksklusif menggunakan pola dataset yang ada di ruang kerja pribadi Anda.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-amber-500/30 transition-colors">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-400">
                <LineChart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Simulasi Real-Time</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Eksperimen variabel ekonomi (BI Rate, M2, Kurs) dan dapatkan proyeksi laju inflasi instan beserta rekomendasi kebijakan turunan sistem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
        <div>
          &copy; {new Date().getFullYear()} EcoDSS. Dikembangkan untuk keperluan riset ekonomi.
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> Data Enkripsi Aktif
        </div>
      </footer>
    </div>
  );
}