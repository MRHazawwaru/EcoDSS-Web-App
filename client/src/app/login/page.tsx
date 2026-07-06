"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, KeyRound, ArrowRight, Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function AuthPage() {
  const router = useRouter();
  
  // State Navigasi UI
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State Form Data
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // GANTI URL INI DENGAN URL HUGGING FACE MILIKMU NANTI SAAT DEPLOY
      const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`; 

      if (isLoginMode) {
        // --- LOGIKA LOGIN RIIL ---
        const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          username: formData.username,
          password: formData.password
        });
        
        // Simpan data sesi riil dari database
        localStorage.setItem("ecodss_auth", "true");
        localStorage.setItem("ecodss_role", res.data.role); 
        localStorage.setItem("ecodss_user_id", res.data.user_id); // Penting untuk filter dataset nanti!
        localStorage.setItem("ecodss_username", formData.username);
        
        toast.success(`Selamat datang kembali, ${res.data.username}!`);
        router.push("/dashboard"); 
      } else {
        // --- LOGIKA REGISTER RIIL ---
        await axios.post(`${API_BASE_URL}/api/auth/register`, {
          username: formData.username,
          password: formData.password
        });
        
        toast.success(`Akun ${formData.username} berhasil didaftarkan! Silakan login.`);
        setIsLoginMode(true); 
        setFormData({ username: "", password: "" });
      }
    } catch (error: any) {
      // Tangkap pesan error spesifik dari FastAPI (misal: "Username sudah terdaftar")
      const errorMsg = error.response?.data?.detail || "Terjadi kesalahan pada server. Pastikan backend menyala.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-600/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/20 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl z-10 transition-all duration-300">
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-2xl border transition-colors duration-300 ${isLoginMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            {isLoginMode ? <Lock className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-white text-center mb-2">
          {isLoginMode ? "EcoDSS Access" : "Daftar Akun Publik"}
        </h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          {isLoginMode ? "Sistem Pendukung Keputusan Kebijakan Ekonomi" : "Buat ruang kerjamu sendiri untuk simulasi AI."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-white px-10 py-3 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                placeholder="Input username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-12 py-3 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
                required
              />
              {/* Tombol Lihat Sandi */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 mt-4 disabled:opacity-50 ${isLoginMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {isLoading ? "Memproses..." : (isLoginMode ? "Masuk ke Sistem" : "Buat Akun Sekarang")}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Toggle Pindah Mode Register/Login */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center flex flex-col gap-2">
          <p className="text-sm text-slate-400">
            {isLoginMode ? "Belum punya akun?" : "Sudah punya ruang kerja?"}
          </p>
          <button 
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setFormData({ username: "", password: "" }); // Reset form
              setShowPassword(false);
            }}
            className={`text-sm font-bold transition-colors ${isLoginMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-emerald-400 hover:text-emerald-300'}`}
          >
            {isLoginMode ? "Daftar di sini." : "Kembali ke halaman Login."}
          </button>
        </div>
      </div>
    </div>
  );
}