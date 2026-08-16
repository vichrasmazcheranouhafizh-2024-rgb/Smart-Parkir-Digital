/**
 * Excel / CSV Exporter Utility for Dishub Surabaya
 * Formats multi-table reports with UTF-8 BOM for direct Microsoft Excel compatibility.
 */

import { ParkingLocation, Transaction, CheckInLog } from '../types';

export interface ExportDataPayload {
  locations: ParkingLocation[];
  transactions: Transaction[];
  logs: CheckInLog[];
  dateRangeLabel: string;
  totalRevenue: number;
}

export function exportAdminReportToExcel(payload: ExportDataPayload): void {
  const { locations, transactions, logs, dateRangeLabel, totalRevenue } = payload;
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const totalCapacity = locations.reduce((sum, l) => sum + l.totalCapacity, 0);
  const availableSlots = locations.reduce((sum, l) => sum + l.availableCount, 0);
  const occupiedSlots = Math.max(0, totalCapacity - availableSlots);
  const avgOccupancy = totalCapacity > 0 ? Math.round((occupiedSlots / totalCapacity) * 100) : 0;

  const lines: string[] = [];

  // Header
  lines.push(`"LAPORAN RESMI PENDAPATAN & OPERASIONAL PARKIR DIGITAL KOTA SURABAYA"`);
  lines.push(`"DINAS PERHUBUNGAN KOTA SURABAYA - BIDANG PARKIR & RETRIBUSI"`);
  lines.push(`"Tanggal Unduh: ${dateStr} ${timeStr} WIB | Filter Periode: ${dateRangeLabel}"`);
  lines.push(`""`);

  // Ringkasan Eksekutif
  lines.push(`"--- RINGKASAN EKSEKUTIF ---"`);
  lines.push(`"Indikator","Nilai"`);
  lines.push(`"Total Pendapatan Terverifikasi","Rp ${totalRevenue.toLocaleString('id-ID')}"`);
  lines.push(`"Total Titik Lokasi Parkir","${locations.length} Lokasi"`);
  lines.push(`"Total Kapasitas Slot","${totalCapacity} Slot"`);
  lines.push(`"Slot Terisi (Real-Time)","${occupiedSlots} Slot"`);
  lines.push(`"Slot Kosong (Real-Time)","${availableSlots} Slot"`);
  lines.push(`"Rata-rata Tingkat Okupansi","${avgOccupancy}%"`);
  lines.push(`"Metode Pembayaran Utama","100% QRIS & Non-Tunai Dishub"`);
  lines.push(`""`);

  // Tabel Rekapitulasi Lokasi
  lines.push(`"--- REKAPITULASI TITIK LOKASI PARKIR ---"`);
  lines.push(`"No","Nama Lokasi","Kategori","Wilayah / Kecamatan","Kapasitas","Slot Kosong","Okupansi (%)","Tarif / Jam (Rp)","Petugas Bertugas","Status KTA"`);
  locations.forEach((loc, idx) => {
    const catLabel = loc.category === 'off-street' ? 'Off-Street (Jalan Raya)' : 'In-Street (Gedung/Mall)';
    const jukir = loc.assignedJukirName || 'Petugas Dishub';
    const kta = loc.assignedJukirKTA || 'Terdaftar Resmi';
    lines.push(`"${idx + 1}","${loc.name}","${catLabel}","${loc.region}","${loc.totalCapacity}","${loc.availableCount}","${loc.occupancyRate}%","Rp ${loc.ratePerHour.toLocaleString('id-ID')}","${jukir}","${kta}"`);
  });
  lines.push(`""`);

  // Tabel Transaksi
  lines.push(`"--- DAFTAR TRANSAKSI KEUANGAN & QRIS ---"`);
  lines.push(`"No","ID Transaksi","Plat Kendaraan","Lokasi Parkir","Jenis Kendaraan","Nominal (Rp)","Waktu / Status","Tipe"`);
  transactions.forEach((tx, idx) => {
    const vType = tx.vehicleType === 'car' ? 'Mobil' : 'Motor';
    const status = tx.status || 'Success';
    const type = tx.type || 'Payment';
    lines.push(`"${idx + 1}","${tx.id}","${tx.plateNumber}","${tx.location}","${vType}","Rp ${tx.amount.toLocaleString('id-ID')}","${tx.timeAgo} (${status})","${type}"`);
  });
  lines.push(`""`);

  // Tabel Log Presensi / Aktivitas Gate
  lines.push(`"--- LOG PRESENSI CHECK-IN / CHECK-OUT PETUGAS ---"`);
  lines.push(`"No","ID Log","Plat Nomor","ID Booking","Tipe Masuk","Slot","Waktu WIB","Arah Gate","Lokasi"`);
  logs.forEach((log, idx) => {
    lines.push(`"${idx + 1}","${log.id}","${log.plateNumber}","${log.bookingID || '-'}","${log.type}","${log.slotID}","${log.time}","${log.direction}","${log.locationName}"`);
  });
  lines.push(`""`);
  lines.push(`"Catatan: Laporan ini dihasilkan secara otomatis oleh Sistem Parkir Digital Dishub Surabaya bersertifikasi elektronik."`);

  // Create UTF-8 BOM content
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Parkir_Surabaya_${dateStr}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
