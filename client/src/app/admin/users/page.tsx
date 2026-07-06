"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Trash2, ShieldAlert, User as UserIcon, RefreshCcw, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface UserData {
  id: number;
  username: string;
  role: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Validasi: Pastikan yang masuk sini benar-benar Super Admin
      const currentRole = localStorage.getItem("ecodss_role");
      if (currentRole !== "super_admin") {
        toast.error("Akses Ditolak! Halaman khusus Super Administrator.");
        router.push("/");
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users`);
      setUsers(res.data.data);
    } catch (error) {
      toast.error("Gagal mengambil daftar user");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: number, username: string, role: string) => {
    if (role === 'super_admin' && id === 1) {
      toast.error("Master Admin tidak dapat dihapus!");
      return;
    }

    if (confirm(`PERINGATAN FATAL!\n\nApakah Anda yakin ingin menghapus user "${username}" secara permanen? Seluruh dataset, model AI, dan history simulasi miliknya akan ikut musnah.`)) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/${id}`);
        toast.success(`User ${username} berhasil dihapus.`);
        fetchUsers();
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Gagal menghapus user");
      }
    }
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen User</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Pantau dan kelola hak akses seluruh pengguna aplikasi publik.</p>
          </div>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Konten Utama */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Toolbar Pencarian */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Total Pengguna Aktif: {users.length}</span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari username..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 dark:text-white transition-colors"
            />
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-semibold whitespace-nowrap">ID</th>
                <th className="p-4 font-semibold whitespace-nowrap">Profil & Username</th>
                <th className="p-4 font-semibold whitespace-nowrap">Hak Akses (Role)</th>
                <th className="p-4 font-semibold whitespace-nowrap text-right">Aksi Eksekusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400"><RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2"/> Memuat database user...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400">Pencarian tidak menemukan hasil.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors">
                    <td className="p-4 font-bold text-slate-400">#{u.id}</td>
                    <td className="p-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${u.role === 'super_admin' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold capitalize">{u.username}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        u.role === 'super_admin' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      }`}>
                        {u.role === 'super_admin' ? 'Super Admin' : 'User Publik'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.username, u.role)}
                        disabled={u.role === 'super_admin' && u.id === 1}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        title="Hapus User & Data"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}