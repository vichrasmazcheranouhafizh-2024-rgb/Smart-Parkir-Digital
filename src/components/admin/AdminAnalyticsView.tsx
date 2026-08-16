import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, MapPin, ArrowUpRight, PieChart, Activity, Car, Bike, Sparkles } from 'lucide-react';
import { ParkingLocation, Transaction } from '../../types';

interface AdminAnalyticsViewProps {
  locations: ParkingLocation[];
  transactions: Transaction[];
  onBack?: () => void;
}

export default function AdminAnalyticsView({ locations, transactions }: AdminAnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('7days');

  const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0);
  const carCount = transactions.filter(t => t.vehicleType === 'car').length;
  const motorCount = transactions.filter(t => t.vehicleType === 'motorcycle').length;

  const regionBreakdown = locations.reduce<Record<string, { total: number; occupied: number; revenue: number }>>((acc, loc) => {
    if (!acc[loc.region]) {
      acc[loc.region] = { total: 0, occupied: 0, revenue: 0 };
    }
    const occupied = loc.totalCapacity - loc.availableCount;
    acc[loc.region].total += loc.totalCapacity;
    acc[loc.region].occupied += occupied;
    acc[loc.region].revenue += occupied * loc.ratePerHour * 3;
    return acc;
  }, {});

  const peakHours = [
    { hour: '07:00 - 09:00', percent: 65, label: 'Pagi (Berangkat Kerja)' },
    { hour: '12:00 - 14:00', percent: 88, label: 'Siang (Makan Siang & Bisnis)' },
    { hour: '17:00 - 20:00', percent: 94, label: 'Malam (Tunjungan Romansa / Mall)' },
    { hour: '21:00 - 23:00', percent: 45, label: 'Larut Malam' },
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-2 bg-indigo-500 rounded-lg text-xs font-black">PAD ANALYTICS</span>
            <span className="text-xs text-indigo-200 font-bold">Dishub Kota Surabaya</span>
          </div>
          <h2 className="text-xl font-black">Analitik & Performa Parkir Digital</h2>
          <p className="text-xs text-slate-300 mt-0.5">Visualisasi tren okupansi, jam sibuk, dan proyeksi penerimaan retribusi daerah.</p>
        </div>

        <div className="flex bg-white/10 p-1 rounded-2xl border border-white/10 text-xs font-bold">
          {(['today', '7days', '30days'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timeRange === r ? 'bg-white text-indigo-900 shadow' : 'text-slate-200 hover:text-white'
              }`}
            >
              {r === 'today' ? 'Hari Ini' : r === '7days' ? '7 Hari' : '30 Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Transaksi</span>
            <Activity size={16} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{transactions.length + 142}</p>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +18.4% dari periode lalu
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Okupansi Rata-rata</span>
            <BarChart3 size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">72.8%</p>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> Efisiensi slot tinggi
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Proporsi Mobil 🚗</span>
            <Car size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">58%</p>
          <span className="text-[10px] font-bold text-slate-500 mt-1 block">Tarif rata-rata Rp 4.500/jam</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Proporsi Motor 🛵</span>
            <Bike size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">42%</p>
          <span className="text-[10px] font-bold text-slate-500 mt-1 block">Tarif rata-rata Rp 2.000/jam</span>
        </div>
      </div>

      {/* Peak Hours Occupancy Bars */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Distribusi Jam Sibuk (Peak Hours)</h3>
            <p className="text-xs text-slate-400">Analisis kepadatan kendaraan harian di titik parkir Surabaya</p>
          </div>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Puncak: 17:00 - 20:00 WIB
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {peakHours.map((p) => (
            <div key={p.hour} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">{p.hour} ({p.label})</span>
                <span className={`${p.percent > 85 ? 'text-rose-600' : 'text-slate-600'}`}>{p.percent}% Kepadatan</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    p.percent > 85 ? 'bg-gradient-to-r from-orange-500 to-rose-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                  }`}
                  style={{ width: `${p.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Region Revenue Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Rekapitulasi Okupansi Per Wilayah Surabaya</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black">
              <tr>
                <th className="p-3 rounded-l-xl">Kecamatan / Wilayah</th>
                <th className="p-3">Total Kapasitas</th>
                <th className="p-3">Terisi</th>
                <th className="p-3">Okupansi</th>
                <th className="p-3 rounded-r-xl">Estimasi PAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {Object.entries(regionBreakdown).map(([region, data]) => {
                const occ = data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0;
                return (
                  <tr key={region} className="hover:bg-slate-50">
                    <td className="p-3 font-black text-slate-900 flex items-center gap-1.5">
                      <MapPin size={14} className="text-indigo-600" /> {region}
                    </td>
                    <td className="p-3">{data.total} Slot</td>
                    <td className="p-3 font-bold text-indigo-600">{data.occupied} Slot</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        occ > 70 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {occ}%
                      </span>
                    </td>
                    <td className="p-3 font-black text-slate-900">Rp {data.revenue.toLocaleString('id-ID')}</td>
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
