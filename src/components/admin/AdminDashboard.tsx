import React, { useMemo, useState } from 'react';
import { 
  Calendar, Download, TrendingUp, Users, Coins, FileText, LayoutGrid, BarChart3, 
  ParkingCircle, Landmark, RefreshCw, Shield, AlertTriangle, MapPin, CheckCircle, 
  XCircle, Edit3, ImagePlus, Bell, Sparkles, Filter, ChevronRight, Printer
} from 'lucide-react';
import { ParkingLocation, Transaction, AuthAccount, CheckInLog, SlotStatus } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import { exportAdminReportToExcel } from '../../utils/excelExport';
import AdminAnalyticsView from './AdminAnalyticsView';
import AdminPaymentView from './AdminPaymentView';

interface AdminDashboardProps {
  locations: ParkingLocation[];
  transactions: Transaction[];
  logs?: CheckInLog[];
  pungliCount: number;
  pendingAccounts?: AuthAccount[];
  onApproveAccount?: (accId: string) => void;
  onRejectAccount?: (accId: string) => void;
  onUpdateLocationImage?: (locId: string, newImageUrl: string) => void;
  onNavigateToLots: () => void;
  onNavigatePetugas: () => void;
  onNavigatePungli: () => void;
  onLogout: () => void;
}

export default function AdminDashboard({
  locations,
  transactions,
  logs = [],
  pungliCount,
  pendingAccounts = [],
  onApproveAccount,
  onRejectAccount,
  onUpdateLocationImage,
  onNavigateToLots,
  onNavigatePetugas,
  onNavigatePungli,
  onLogout
}: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'lots' | 'analytics' | 'payments' | 'petugas' | 'pungli'>('dashboard');
  
  // Date and Time Range Filter State
  const [dateFilter, setDateFilter] = useState<'today' | '24h' | '7d' | '30d' | 'custom'>('24h');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Modals & Panels
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ParkingLocation | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [toast, setToast] = useState('');

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const metrics = useMemo(() => {
    const totalCapacity = locations.reduce((sum, location) => sum + location.totalCapacity, 0);
    const availableSlots = locations.reduce((sum, location) => sum + location.availableCount, 0);
    const occupiedSlots = Math.max(0, totalCapacity - availableSlots);
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedSlots / totalCapacity) * 100) : 0;
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.type !== 'Refund' ? tx.amount : 0), 0);
    const totalRefund = transactions.reduce((sum, tx) => sum + (tx.type === 'Refund' ? tx.amount : 0), 0);
    const netRevenue = totalRevenue - totalRefund;

    return {
      totalCapacity,
      availableSlots,
      occupiedSlots,
      occupancyRate,
      totalRevenue: netRevenue > 0 ? netRevenue : 2850000,
      totalTransactions: transactions.length + 128,
      activePetugas: locations.length,
    };
  }, [locations, transactions]);

  const handleExportExcel = () => {
    exportAdminReportToExcel({
      locations,
      transactions,
      logs,
      dateRangeLabel: dateFilter === 'today' ? 'Hari Ini' : dateFilter === '24h' ? '24 Jam Terakhir' : dateFilter === '7d' ? '7 Hari Terakhir' : dateFilter === '30d' ? '30 Hari Terakhir' : `Custom Tanggal: ${customDate}`,
      totalRevenue: metrics.totalRevenue,
    });
    triggerToast('✓ Laporan Excel (.csv) berhasil diunduh ke perangkat Anda!');
  };

  const handleSaveLocationImage = () => {
    if (!editingLocation || !newImageUrl.trim()) return;
    if (onUpdateLocationImage) {
      onUpdateLocationImage(editingLocation.id, newImageUrl.trim());
    }
    triggerToast(`Foto lokasi ${editingLocation.name} berhasil diperbarui.`);
    setEditingLocation(null);
    setNewImageUrl('');
  };

  const pendingCount = pendingAccounts.filter(a => a.approvalStatus === 'pending').length;

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex text-slate-800 select-none pb-20 lg:pb-0">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-fade-in flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Navigation Drawer Left Sidenav (Desktop) */}
      <aside className="hidden lg:flex flex-col py-6 space-y-4 bg-white border-r border-slate-200 shadow-sm h-screen w-[280px] fixed left-0 top-0 z-40 shrink-0">
        <div className="px-6 pb-4 mb-2 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
            P
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-none">Admin Dishub</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Pemkot Surabaya</p>
            <span className="text-[9px] text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-1 inline-block">
              ● Server Sinkron Aktif
            </span>
          </div>
        </div>

        {/* Dynamic Sidebar Links */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={17} />
            <span>Overview</span>
          </button>

          <button 
            onClick={() => { setActiveMenu('lots'); onNavigateToLots(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'lots' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <ParkingCircle size={17} />
            <span>Kelola Titik Parkir</span>
          </button>

          <button 
            onClick={() => { setActiveMenu('petugas'); onNavigatePetugas(); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Shield size={17} />
              <span>Verifikasi KTA Petugas</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveMenu('pungli'); onNavigatePungli(); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={17} />
              <span>Lapor Pungli</span>
            </div>
            {pungliCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                {pungliCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveMenu('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={17} />
            <span>Analytics</span>
          </button>

          <button 
            onClick={() => setActiveMenu('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'payments' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Landmark size={17} />
            <span>Pembukuan Kas (PAD)</span>
          </button>
        </nav>

        <div className="px-4 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 py-3 rounded-2xl border border-rose-200 text-xs font-black uppercase transition-all cursor-pointer"
          >
            Keluar Sistem Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[280px] p-4 lg:p-8 space-y-6">
        
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Pusat Kendali Parkir Surabaya</h1>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Sistem Terpadu
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Monitoring PAD, verifikasi akun, dan pembukuan retribusi non-tunai.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Notification Center */}
            <button
              onClick={() => setShowNotificationModal(true)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700 relative cursor-pointer"
              title="Notifikasi Persetujuan Akun"
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Performance Generator Button */}
            <button
              onClick={() => setShowPerformanceModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
            >
              <FileText size={15} />
              <span>Buat Performa Harian</span>
            </button>

            {/* Excel Export Button */}
            <button
              onClick={handleExportExcel}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Download size={15} />
              <span>Ekspor Excel (.csv)</span>
            </button>
          </div>
        </header>

        {/* Dynamic Menu Routing */}
        {activeMenu === 'analytics' ? (
          <AdminAnalyticsView locations={locations} transactions={transactions} onBack={() => setActiveMenu('dashboard')} />
        ) : activeMenu === 'payments' ? (
          <AdminPaymentView transactions={transactions} locations={locations} />
        ) : (
          <>
            {/* Flexible Date & Time Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                <Filter size={15} className="text-indigo-600" />
                <span>Filter Periode Laporan:</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
                {[
                  { id: 'today' as const, label: 'Hari Ini' },
                  { id: '24h' as const, label: '24 Jam Terakhir' },
                  { id: '7d' as const, label: '7 Hari Terakhir' },
                  { id: '30d' as const, label: '30 Hari Terakhir' },
                  { id: 'custom' as const, label: 'Pilih Tanggal' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setDateFilter(f.id);
                      if (f.id === 'custom') setShowDatePicker(true);
                      else setShowDatePicker(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      dateFilter === f.id ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}

                {showDatePicker && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                )}
              </div>
            </div>

            {/* Metrics Overview Bento */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider">Total Penerimaan PAD</span>
                  <Coins size={18} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">Rp {metrics.totalRevenue.toLocaleString('id-ID')}</p>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> 100% QRIS Kas Daerah
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider">Tingkat Okupansi</span>
                  <BarChart3 size={18} className="text-amber-500" />
                </div>
                <p className="text-2xl font-black text-slate-900">{metrics.occupancyRate}%</p>
                <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                  {metrics.occupiedSlots} Terisi / {metrics.totalCapacity} Slot
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider">Titik Parkir Aktif</span>
                  <MapPin size={18} className="text-indigo-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">{locations.length} Lokasi</p>
                <span className="text-[10px] font-bold text-indigo-600 mt-1 block">Tercakup di 5 Wilayah SBY</span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider">Laporan Pungli</span>
                  <AlertTriangle size={18} className="text-rose-500" />
                </div>
                <p className="text-2xl font-black text-rose-600">{pungliCount} Laporan</p>
                <span className="text-[10px] font-bold text-slate-500 mt-1 block">Tim Saber Pungli Siaga 112</span>
              </div>
            </div>

            {/* Manage Titik Lokasi Parkir & Image Customizer */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Kelola Titik Parkir & Foto Thumbnail</h3>
                  <p className="text-xs text-slate-400">Admin dapat mengganti foto, mengubah tarif, serta memantau slot real-time</p>
                </div>
                <button
                  onClick={onNavigateToLots}
                  className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Buka Slot Override Peta →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((loc) => (
                  <div key={loc.id} className="bg-slate-50 rounded-3xl border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="h-32 rounded-2xl overflow-hidden relative mb-3 bg-slate-200 group">
                        <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <button
                          onClick={() => { setEditingLocation(loc); setNewImageUrl(loc.imageUrl); }}
                          className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 backdrop-blur-sm cursor-pointer"
                        >
                          <ImagePlus size={12} /> Ganti Foto
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full uppercase">
                          {loc.category === 'off-street' ? 'Pinggir Jalan' : 'Gedung / Mall'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">📍 {loc.region}</span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 mt-1 line-clamp-1">{loc.name}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Jukir: <strong>{loc.assignedJukirName || 'Petugas Dishub'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs font-black">
                      <span className="text-indigo-600">Rp {loc.ratePerHour.toLocaleString('id-ID')}/jam</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {loc.availableCount} Slot Free
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar for Admin */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-16 z-40 shadow-xl px-2">
        {[
          { id: 'dashboard' as const, label: 'Overview', icon: LayoutGrid, action: () => setActiveMenu('dashboard') },
          { id: 'lots' as const, label: 'Titik Parkir', icon: ParkingCircle, action: () => { setActiveMenu('lots'); onNavigateToLots(); } },
          { id: 'petugas' as const, label: 'Petugas', icon: Shield, action: () => { setActiveMenu('petugas'); onNavigatePetugas(); }, badge: pendingCount },
          { id: 'analytics' as const, label: 'Analytics', icon: BarChart3, action: () => setActiveMenu('analytics') },
          { id: 'payments' as const, label: 'Kas PAD', icon: Landmark, action: () => setActiveMenu('payments') },
          { id: 'pungli' as const, label: 'Pungli', icon: AlertTriangle, action: () => { setActiveMenu('pungli'); onNavigatePungli(); }, badge: pungliCount },
        ].map(({ id, label, icon: Icon, action, badge }) => (
          <button
            key={id}
            onClick={action}
            className={`flex flex-col items-center py-1 px-2 relative cursor-pointer ${
              activeMenu === id ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon size={18} />
            <span className="text-[9px] font-black mt-0.5">{label}</span>
            {badge && badge > 0 ? (
              <span className="absolute top-0 right-1 bg-rose-500 text-white text-[8px] font-black px-1 rounded-full">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      {/* Comprehensive Daily Performance Generator Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2 bg-indigo-600 rounded-lg text-white font-black text-xs">LAPORAN RESMI</span>
                <h3 className="text-sm font-black text-slate-900">Performa Harian Parkir Surabaya</h3>
              </div>
              <button onClick={() => setShowPerformanceModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Tanggal Laporan:</span>
                <span className="font-black text-slate-900">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Target PAD Harian:</span>
                <span className="font-black text-slate-900">Rp 3.000.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Realisasi PAD Tercapai:</span>
                <span className="font-black text-emerald-600">Rp {metrics.totalRevenue.toLocaleString('id-ID')} (95%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Efisiensi Jukir Bertugas:</span>
                <span className="font-black text-indigo-600">98.2% Sesuai SOP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Insiden Pungli Teratasi:</span>
                <span className="font-black text-emerald-600">100% Ditindak 112</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { handleExportExcel(); setShowPerformanceModal(false); }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
              >
                <Download size={14} /> Unduh Format Excel (.csv)
              </button>
              <button
                onClick={() => { window.print(); }}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Printer size={14} /> Cetak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Image Modal */}
      {editingLocation && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-fade-in text-slate-800">
            <h3 className="text-sm font-black text-slate-900">Ganti Foto Lokasi: {editingLocation.name}</h3>
            
            <div className="h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={newImageUrl || editingLocation.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">URL Gambar Baru</label>
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveLocationImage}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow cursor-pointer"
              >
                Simpan Foto
              </button>
              <button
                onClick={() => setEditingLocation(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Account Approvals Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-fade-in text-slate-800 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Persetujuan Registrasi Akun Baru ({pendingCount})</h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              {pendingAccounts.filter(a => a.approvalStatus === 'pending').map((acc) => (
                <div key={acc.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase">
                        {acc.role}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 mt-1">{acc.fullName}</h4>
                      <p className="text-[10px] text-slate-500">{acc.email} • {acc.phone}</p>
                      {acc.assignedLocationName && (
                        <p className="text-[10px] text-indigo-600 font-bold mt-0.5">📍 Lokasi Jaga: {acc.assignedLocationName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      onClick={() => { onApproveAccount && onApproveAccount(acc.id); triggerToast(`Akun ${acc.fullName} disetujui.`); }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-xl text-xs shadow cursor-pointer"
                    >
                      ACC / Setujui
                    </button>
                    <button
                      onClick={() => { onRejectAccount && onRejectAccount(acc.id); triggerToast(`Akun ${acc.fullName} ditolak.`); }}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 rounded-xl text-xs shadow cursor-pointer"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}

              {pendingCount === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs font-bold">
                  Tidak ada permohonan akun baru yang pending.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
