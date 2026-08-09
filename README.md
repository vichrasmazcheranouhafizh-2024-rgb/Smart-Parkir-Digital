# 🚗 Parkir Digital Surabaya (ParkWise)

ParkWise adalah aplikasi web simulasi sistem parkir digital modern untuk Kota Surabaya. Aplikasi ini menggabungkan alur multi-role user, petugas parkir, dan admin dalam satu pengalaman yang terintegrasi, dengan fokus pada booking slot, tiket QR, pemindaian kamera, profil pengguna, dan penyimpanan data secara lokal maupun via Supabase.

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
