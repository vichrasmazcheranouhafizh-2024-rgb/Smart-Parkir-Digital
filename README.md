# 🚗 Parkir Digital Surabaya (ParkWise)

Aplikasi simulasi manajemen parkir digital modern berbasis web untuk Kota Surabaya. Proyek ini menampilkan alur multi-peran pengguna, petugas, dan admin dengan fokus pada reservasi slot, tiket QR, pemindaian kamera, serta validasi booking secara lokal.

---

## ✨ Fitur yang Sudah Ada

### 👤 Pengendara / User
- Pilih lokasi parkir dan slot secara interaktif
- Lihat status slot: Available, Occupied, Booked, dan Selected
- Lakukan pembayaran simulasi dengan beberapa metode pembayaran
- Dapatkan tiket reservasi berisi QR code unik
- QR code bisa dipindai oleh petugas melalui kamera perangkat

### 👮 Petugas Parkir
- Buka scanner QR dari layar petugas
- Menggunakan kamera HP untuk memindai tiket pengguna
- Menyalakan/mematikan flash kamera saat scanning
- Melakukan validasi booking dan memperbarui status check-in/check-out

### 🛡️ Admin
- Melihat tampilan dashboard admin sederhana
- Mengelola override status slot secara manual

---

## 🗂️ Struktur Folder

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
├── types.ts
└── main.tsx
```

---

## 🧱 Teknologi yang Digunakan
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Dexie.js (IndexedDB lokal)
- QRCode generator via qrcode
- HTML5 QR scanner via html5-qrcode
- Lucide React untuk icon

---

## ▶️ Cara Menjalankan

### Prasyarat
- Node.js 18+
- npm

### Langkah
1. Install dependency:
   ```bash
   npm install
   ```

2. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

3. Buka di browser:
   ```text
   http://localhost:3000
   ```

4. Build produksi:
   ```bash
   npm run build
   ```

---

## 📝 Catatan
- Data booking, log check-in, dan transaksi disimpan secara lokal di browser menggunakan IndexedDB.
- QR code yang dibuat pada tiket dapat dipindai oleh scanner petugas melalui kamera perangkat.
- Untuk pengalaman terbaik, gunakan browser yang mendukung akses kamera seperti Chrome atau Edge.
