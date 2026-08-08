# 🚗 Parkir Digital Surabaya (ParkWise)

Aplikasi manajemen dan pemesanan parkir digital modern berbasis web untuk Kota Surabaya. Sistem ini mendukung arsitektur multi-peran (User/Pengendara, Petugas Lapangan, dan Admin Kota) serta dilengkapi dengan integrasi peta interaktif Leaflet, scanner QR, top-up e-wallet, dan manajemen slot parkir real-time.

---

## 🏗️ Struktur Folder Proyek (Modular Architecture)

Kode sumber proyek ini telah ditata secara modular berdasarkan domain/fitur untuk kerapian dan kemudahan pengembangan:

```text
parkir-digital-surabaya/
├── public/
├── src/
│   ├── assets/                # Asset gambar dan media proyek
│   ├── components/            # Komponen UI terisolasi per modul domain
│   │   ├── admin/             # Dashboard Admin & Pengaturan Override Slot
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── AdminSlotOverride.tsx
│   │   ├── auth/              # Alur Autentikasi & Onboarding
│   │   │   ├── LoginView.tsx
│   │   │   ├── OnboardingView.tsx
│   │   │   └── SplashView.tsx
│   │   ├── common/            # Komponen Publik & Floating Controls
│   │   │   └── RoleSelector.tsx
│   │   ├── petugas/           # Dashboard Petugas & Pemindai QR Gate
│   │   │   ├── PetugasDashboard.tsx
│   │   │   └── PetugasScanner.tsx
│   │   ├── user/              # Fitur Pengendara / User
│   │   │   ├── BookingConfirmation.tsx
│   │   │   ├── SlotSelection.tsx
│   │   │   ├── SuccessTicket.tsx
│   │   │   └── UserDashboard.tsx
│   │   └── index.ts           # Central Barrel Export Komponen
│   ├── utils/                 # Utility helper (Format Rupiah, Waktu WIB, dll)
│   │   └── formatters.ts
│   ├── App.tsx                # State Machine & Routing Utama
│   ├── data.ts                # Mock Data Lokasi, Slot, Log, & Transaksi
│   ├── main.tsx               # Entry Point React 19
│   ├── types.ts               # Interface & Tipe Data TypeScript
│   └── index.css              # Custom Styling & Utilities
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ✨ Fitur Utama Aplikasi

### 📱 1. Pengendara (User)
- **Interactive Map Search**: Menampilkan titik lokasi parkir (*Off-Street* pinggir jalan & *In-Street* mall/gedung) di Surabaya dengan Leaflet Map.
- **Slot Selection**: Pemilihan slot parkir interaktif per lantai/zona dengan indikator status (*Available*, *Occupied*, *Booked*, *Selected*).
- **Cashless Payment & E-Wallet Top Up**: Pembayaran dengan QRIS, OVO, DANA, GoPay, atau Bank Transfer. Saldo e-wallet dapat di-top up secara dinamis.
- **Scan & Park**: Kamera pemindai QR untuk memverifikasi gate pintu parkir secara otomatis.
- **QR Digital Ticket**: Tiket digital dengan ID Reservasi unik dan integrasi navigasi Google Maps.

### 👮 2. Petugas Parkir (Petugas)
- **Monitor Kuota Real-time**: Pantau jumlah slot kosong dan terisi di zona penugasan.
- **QR Scanner Verifikasi**: Pemindaian QR tiket pengunjung untuk konfirmasi Check-In / Check-Out.
- **Catatan Log Kendaraan**: Riwayat log kendaraan masuk dan keluar secara instan.

### 🛡️ 3. Administrator (Admin Kota)
- **Surabaya Overview Dashboard**: Metrik total reservasi, pendapatan daerah, serta statistik statistik pengguna kota.
- **Interactive Map Hotspots**: Pemantauan tingkat kepadatan parkir utama kota (TP, Pakuwon, Grand City).
- **Slot Override Console**: Kemampuan merubah status slot secara manual untuk keperluan perawatan (*Maintenance Lock*) atau penyesuaian lapangan.

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

### Prasyarat
- **Node.js** (v18 atau lebih baru)
- **npm**

### Langkah-langkah
1. **Install Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Mode Pengembang (Dev Server)**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

3. **Verifikasi Kompilasi TypeScript**:
   ```bash
   npm run lint
   ```

4. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 🛠️ Teknologi yang Digunakan
- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Maps**: Leaflet JS
