import React, { useMemo, useState } from 'react';
import { Calendar, Download, TrendingUp, Users, Coins, FileText, LayoutGrid, BarChart3, ParkingCircle, Landmark } from 'lucide-react';
import { ParkingLocation, Transaction } from '../../types';

interface AdminDashboardProps {
  locations: ParkingLocation[];
  transactions: Transaction[];
  onNavigateToLots: () => void;
  onLogout: () => void;
}

export default function AdminDashboard({
  locations,
  transactions,
  onNavigateToLots,
  onLogout
}: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'lots' | 'analytics' | 'payments'>('dashboard');

  const metrics = useMemo(() => {
    const totalCapacity = locations.reduce((sum, location) => sum + location.totalCapacity, 0);
    const availableSlots = locations.reduce((sum, location) => sum + location.availableCount, 0);
    const occupiedSlots = Math.max(0, totalCapacity - availableSlots);
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedSlots / totalCapacity) * 100) : 0;
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalReservations = Math.max(transactions.length + 20, occupiedSlots + transactions.length);
    const activeUsers = Math.max(1200, Math.round(transactions.length * 38 + occupiedSlots));

    return {
      totalCapacity,
      availableSlots,
      occupiedSlots,
      occupancyRate,
      totalRevenue,
      totalReservations,
      activeUsers,
    };
  }, [locations, transactions]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex text-slate-800 select-none">
      
      {/* Navigation Drawer Left Sidenav */}
      <aside className="hidden lg:flex flex-col py-6 space-y-4 bg-white border-r border-slate-200 shadow-sm h-screen w-[280px] fixed left-0 top-0 z-40 transition-all duration-200 shrink-0">
        
        {/* Profile Card Header Layout */}
        <div className="px-6 pb-4 mb-4 border-b border-slate-100 flex items-center gap-3">
          <img 
            alt="Admin Headshot" 
            className="w-12 h-12 rounded-full object-cover border" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkFSbTrg5ap-VyXHwmAvGpre2aFBG6QpyOo-EiJIny5Y5tgh2o_yjDlJ9pJu9GDsSLbIM4cJ7YB6VMzZCMfP_Y88dTVJhjOIg0oPeQfFh-NfppovJGK8BVqYQ9cqCvUnzjzP4DjkV8dyGbw2WDBk_tJ9K8Xy0OQ07ninDjPpSMph__D4Ob_bzKe1yxq1ACt2b2CK4EIwqbYzTCZDr_kiIkd4DpRK-ia42IwlR6wErr3BjeJvAV26qtNWBg-6Bl9fz3KdbU2os1-ZYz" 
          />
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-none">Admin Panel</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Asset Surabaya</p>
            <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded mt-1.5 inline-block">v2.1.0</span>
          </div>
        </div>

        {/* Dynamic Sidebar Links */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1 font-sans text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeMenu === 'dashboard' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <LayoutGrid size={16} />
            <span>Overview</span>
          </button>

          <button 
            onClick={() => { setActiveMenu('lots'); onNavigateToLots(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeMenu === 'lots' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <ParkingCircle size={16} />
            <span>Manage Lots</span>
          </button>

          <button 
            onClick={() => { setActiveMenu('analytics'); alert('Simulasi: Layanan Analisis Kota Surabaya sedang berjalan.'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeMenu === 'analytics' 
                ? 'bg-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={16} />
            <span>Analytics</span>
          </button>

          <button 
            onClick={() => { setActiveMenu('payments'); alert('Simulasi: Gerbang Pembayaran VA & QRIS Surabaya terpantau normal.'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeMenu === 'payments' 
                ? 'bg-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Landmark size={16} />
            <span>Payments</span>
          </button>
        </nav>

        {/* Signout bottom wrapper link */}
        <div className="px-4 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl border border-red-200 text-xs font-bold uppercase transition-colors"
          >
            Sistem Keluar
          </button>
        </div>
      </aside>

      {/* Main Panel Content Wrapper */}
      <main className="flex-1 lg:ml-[280px] p-4 lg:p-8 space-y-6">
        
        {/* Dashboard Title Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/50 pb-5">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Surabaya Overview</h1>
            <p className="text-xs font-semibold text-slate-400">Metrik real-time &amp; status kapasitas parkir digital kota Surabaya.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert('Simulasi rentang waktu tanggal diperbarui.')}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Calendar size={14} className="text-slate-400" />
              24 Jam Terakhir
            </button>
            <button 
              onClick={() => alert('Simulasi: Laporan PDF Surabaya Smart Parking diunduh!')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/10"
            >
              <Download size={14} />
              Ekspor Laporan
            </button>
          </div>
        </div>

        {/* Metric Cards Row grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Total Bookings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 sm:p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <FileText size={20} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest gap-0.5">
                <TrendingUp size={10} /> +12.5%
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Total Reservasi</p>
              <h3 className="text-2xl font-black text-slate-800 leading-none">{metrics.totalReservations.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          {/* Card 2: Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 sm:p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <Coins size={20} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest gap-0.5">
                <TrendingUp size={10} /> +8.2%
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Pendapatan Daerah (IDR)</p>
              <h3 className="text-2xl font-black text-slate-800 leading-none">Rp {metrics.totalRevenue.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          {/* Card 3: Active Users */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 sm:p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Users size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 flex items-center bg-slate-100 px-2 py-1 rounded-full border uppercase tracking-widest gap-0.5">
                • 0.0%
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Pengguna Aktif Kota</p>
              <h3 className="text-2xl font-black text-slate-800 leading-none">{metrics.activeUsers.toLocaleString('id-ID')}</h3>
            </div>
          </div>

        </div>

        {/* Bento grid panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Real-time Map Monitoring (Left column block) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Real-time City Map (Surabaya)</h3>
              <button 
                onClick={onNavigateToLots}
                className="text-xs font-extrabold text-indigo-600 hover:underline"
              >
                Detil Lot
              </button>
            </div>
            
            <div className="relative flex-1 min-h-[400px] bg-slate-100 overflow-hidden">
              <img 
                alt="Surabaya Map backdrop" 
                className="w-full h-full object-cover opacity-80 zoom-in-50" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt6Y4jj55sevEmQCzga6PI1-Ka05iMrHL1IRF-CrhmgNgZWmrwmkZVWdy8aH0l3acAWl8kBy47o6bwov7ziWceDSGUZaPfC0ZPAW8HYDtrOE963-zTurhohUCbhGYKcqOLMHudGZdH32qtk2iaeRPkcz8ATFas5aiVoilvxQEg5TrnOV9vW0UXgBIIfTSLnJ98N_-AYa7LA9Ce9_L7pvAvVOmpHya4PF2HgOqAdhiNbPWnEdXUdiRiSrRqEqTJMYmzOHUIEx2tF9x5" 
              />
              
              {/* Map Hotspots Glassmorphism Overlays */}
              <div 
                onClick={() => { setActiveMenu('lots'); onNavigateToLots(); }}
                className="absolute top-[30%] left-[40%] flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-105 transition-transform duration-200"
              >
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200 text-[10px] font-black text-slate-800 mb-1 leading-none shadow-red-500/10 whitespace-nowrap">
                  Tunjungan Plaza: {metrics.occupancyRate}% Penuh
                </div>
                <div className="w-4.5 h-4.5 bg-red-500 rounded-full border-2 border-white shadow-md animate-pulse shadow-red-500" />
              </div>

              <div 
                onClick={() => { setActiveMenu('lots'); onNavigateToLots(); }}
                className="absolute top-[60%] left-[65%] flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-105 transition-transform duration-200"
              >
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200 text-[10px] font-black text-slate-800 mb-1 leading-none whitespace-nowrap">
                  Pakuwon Mall: {Math.max(10, Math.min(95, metrics.occupancyRate - 5))}% Penuh
                </div>
                <div className="w-4.5 h-4.5 bg-indigo-500 rounded-full border-2 border-white shadow-md animate-pulse shadow-indigo-550" />
              </div>

              <div 
                onClick={() => { setActiveMenu('lots'); onNavigateToLots(); }}
                className="absolute top-[45%] left-[20%] flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-105 transition-transform duration-200"
              >
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200 text-[10px] font-black text-slate-800 mb-1 leading-none whitespace-nowrap">
                  Grand City: {Math.max(20, Math.min(99, metrics.occupancyRate + 8))}% Penuh
                </div>
                <div className="w-4.5 h-4.5 bg-amber-500 rounded-full border-2 border-white shadow-md animate-pulse shadow-amber-500" />
              </div>
            </div>
          </div>

          {/* Recent municipal list of logs (Right Column block) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Transaksi Publik Terbaru</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-default transition-colors border border-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-sans font-black text-sm">
                      {tx.vehicleType === 'car' ? '🚗' : '🛵'}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 leading-none mb-1">{tx.plateNumber}</h4>
                      <p className="text-[10px] font-semibold text-slate-400">{tx.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-indigo-600">Rp {tx.amount.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{tx.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button 
                onClick={() => alert('Simulasi: Laporan Performa Harian kota di-generate!')}
                className="w-full py-2.5 bg-white text-xs font-bold text-indigo-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm outline-none"
              >
                Buat Laporan Performa Harian
              </button>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
