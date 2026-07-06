import { create } from 'zustand';

// Mendefinisikan tipe data agar TypeScript tidak protes dan kode bebas bug
interface CurrencyState {
  currency: string;
  setCurrency: (newCurrency: string) => void;
}

// Membuat penyimpanan global
export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: 'IDR', // Mata uang default sistem
  setCurrency: (newCurrency) => set({ currency: newCurrency }),
}));