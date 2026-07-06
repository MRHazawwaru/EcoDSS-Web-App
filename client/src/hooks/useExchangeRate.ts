import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCurrencyStore } from '@/store/useCurrencyStore';

export const useExchangeRate = () => {
  const { currency } = useCurrencyStore();
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      // Jika mata uang yang dipilih adalah Rupiah, rasionya tetap 1 (tidak perlu hitung API)
      if (currency === 'IDR') {
        setExchangeRate(1);
        return;
      }
      
      try {
        setIsLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
        
        // Mengambil data kurs terbaru dari API (Base USD)
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
        const rates = response.data.conversion_rates;
        
        // MENCARI RASIO SILANG (CROSS-RATE)
        // Karena data yang masuk dari Dashboard adalah Rupiah (IDR), kita cari nilai 1 IDR itu berapa mata uang tujuan.
        const idrRate = rates['IDR']; // Contoh: 15500
        const targetRate = rates[currency]; // Contoh untuk USD: 1, atau GBP: 0.8
        
        // Rumus Rasio: (Nilai Target / Nilai IDR)
        // Contoh IDR ke USD: 1 / 15500 = 0.0000645...
        const finalMultiplier = targetRate / idrRate;
        
        setExchangeRate(finalMultiplier);
        
      } catch (error) {
        console.error("Gagal mengambil nilai tukar:", error);
        setExchangeRate(1); // Fallback aman ke IDR jika koneksi terputus
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
  }, [currency]);

  // Fungsi ini sekarang bertindak sebagai Kalkulator SEKALIGUS Tukang Make-up
  const formatCurrency = (baseValueInIDR: number, isCompact: boolean = false) => {
    
    // 1. KALKULATOR: Kalikan nilai Rupiah murni dengan rasio kurs mata uang pilihan
    const convertedValue = baseValueInIDR * exchangeRate;

    // 2. MAKE-UP: Tentukan format bahasa dan singkatan
    const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: isCompact ? 0 : 2, 
      maximumFractionDigits: 2,
    };

    if (isCompact) {
      options.notation = "compact";
      options.compactDisplay = "short";
    }

    return new Intl.NumberFormat(locale, options).format(convertedValue);
  };

  return { exchangeRate, isLoading, formatCurrency };
};