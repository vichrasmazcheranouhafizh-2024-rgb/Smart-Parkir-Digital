<div align="center">

# 🅿️ ParkWise
### *Smart Digital Parking Management — Kota Surabaya*

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=for-the-badge)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)](#)

**ParkWise** adalah aplikasi web simulasi parkir digital modern untuk Kota Surabaya.  
Mengintegrasikan alur **multi-role** — Warga, Petugas Parkir, dan Admin Dishub — dalam satu ekosistem yang terhubung penuh: dari booking slot real-time, tiket QR, pembayaran QRIS, hingga laporan keuangan dan analitik daerah.

[🚀 Mulai Sekarang](#-cara-menjalankan) · [📖 Dokumentasi](#-fitur-utama) · [🐛 Laporkan Bug](https://github.com/vichrasmazcheranouhafizh-2024-rgb/Smart-Parkir-Digital/issues)

</div>

---

## 🌟 Kenapa ParkWise?

| Masalah Umum | Solusi ParkWise |
|---|---|
| Parkir semrawut tanpa informasi slot kosong | Peta Leaflet real-time dengan slot warna-warni |
| Pembayaran tunai rawan pungli | Eksklusif **QRIS** – 100% non-tunai |
| Jukir nakal tidak terverifikasi | Scan KTA digital & sistem verifikasi Dishub |
| Tidak ada kejelasan saat terlambat datang | Auto-refund 100% jika lewat batas waktu tiba |
| Data parkir sulit dimonitor | Dashboard admin dengan analytics & Excel export |

---

## ✨ Fitur Utama

### 👤 Warga (Citizen)
- 🗺️ **Peta Interaktif Real-Time** – Visualisasi slot parkir langsung di peta (hijau = kosong, oranye = terisi, putih = maintenance, merah = blokir ilegal)
- 📅 **Reservasi Slot** – Pilih lokasi, slot, dan estimasi waktu tiba secara langsung dari peta
- 📱 **Pembayaran QRIS** – Satu-satunya metode: QRIS Standar Nasional 100% Non-Tunai
- ⏱️ **ETA Countdown & Auto-Refund** – Jika melebihi batas waktu tiba, reservasi otomatis dibatalkan dan uang dikembalikan penuh via QRIS
- 🎫 **Tiket QR Digital** – Tiket reservasi lengkap dengan QR code unik untuk scan masuk gate
- 🔍 **Cek Jukir** – Verifikasi identitas jukir resmi via scan KTA / QR dengan kamera HP
- 🚨 **Lapor Pungli** – Laporkan pungutan liar langsung ke Dishub

### 👮 Petugas Parkir (Jukir Resmi)
- 📸 **Scanner QR Gate** – Pindai tiket warga via kamera perangkat untuk verifikasi check-in/out
- 📍 **Claim Lokasi Eksklusif** – Pilih lokasi jaga yang belum diambil petugas lain
- ⏳ **Verifikasi Akun Bertahap** – Akun baru otomatis masuk status *pending* hingga di-ACC oleh Admin
- 📊 **Dashboard Terisolasi** – Statistik slot kosong/terisi khusus area tugas yang diampunya

### 🛡️ Admin Dishub
- 📱 **Mobile Bottom Navbar** – Navigasi responsif untuk memudahkan akses di ponsel
- ✅ **Approval System** – Notifikasi & persetujuan akun Petugas / Admin baru secara real-time
- 🗺️ **Slot Override Map** – Ubah status slot langsung dari peta (empty, booked, maintenance, blokir)
- 🖼️ **Ganti Foto Lokasi** – Upload/update thumbnail gambar tiap titik parkir
- 📊 **Analytics Dashboard** – Grafik jam sibuk, distribusi kendaraan, dan PAD per wilayah
- 💰 **Pembukuan Kas (PAD)** – Ledger transaksi QRIS, log auto-refund, dan rekap keuangan daerah
- 📥 **Ekspor Laporan Excel** – Download laporan lengkap (.csv) ke penyimpanan lokal secara instan
- 📋 **Laporan Performa Harian** – Generator KPI, target PAD, efisiensi jukir, status pungli
- 🔧 **Filter Waktu Fleksibel** – Filter data: Hari Ini, 24 Jam, 7 Hari, 30 Hari, atau Custom Date

---

## 🔄 Alur Penggunaan

```
Warga
  └─► Buka peta → Klik slot kosong → Konfirmasi QRIS → Terima tiket QR
         └─► Scan gate masuk/keluar (petugas verifikasi QR)
         └─► Jika telat → Notifikasi otomatis → Refund 100% via QRIS

Petugas
  └─► Daftar akun → Pilih lokasi kosong → Tunggu ACC Admin
         └─► Buka scanner → Pindai QR warga → Check-in / Check-out

Admin
  └─► Login → Pantau dashboard → Kelola slot / petugas / laporan
         └─► Override slot map → Ekspor Excel → ACC akun baru
```

---

## 🧰 Stack Teknologi

| Layer | Teknologi |
|---|---|
| **Framework** | React 19 + TypeScript 5 |
| **Build Tool** | Vite 6.4 |
| **Styling** | Tailwind CSS 3 |
| **Maps** | Leaflet 1.9 + React Leaflet |
| **Local DB** | Dexie.js (IndexedDB) |
| **QR Generate** | qrcode |
| **QR Scanner** | html5-qrcode |
| **Icons** | Lucide React |
| **Cloud Sync** | Supabase *(opsional)* |

---

## 🗂️ Struktur Proyek

```text
src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminSlotOverride.tsx
│   │   ├── AdminPetugasManage.tsx
│   │   ├── AdminPungliCenter.tsx
│   │   ├── AdminAnalyticsView.tsx      ← NEW
│   │   └── AdminPaymentView.tsx        ← NEW
│   ├── auth/
│   │   ├── RoleLoginView.tsx
│   │   └── RoleHomeView.tsx
│   ├── common/
│   ├── petugas/
│   │   ├── PetugasDashboard.tsx
│   │   └── PetugasScanner.tsx
│   └── user/
│       ├── UserDashboard.tsx
│       ├── SlotSelection.tsx
│       ├── BookingConfirmation.tsx
│       ├── SuccessTicket.tsx
│       ├── VerifyJukirView.tsx
│       └── LaporPungliView.tsx
├── App.tsx                             # Root state machine & router
├── data.ts                             # Seed data (lokasi, slot, koordinat)
├── db.ts                               # IndexedDB helpers (Dexie)
├── types.ts                            # Domain type definitions
├── utils/
│   └── excelExport.ts                  # Excel/CSV generator
└── lib/
    └── supabase.ts                     # Supabase sync layer (opsional)
```

---

## ▶️ Cara Menjalankan

### Prasyarat
- **Node.js** ≥ 18
- **npm** ≥ 9

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/vichrasmazcheranouhafizh-2024-rgb/Smart-Parkir-Digital.git
cd Smart-Parkir-Digital

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

Buka browser di **http://localhost:3000**  
> Gunakan Chrome atau Edge untuk akses kamera yang optimal.

```bash
# Build untuk produksi
npm run build

# Output tersimpan di folder dist/
```

---

## 🔐 Konfigurasi Supabase *(Opsional)*

Buat file `.env.local` di root project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_BUCKET=parking-tickets
VITE_SUPABASE_FOLDER=tickets
```

> ⚠️ Gunakan hanya **publishable key** di sisi client. Jangan gunakan secret key.  
> Tanpa Supabase, aplikasi tetap berjalan penuh secara lokal via IndexedDB.

---

## 📝 Catatan Penting

- Data booking, log check-in, transaksi, dan laporan tersimpan secara lokal via **IndexedDB** (persisten antar reload).
- QR code di tiket dapat dipindai oleh petugas menggunakan scanner bawaan aplikasi.
- Untuk pengalaman kamera terbaik, gunakan browser berbasis Chromium (Chrome ≥ 90, Edge ≥ 90).
- Aplikasi dirancang **mobile-first** — optimal di layar ponsel Android & iOS.

---

## 📌 Status Proyek

| Fitur | Status |
|---|---|
| UI role-based (Warga, Petugas, Admin) | ✅ Selesai |
| Peta real-time slot (Leaflet) | ✅ Selesai |
| QR booking & scan verifikasi | ✅ Selesai |
| Pembayaran QRIS eksklusif | ✅ Selesai |
| Auto-refund jika telat | ✅ Selesai |
| Approval sistem akun baru | ✅ Selesai |
| Analytics & Laporan PAD | ✅ Selesai |
| Ekspor Excel | ✅ Selesai |
| Integrasi Supabase | ✅ Tersedia (opsional) |

---

## 📜 Lisensi

Didistribusikan di bawah lisensi **Apache-2.0**. Lihat file `LICENSE` untuk detail.

---

<div align="center">
  <sub>🏙️ Dibangun dengan ❤️ untuk Surabaya yang lebih cerdas dan modern.</sub>
</div>


---

## ✨ Ringkasan Aplikasi

ParkWise dirancang sebagai prototype dashboard parkir digital yang menampilkan alur pengguna nyata:
- pengguna dapat mencari lokasi parkir, memilih slot, melakukan pembayaran simulasi, dan menerima tiket QR,
- petugas dapat memindai QR melalui kamera perangkat untuk memverifikasi booking,
- admin dapat melihat dan mengelola informasi slot serta status operasional parkir.

---

## 🚀 Fitur Utama

### 👤 Pengguna / User
- Memilih lokasi parkir dan slot secara interaktif
- Melihat status slot seperti Available, Occupied, Booked, dan Selected
- Melakukan simulasi pembayaran dengan beberapa metode pembayaran
- Mendapatkan tiket reservasi yang berisi QR code unik
- Mengelola profil pengguna, termasuk foto profil, username, password, alamat, dan notifikasi

### 👮 Petugas Parkir
- Membuka scanner QR lewat kamera perangkat
- Memindai tiket pengguna dari HP
- Menyalakan dan mematikan flash kamera saat proses scanning
- Melakukan validasi booking dan mengelola status check-in / check-out

### 🛡️ Admin
- Melihat dashboard admin yang terstruktur
- Mengelola status slot secara manual melalui override
- Menyaksikan data operasional parkir dalam bentuk tampilan yang lebih informatif

---

## 🔄 Alur Penggunaan Aplikasi

Berikut alur utama aplikasi ParkWise yang bisa dijelaskan secara singkat:

1. User mencari lokasi parkir yang tersedia
2. User memilih slot parkir dan melihat detail tarif serta status slot
3. User melakukan pembayaran simulasi dan menerima tiket reservasi beserta QR code
4. Petugas parkir memindai QR code melalui kamera untuk verifikasi booking
5. Admin melihat status operasional parkir dan mengelola override slot jika diperlukan

### Ringkasnya
- Pengguna: cari lokasi → pilih slot → bayar → dapat tiket QR
- Petugas: buka scanner → pindai QR → verifikasi check-in/check-out
- Admin: pantau data parkir → atur status slot → kelola operasional

---

## 🧰 Stack Teknologi
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Dexie.js untuk penyimpanan lokal berbasis IndexedDB
- QRCode generation via qrcode
- QR scanning via html5-qrcode
- Lucide React untuk ikon UI
- Supabase untuk storage tiket dan sinkronisasi data opsional

---

## 🗂️ Struktur Proyek

```text
src/
├── components/
│   ├── admin/
│   ├── auth/
│   ├── common/
│   ├── petugas/
│   │   ├── PetugasDashboard.tsx
│   │   └── PetugasScanner.tsx
│   └── user/
│       ├── BookingConfirmation.tsx
│       ├── SlotSelection.tsx
│       ├── SuccessTicket.tsx
│       └── UserDashboard.tsx
├── App.tsx
├── data.ts
├── db.ts
├── lib/
│   └── supabase.ts
├── types.ts
└── main.tsx
```

---

## ▶️ Cara Menjalankan

### Prasyarat
- Node.js 18+
- npm

### Langkah
1. Instal dependency:
   ```bash
   npm install
   ```

2. Jalankan aplikasi di mode development:
   ```bash
   npm run dev
   ```

3. Buka browser di:
   ```text
   http://localhost:3000
   ```

4. Build untuk produksi:
   ```bash
   npm run build
   ```

---

## 🔐 Konfigurasi Supabase

Aplikasi ini mendukung integrasi Supabase untuk keperluan storage tiket dan sinkronisasi data opsional.

Isi nilai environment berikut pada file `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_BUCKET=parking-tickets
VITE_SUPABASE_FOLDER=tickets
```

> Gunakan publishable key untuk frontend. Jangan memakai secret key di sisi client.

---

## 📝 Catatan Penting
- Data booking, log check-in, transaksi, dan profil pengguna disimpan secara lokal melalui IndexedDB.
- QR code yang dibuat pada tiket dapat dipindai melalui kamera perangkat oleh petugas parkir.
- Untuk pengalaman terbaik, gunakan browser yang mendukung akses kamera seperti Chrome atau Edge.
- Supabase digunakan sebagai dukungan tambahan untuk sinkronisasi data dan storage, tanpa menghapus mode lokal yang sudah stabil.

---

## 📌 Status Saat Ini
- UI role-based sudah berjalan
- QR booking dapat dipindai oleh petugas
- Profil pengguna sudah dapat diedit dan disimpan
- Integrasi Supabase tersedia untuk penyimpanan dan sinkronisasi opsional
