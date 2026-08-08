# 🚗 Parkir Digital Surabaya (ParkWise)

ParkWise adalah aplikasi web simulasi sistem parkir digital modern untuk Kota Surabaya. Aplikasi ini menampilkan alur multi-role yang mencakup pengguna, petugas parkir, dan admin, dengan fokus pada reservasi slot, tiket QR, pemindaian kamera, serta pengelolaan data parkir secara terstruktur.

---

## ✨ Fitur Utama

### 👤 Pengguna / User
- Memilih lokasi parkir dan slot secara interaktif
- Melihat status slot seperti Available, Occupied, Booked, dan Selected
- Melakukan simulasi pembayaran dengan beberapa metode pembayaran
- Mendapatkan tiket reservasi yang berisi QR code unik
- Mengelola profil pengguna, termasuk foto profil, username, password, alamat, dan preferensi notifikasi

### 👮 Petugas Parkir
- Membuka scanner QR melalui kamera perangkat
- Memindai tiket pengguna dari HP
- Menyalakan dan mematikan flash kamera saat proses scanning
- Melakukan validasi booking dan mengelola status check-in / check-out

### 🛡️ Admin
- Melihat dashboard admin yang terstruktur
- Mengelola status slot secara manual melalui override
- Menyaksikan data operasional parkir dalam bentuk tampilan yang lebih informatif

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
- Supabase untuk integrasi storage dan sinkronisasi data opsional

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

Aplikasi ini sudah mendukung integrasi Supabase untuk keperluan storage tiket dan sinkronisasi data opsional.

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
