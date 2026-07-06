"use client"; // Wajib ditambahkan agar layout ini bisa menyimpan state buka/tutup

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Menu } from "lucide-react"; // Import ikon hamburger

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // State memori: Mengingat status sidebar khusus di HP (default: tertutup/false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Sidebar Pintar kita yang sudah bisa menerima sinyal buka/tutup */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Area konten di kanan */}
      <div className="flex flex-col flex-1 overflow-hidden relative w-full">
        
        {/* HEADER AREA: Gabungan Tombol Mobile & Navbar */}
        <div className="flex items-center bg-white dark:bg-slate-900 lg:bg-transparent lg:block">
          
          {/* Tombol Hamburger: HANYA muncul di HP (lg:hidden) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors focus:outline-none z-5"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Navbar Bawaanmu */}
          <div className="flex-1 w-full border-b border-slate-200 dark:border-slate-800 lg:border-none">
            <Navbar />
          </div>
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 w-full relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}