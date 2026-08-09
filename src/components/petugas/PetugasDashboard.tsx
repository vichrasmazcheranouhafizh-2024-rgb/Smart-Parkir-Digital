import React, { useState, useMemo } from 'react';
import { Camera, MapPin, TrendingUp, LogIn, LogOut, User, BarChart3, Bell } from 'lucide-react';
import { CheckInLog, Transaction } from '../../types';

interface PetugasDashboardProps {
  logs: CheckInLog[];
  transactions: Transaction[];
  availableCount: number;
  totalCapacity: number;
  onOpenScanner: () => void;
  onOpenProfile: () => void;
  onTriggerCheckIn: (logID: string) => void;
  onTriggerCheckOut: (logID: string) => void;
  onLogout: () => void;
}

export default function PetugasDashboard({
  logs,
  transactions,
  availableCount,
  totalCapacity,
  onOpenScanner,
  onOpenProfile,
  onTriggerCheckIn,
  onTriggerCheckOut,
  onLogout,
}: PetugasDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shift' | 'transactions'>('dashboard');
  const occupiedCount = totalCapacity - availableCount;
  const progressPercent = Math.min(100, Math.max(0, (occupiedCount / totalCapacity) * 100));

  const shiftSummary = useMemo(() => {
    const todayTx = transactions.filter((t) => t.timeAgo === 'Baru Saja' || !t.location.includes('Top Up'));
    const totalIncome = todayTx.reduce((s, t) => s + t.amount, 0);
    const cashCount = todayTx.filter((t) => t.plateNumber).length;
    return { totalIncome, transactionCount: todayTx.length, cashCount, checkInCount: logs.length };
  }, [transactions, logs]);

  return (
    <div className="flex-grow flex flex-col relative w-full h-[850px] max-w-md mx-auto bg-slate-50 md:shadow-2xl md:rounded-3xl overflow-hidden pb-16 border border-slate-100">
      <header className="bg-white w-full border-b border-slate-100 flex justify-between items-center px-4 py-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="p-1 px-2.5 bg-indigo-600 rounded-xl text-white text-lg font-black leading-none">P</span>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">ParkWise</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenProfile} className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100" title="Profil Jukir">
            <User size={16} />
          </button>
          <button onClick={onLogout} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {activeTab === 'dashboard' && (
          <>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">Petugas Dashboard</h1>
              <p className="text-xs font-semibold text-slate-400">Monitor sesi parkir & verifikasi QR warga</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penugasan Parkir</p>
                <h2 className="text-sm font-extrabold text-slate-800">Tunjungan Plaza Zone A</h2>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Aktif & Online
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
              <div onClick={onOpenScanner} className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20">
                <Camera size={32} className="text-white" />
              </div>
              <h2 className="text-md font-extrabold text-slate-800 mb-1">Pindai QR Reservasi</h2>
              <p className="text-[11px] text-slate-500 mb-4">Verifikasi e-tiket digital warga</p>
              <button onClick={onOpenScanner} className="bg-indigo-600 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-indigo-700">
                Buka Scanner
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase">Slot Kosong</p>
                <h3 className="text-3xl font-black text-indigo-600">{availableCount}</h3>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${100 - progressPercent}%` }} />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase">Terisi</p>
                <h3 className="text-3xl font-black text-slate-800">{occupiedCount}</h3>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600">
                  <TrendingUp size={12} /> +12 jam terakhir
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
              <Bell size={18} className="text-indigo-600 shrink-0" />
              <p className="text-[11px] text-indigo-800 font-medium">
                Notifikasi verifikasi KTA dari Admin Dishub tersedia di <button onClick={onOpenProfile} className="font-black underline">Profil Jukir</button>
              </p>
            </div>
          </>
        )}

        {activeTab === 'shift' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800">Rekap Pendapatan Shift</h2>
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Total Pendapatan Hari Ini</p>
              <p className="text-3xl font-black mt-1">Rp {shiftSummary.totalIncome.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-indigo-200 mt-2">Shift Pagi • Tunjungan Plaza Zone A</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-slate-800">{shiftSummary.transactionCount}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Transaksi</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-slate-800">{shiftSummary.checkInCount}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Check-In/Out</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-800">Pencatatan Transaksi Harian</h2>
            {logs.map((log) => (
              <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-800">{log.plateNumber}</p>
                  <p className="text-[10px] text-slate-400">{log.locationName} • {log.time}</p>
                </div>
                {log.direction === 'Check-In' ? (
                  <button onClick={() => onTriggerCheckOut(log.id)} className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                    <LogIn size={11} /> Masuk
                  </button>
                ) : (
                  <button onClick={() => onTriggerCheckIn(log.id)} className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold flex items-center gap-1">
                    <LogOut size={11} /> Keluar
                  </button>
                )}
              </div>
            ))}
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between">
                <div>
                  <p className="text-xs font-black text-slate-800">{tx.plateNumber}</p>
                  <p className="text-[10px] text-slate-400">{tx.location}</p>
                </div>
                <p className="text-xs font-black text-indigo-600">Rp {tx.amount.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 z-20">
        {[
          { id: 'dashboard' as const, label: 'Dashboard', icon: MapPin },
          { id: 'shift' as const, label: 'Rekap Shift', icon: BarChart3 },
          { id: 'transactions' as const, label: 'Transaksi', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center py-1 ${activeTab === id ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Icon size={18} />
            <span className="text-[9px] font-bold mt-0.5">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
