import React, { useState, useMemo } from 'react';
import { Camera, MapPin, TrendingUp, LogIn, LogOut, User, BarChart3, Bell, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { CheckInLog, Transaction, ParkingLocation, AuthAccount } from '../../types';

interface PetugasDashboardProps {
  logs: CheckInLog[];
  transactions: Transaction[];
  currentAccount?: AuthAccount | null;
  assignedLocation?: ParkingLocation;
  allLocations: ParkingLocation[];
  onOpenScanner: () => void;
  onOpenProfile: () => void;
  onTriggerCheckIn: (logID: string) => void;
  onTriggerCheckOut: (logID: string) => void;
  onLogout: () => void;
}

export default function PetugasDashboard({
  logs,
  transactions,
  currentAccount,
  assignedLocation,
  allLocations,
  onOpenScanner,
  onOpenProfile,
  onTriggerCheckIn,
  onTriggerCheckOut,
  onLogout,
}: PetugasDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shift' | 'transactions'>('dashboard');

  // Fallback to first location if none specifically set
  const myLocation = assignedLocation || allLocations.find(l => l.id === currentAccount?.assignedLocationId) || allLocations[0];
  
  const totalCapacity = myLocation ? myLocation.totalCapacity : 100;
  const availableCount = myLocation ? myLocation.availableCount : 45;
  const occupiedCount = Math.max(0, totalCapacity - availableCount);
  const progressPercent = Math.min(100, Math.max(0, (occupiedCount / totalCapacity) * 100));

  // Filter logs & transactions specifically for the assigned location
  const locationLogs = useMemo(() => {
    if (!myLocation) return logs;
    return logs.filter(l => l.locationName.toLowerCase().includes(myLocation.name.toLowerCase()) || l.locationName.toLowerCase().includes('tunjungan'));
  }, [logs, myLocation]);

  const locationTx = useMemo(() => {
    if (!myLocation) return transactions;
    return transactions.filter(t => t.location.toLowerCase().includes(myLocation.name.toLowerCase()) || t.location.toLowerCase().includes('tunjungan'));
  }, [transactions, myLocation]);

  const shiftSummary = useMemo(() => {
    const totalIncome = locationTx.reduce((s, t) => s + t.amount, 0);
    return {
      totalIncome: totalIncome > 0 ? totalIncome : 85000,
      transactionCount: locationTx.length > 0 ? locationTx.length : 14,
      checkInCount: locationLogs.length > 0 ? locationLogs.length : 8,
    };
  }, [locationTx, locationLogs]);

  return (
    <div className="flex-grow flex flex-col relative w-full h-[100dvh] md:h-[850px] max-w-md mx-auto bg-slate-50 md:shadow-2xl md:rounded-3xl overflow-hidden pb-16 border border-slate-100 select-none">
      
      {/* Header */}
      <header className="bg-white w-full border-b border-slate-100 flex justify-between items-center px-4 py-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
            P
          </div>
          <div>
            <span className="font-black text-slate-900 tracking-tight text-sm block leading-tight">ParkWise Petugas</span>
            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Terverifikasi Dishub
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenProfile} className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer" title="Profil Jukir">
            <User size={16} />
          </button>
          <button onClick={onLogout} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold cursor-pointer">
            Keluar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {activeTab === 'dashboard' && (
          <>
            <div>
              <h1 className="text-xl font-black text-slate-900">Dashboard Petugas Jukir</h1>
              <p className="text-xs font-semibold text-slate-400">Pengawasan khusus lokasi tugas resmi</p>
            </div>

            {/* Exclusive Assigned Location Card */}
            <div className="bg-white border-2 border-indigo-500/30 rounded-3xl p-4 flex items-center gap-3.5 shadow-sm relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Wilayah Penugasan Anda</p>
                  <span className="text-[9px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    {currentAccount?.shift || 'Shift Pagi'}
                  </span>
                </div>
                <h2 className="text-sm font-black text-slate-900 leading-snug mt-0.5">{myLocation.name}</h2>
                <p className="text-[10px] text-slate-500 font-semibold">📍 {myLocation.region}, Surabaya • Terkunci untuk Anda</p>
              </div>
            </div>

            {/* Scan QR Citizen Booking */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 text-center shadow-sm">
              <div onClick={onOpenScanner} className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-3 cursor-pointer hover:scale-105 transition-transform shadow-xl shadow-indigo-500/20">
                <Camera size={34} className="text-white" />
              </div>
              <h2 className="text-sm font-black text-slate-800 mb-0.5">Pindai E-Tiket QR Warga</h2>
              <p className="text-[11px] text-slate-400 font-medium mb-3">Check-in kendaraan yang telah mereservasi slot</p>
              <button onClick={onOpenScanner} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md cursor-pointer active:scale-95 transition-all">
                Buka Kamera Scanner
              </button>
            </div>

            {/* Exclusive Location Slots Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Status Slot di {myLocation.name.split(' ')[0]}
                </span>
                <span className="text-[10px] font-bold text-slate-400">Total: {totalCapacity} Slot</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Slot Kosong</p>
                  <h3 className="text-3xl font-black text-emerald-600 mt-0.5">{availableCount}</h3>
                  <p className="text-[9px] text-slate-400 font-medium mt-1">Siap ditempati pengendara</p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${100 - progressPercent}%` }} />
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Slot Terisi</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-0.5">{occupiedCount}</h3>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-indigo-600">
                    <TrendingUp size={11} /> Terisi {progressPercent.toFixed(0)}%
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification reminder */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5 flex items-center gap-3">
              <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
              <p className="text-[11px] text-indigo-900 font-medium leading-relaxed">
                KTA Digital Anda terdaftar aktif. Pastikan selalu melayani pengendara dengan sopan dan pastikan transaksi 100% menggunakan QRIS Dishub.
              </p>
            </div>
          </>
        )}

        {activeTab === 'shift' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-800">Rekap Pendapatan Shift Petugas</h2>
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-5 text-white shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Realisasi Retribusi Hari Ini</p>
              <p className="text-3xl font-black mt-1">Rp {shiftSummary.totalIncome.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-indigo-200 mt-2">
                {currentAccount?.shift || 'Shift Pagi'} • {myLocation.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-slate-800">{shiftSummary.transactionCount}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Transaksi QRIS</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-slate-800">{shiftSummary.checkInCount}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Check-In / Out</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-slate-800">Log Aktivitas Kendaraan di Lokasi</h2>
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-black text-slate-800">{log.plateNumber}</p>
                  <p className="text-[10px] text-slate-400">{log.locationName} • {log.time}</p>
                </div>
                {log.direction === 'Check-In' ? (
                  <button onClick={() => onTriggerCheckOut(log.id)} className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black flex items-center gap-1 cursor-pointer">
                    <LogIn size={11} /> Masuk (Check-In)
                  </button>
                ) : (
                  <button onClick={() => onTriggerCheckIn(log.id)} className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-black flex items-center gap-1 cursor-pointer">
                    <LogOut size={11} /> Keluar (Check-Out)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Petugas Bottom Nav */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 z-20 shadow-lg">
        {[
          { id: 'dashboard' as const, label: 'Lokasi Jaga', icon: MapPin },
          { id: 'shift' as const, label: 'Rekap Shift', icon: BarChart3 },
          { id: 'transactions' as const, label: 'Aktivitas', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center py-1 cursor-pointer ${activeTab === id ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Icon size={18} />
            <span className="text-[10px] font-bold mt-0.5">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
