import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

// Menggunakan persist agar pilihan tema tersimpan di Local Storage browser
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'auto', // Default adalah Auto (deteksi jam)
      setMode: (mode) => set({ mode }),
    }),
    { name: 'theme-storage' }
  )
);