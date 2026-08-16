import React, { useState } from 'react';
import { Landmark, QrCode, ArrowUpRight, ArrowDownLeft, RefreshCcw, ShieldCheck, Download, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Transaction, ParkingLocation } from '../../types';
import { exportAdminReportToExcel } from '../../utils/excelExport';

interface AdminPaymentViewProps {
  transactions: Transaction[];
  locations: ParkingLocation[];
}

export default function AdminPaymentView({ transactions, locations }: AdminPaymentViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'Payment' | 'Refund'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalGTV = transactions.reduce((s, t) => s + (t.type !== 'Refund' ? t.amount : 0), 0);
  const totalRefund = transactions.reduce((s, t) => s + (t.type === 'Refund' ? t.amount : 0), 0);
  const netPAD = totalGTV - totalRefund;

  const filteredTx = transactions.filter((t) => {
    const matchesSearch = t.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || (t.type || 'Payment') === filterType;
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    exportAdminReportToExcel({
      locations,
      transactions,
      logs: [],
      dateRangeLabel: 'Laporan Keuangan & QRIS Real-Time',
      totalRevenue: netPAD,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-2.5 bg-emerald-500 rounded-lg text-xs font-black text-slate-950">BANK DISHUB JATIM</span>
            <span className="text-xs text-emerald-300 font-bold">100% QRIS Kas Daerah</span>
          </div>
          <h2 className="text-xl font-black">Pembukuan Keuangan & Mutasi QRIS</h2>
          <p className="text-xs text-slate-300 mt-0.5">Seluruh penerimaan retribusi parkir dan log pengembalian dana (refund) otomatis.</p>
        </div>

        <button
          onClick={handleExport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Download size={16} /> Ekspor Mutasi Excel
        </button>
      </div>

      {/* Financial Summary Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Gross QRIS Penerimaan</span>
            <ArrowUpRight size={18} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">Rp {totalGTV.toLocaleString('id-ID')}</p>
          <span className="text-[10px] font-bold text-slate-500 mt-1 block">Akumulasi transaksi bruto</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Auto-Refund (Telat ETA)</span>
            <RefreshCcw size={18} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">Rp {totalRefund.toLocaleString('id-ID')}</p>
          <span className="text-[10px] font-bold text-rose-500 mt-1 block">Dana dikembalikan ke warga</span>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between text-indigo-200 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Net Kas Daerah (PAD)</span>
            <Landmark size={18} className="text-emerald-300" />
          </div>
          <p className="text-2xl font-black text-white">Rp {netPAD.toLocaleString('id-ID')}</p>
          <span className="text-[10px] font-bold text-emerald-300 mt-1 block">✓ Telah disetor ke Kas Surabaya</span>
        </div>
      </div>

      {/* Transactions Ledger Table Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Buku Besar Transaksi</h3>
            <p className="text-xs text-slate-400">Daftar mutasi masuk QRIS dan refund otomatis</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari plat / lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Type Filters */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-black">
              {(['all', 'Payment', 'Refund'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterType === t ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'all' ? 'Semua' : t === 'Payment' ? 'Pemasukan' : 'Refund'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black">
              <tr>
                <th className="p-3 rounded-l-xl">ID Mutasi</th>
                <th className="p-3">Plat Nomor</th>
                <th className="p-3">Lokasi Parkir</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredTx.map((tx) => {
                const isRefund = tx.type === 'Refund';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-500">{tx.id}</td>
                    <td className="p-3 font-mono font-black text-slate-900">{tx.plateNumber}</td>
                    <td className="p-3 font-bold text-slate-700">{tx.location}</td>
                    <td className="p-3 text-slate-400">{tx.timeAgo}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black inline-flex items-center gap-1 ${
                        isRefund ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isRefund ? <RefreshCcw size={10} /> : <CheckCircle2 size={10} />}
                        {isRefund ? 'Refund Otomatis' : 'Lunas QRIS'}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-black text-xs ${isRefund ? 'text-rose-600' : 'text-slate-900'}`}>
                      {isRefund ? '-' : '+'}Rp {tx.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
