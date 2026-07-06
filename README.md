
---

# EcoDSS (Economic Decision Support System)

**EcoDSS** adalah sebuah Sistem Pendukung Keputusan berbasis *Progressive Web App* (PWA) yang dirancang untuk melakukan simulasi kebijakan makroekonomi. Sistem ini menggunakan arsitektur *Decoupled* yang memisahkan antarmuka klien dengan mesin analitik. Dengan mengimplementasikan algoritma *Hybrid Machine Learning* (Random Forest & XGBoost), EcoDSS memungkinkan pengguna (eksekutif/peneliti) untuk memprediksi tingkat Inflasi (YoY) secara *real-time* berdasarkan skenario perubahan indikator ekonomi seperti BI Rate, Nilai Tukar (Kurs), dan Jumlah Uang Beredar (M2).

## 📸 Pratinjau Antarmuka (Dashboard)


*> Keterangan: Dasbor utama EcoDSS yang menyajikan metrik statistik sistem, status kesiapan AI, dan visualisasi grafik riwayat simulasi.*

## ✨ Fitur Utama

* **Autentikasi RBAC:** Pemisahan hak akses secara ketat antara `User` (Peneliti) dan `Super Admin`.
* **Manajemen Dataset (Bulk Insert):** Fitur unggah dokumen berekstensi `.csv` untuk memasukkan ribuan baris data historis secara efisien.
* **MLOps Terintegrasi:** Pelatihan ulang model AI (Model Training) yang bisa dieksekusi langsung dari antarmuka pengguna, lengkap dengan evaluasi metrik (MSE, MAE, R²).
* **Simulasi Skenario Interaktif:** Interaksi *slider range* untuk memanipulasi variabel ekonomi dengan proyeksi hasil inflasi seketika (*real-time inference*).
* **Riwayat & Audit Trail:** Perekaman otomatis setiap eksperimen parameter simulasi ke dalam *database*.
* **UAT Feedback (Ticketing):** *Widget* pelaporan interaktif bagi pengguna untuk mengirimkan masukan atau *bug* kepada admin.

## 🗂️ Struktur Proyek

Repositori ini menggunakan pendekatan *Monorepo* yang membagi proyek ke dalam dua direktori utama:

```text
ecodss-repository/
├── client/                # Antarmuka Klien (Next.js, Tailwind CSS, Axios)
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application routes & views
│   │   └── utils/           # Helper functions & API interceptors
│   └── package.json
└── server/                 # Mesin Logika & API (FastAPI, Scikit-Learn, XGBoost)
    ├── app/
    │   ├── api/             # API Routers / Endpoints
    │   ├── core/            # Security & Configs
    │   ├── ml_models/       # Machine Learning training & inference logic (.pkl files)
    │   └── models/          # SQLAlchemy ORM Database Models
    ├── requirements.txt
    └── main.py

```

## 🚀 Panduan Instalasi (Local Development)

### Prasyarat Sistem

Sebelum memulai, pastikan mesin komputasi Anda telah terinstal:

* [Node.js](https://nodejs.org/) (Versi 18.x atau lebih baru)
* [Python](https://www.python.org/) (Versi 3.10 atau lebih baru)
* Akun [Supabase](https://supabase.com/) (Untuk penyediaan basis data PostgreSQL)

### Langkah 1: Kloning Repositori

```bash
git clone https://github.com/[Username_Kamu]/ecodss.git
cd ecodss

```

### Langkah 2: Setup Database (Supabase)

1. Buat proyek baru di *dashboard* Supabase.
2. Dapatkan kredensial *Connection String* URI PostgreSQL dari menu *Database Settings*.
3. Sistem menggunakan SQLAlchemy ORM, sehingga tabel-tabel (`users`, `periods`, `datasets`, `history_simulasi`, `feedbacks`) akan terbuat secara otomatis saat *backend* pertama kali dijalankan.

### Langkah 3: Setup Backend/server (FastAPI & MLOps)

Buka terminal baru dan arahkan ke direktori *server*:

```bash
cd server

# Buat dan aktifkan Virtual Environment (Lingkungan Isolasi)
python -m venv venv
# Untuk Windows:
venv\Scripts\activate
# Untuk macOS/Linux:
source venv/bin/activate

# Instalasi dependencies (Pustaka Python)
pip install -r requirements.txt

```

Buat file konfigurasi variabel lingkungan bernama `.env` di dalam folder `backend/`:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[db_name]
SECRET_KEY=[generate_secret_key_bebas]
ALGORITHM=HS256

```

Jalankan *server*:

```bash
uvicorn main:app --reload

```

*> Backend API akan berjalan di: http://localhost:8000*

### Langkah 4: Setup Frontend (Next.js)

Buka tab terminal baru dan arahkan ke direktori *frontend*:

```bash
cd client

# Instalasi dependencies (Pustaka Node.js)
npm install

```

Buat file konfigurasi variabel lingkungan bernama `.env.local` di dalam folder `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000

```

Jalankan *client*:

```bash
npm run dev

```

*> Aplikasi klien akan berjalan di: http://localhost:3000*

## 💡 Alur Penggunaan Dasar (Quick Start)

1. **Akses Sistem:** Buka `http://localhost:3000` dan lakukan Registrasi akun baru, kemudian Login.
2. **Injeksi Data:** Masuk ke menu **Dataset**, unggah berkas `.csv` yang memuat struktur variabel historis makroekonomi.
3. **Training Model:** Navigasi ke menu **Repositori Model**, klik "Mulai Training Model". Tunggu hingga skor evaluasi $R^2$ dan galat (MSE/MAE) muncul di layar.
4. **Kunci Baseline:** Buka menu **Acuan Skenario**, pilih satu periode waktu spesifik untuk dijadikan titik awal (*start line*).
5. **Eksekusi Simulasi:** Masuk ke menu **Simulasi Skenario**, manipulasi *slider* variabel ekonomi (contoh: naikkan *BI Rate*), dan amati perubahan proyeksi inflasi secara interaktif.

## 👨‍💻 Penulis

Dikembangkan oleh **Muchammad Rofky Hazawwaru** sebagai proyek akhir Implementasi *Machine Learning* untuk Sistem Pendukung Keputusan.

* Email: rofkymuchammadofficial@gmail.com
* LinkedIn: https://www.linkedin.com/in/muchammadhazawwaru

## 📄 Lisensi

[MIT License](https://www.google.com/search?q=LICENSE) - Bebas digunakan dan dimodifikasi untuk tujuan akademis maupun komersial dengan mencantumkan atribusi pengembang.

---

Teks *Markdown* di atas sudah aku rancang menggunakan format *syntax highlighting* untuk blok kodenya, tabel, struktur folder, dan *badge* teknologi yang memukau. Kamu tinggal mengganti *placeholder* di dalam tanda kurung siku dan mengunggah gambar *dashboard* ke repositori tersebut agar tampilannya langsung terlihat elegan saat tautan QR Code-mu di-*scan* oleh dosen!