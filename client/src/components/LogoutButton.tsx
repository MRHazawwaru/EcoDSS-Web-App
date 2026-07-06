"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. HANCURKAN SEMUA KUNCI AKSES DARI BROWSER
    localStorage.removeItem("ecodss_user_id");
    localStorage.removeItem("ecodss_role");
    localStorage.removeItem("ecodss_username");
    
    // (Opsional) Hapus juga jejak skenario di memori browser
    const userId = localStorage.getItem("ecodss_user_id");
    localStorage.removeItem(`eco_dss_history_${userId}`);
    localStorage.removeItem(`active_baseline_${userId}`);
    localStorage.removeItem(`simulasi_baseline_${userId}`);

    // 2. Berikan notifikasi
    toast.success("Berhasil keluar dari sistem.");
    
    // 3. Tendang kembali ke halaman Login
    router.replace("/login"); 
  };

  return (
    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
      <LogOut className="w-5 h-5" />
      <span className="text-sm font-medium">Logout</span>
    </button>
  );
}