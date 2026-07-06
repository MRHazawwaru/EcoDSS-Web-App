"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, CalendarDays, Database, BrainCircuit, 
  Archive, SlidersHorizontal, LineChart, History, X, Users, UserCircle, KeyRound, Lock, Eye, EyeOff,
  MessageSquarePlus
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import axios from "axios";
import { toast } from "react-hot-toast";

const menuItems = [
  // [UPDATE ROUTE]: Path diubah menjadi /dashboard
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["super_admin", "user"] },
  { name: "Acuan Skenario", icon: CalendarDays, path: "/periode", roles: ["super_admin", "user"] },
  { name: "Dataset", icon: Database, path: "/dataset", roles: ["super_admin", "user"] },
  { name: "Model Training", icon: BrainCircuit, path: "/model-training", roles: ["super_admin", "user"] },
  { name: "Model Repository", icon: Archive, path: "/model-repository", roles: ["super_admin"] },
  { name: "Simulasi Skenario", icon: SlidersHorizontal, path: "/simulasi", roles: ["super_admin", "user"] },
  { name: "Hasil Analisis", icon: LineChart, path: "/hasil-analisis", roles: ["super_admin", "user"] },
  { name: "History Simulasi", icon: History, path: "/history-simulasi", roles: ["super_admin", "user"] },
  { name: "Manajemen User", icon: Users, path: "/admin/users", roles: ["super_admin"] },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen = true, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("User");
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassValue, setShowPassValue] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const savedRole = localStorage.getItem("ecodss_role");
    const savedName = localStorage.getItem("ecodss_username");
    
    setRole(savedRole || "user"); 
    setUsername(savedName || "Public User");
  }, []);

  const filteredMenus = menuItems.filter(item => role && item.roles.includes(role));

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok!");
      return;
    }

    try {
      setIsSubmittingPass(true);
      const userId = localStorage.getItem("ecodss_user_id");
      
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
        old_password: passwords.oldPassword,
        new_password: passwords.newPassword
      }, {
        headers: { "x-user-id": userId }
      });

      toast.success(response.data.message || "Password berhasil diperbarui!");
      setShowPasswordForm(false);
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Gagal mengubah password.");
    } finally {
      setIsSubmittingPass(false);
    }
  };

  return (
    <>
      {isOpen && setIsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col h-[100dvh] transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <h1 className="text-xl font-bold text-white tracking-wider">
            <span className="text-blue-500">Eco</span>DSS
          </h1>
          {setIsOpen && (
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="px-4 mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              {role === 'super_admin' ? (
                <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Administrator</>
              ) : (
                'Workspace Saya'
              )}
            </p>
          </div>
          <ul className="space-y-1 px-3">
            {filteredMenus.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.name}>
                  <Link href={item.path} onClick={() => setIsOpen && setIsOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
            
            {/* [UPDATE] Area Menu Rahasia Khusus Super Admin */}
            {role === "super_admin" && (
              <li className="mt-8">
                <p className="px-3 text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2 mt-6">Manajemen Feedback</p>
                <Link 
                  href="/uat-feedback" 
                  onClick={() => setIsOpen && setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    pathname === "/uat-feedback" 
                      ? "bg-amber-500 text-slate-900 font-bold shadow-md shadow-amber-900/20" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <MessageSquarePlus className={`w-5 h-5 ${pathname === "/uat-feedback" ? "text-slate-900" : "text-slate-400"}`} />
                  <span className="text-sm">Feedbacks</span>
                </Link>
              </li>
            )}
            
            <li className="mt-8 border-t border-slate-800 pt-4">
              <LogoutButton />
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800 text-left shrink-0">
          <button onClick={() => setIsProfileOpen(true)} className="w-full flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg transition-colors group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg group-hover:scale-105 transition-transform shadow-inner">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-bold text-white truncate capitalize">{username}</p>
              <p className="text-[10px] text-slate-400 font-medium capitalize flex items-center gap-1">
                {role === 'super_admin' ? <span className="text-emerald-400">Super Admin</span> : 'Public User'}
              </p>
            </div>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden relative"
            >
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  setShowPasswordForm(false);
                }} 
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="px-8 pb-8 pt-10">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-indigo-500 dark:to-blue-600 flex items-center justify-center text-4xl font-black text-white shadow-xl border-4 border-slate-50 dark:border-slate-800 transition-all">
                    {username.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">{username}</h2>
                  <div className="inline-block mt-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                    Role: {role === 'super_admin' ? 'Super Administrator' : 'User Publik'}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!showPasswordForm ? (
                    <motion.div key="info" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                      <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-slate-500 dark:text-slate-300">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Username ID</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">@{username.toLowerCase()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-slate-500 dark:text-slate-300">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Keamanan</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Enkripsi Aktif</p>
                        </div>
                        <button onClick={() => setShowPasswordForm(true)} className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg">
                          Ubah Sandi
                        </button>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button onClick={() => setIsProfileOpen(false)} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors">
                          Tutup Profil
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handlePasswordChange} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2"><Lock className="w-3.5 h-3.5"/> Form Ubah Sandi</h3>
                          <button type="button" onClick={() => setShowPassValue(!showPassValue)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                            {showPassValue ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                          </button>
                        </div>
                        
                        <input 
                          type={showPassValue ? "text" : "password"} placeholder="Password Lama" required
                          value={passwords.oldPassword} onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
                        />
                        <input 
                          type={showPassValue ? "text" : "password"} placeholder="Password Baru" required minLength={6}
                          value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
                        />
                        <input 
                          type={showPassValue ? "text" : "password"} placeholder="Konfirmasi Password Baru" required minLength={6}
                          value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setShowPasswordForm(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors">
                          Batal
                        </button>
                        <button type="submit" disabled={isSubmittingPass} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl transition-colors">
                          {isSubmittingPass ? "Memproses..." : "Simpan"}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}