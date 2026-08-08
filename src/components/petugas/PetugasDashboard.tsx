import React from 'react';
import { Camera, MapPin, TrendingUp, LogIn, LogOut } from 'lucide-react';
import { CheckInLog, Role } from '../../types';

interface PetugasDashboardProps {
  logs: CheckInLog[];
  availableCount: number;
  totalCapacity: number;
  onOpenScanner: () => void;
  onTriggerCheckIn: (logID: string) => void;
  onTriggerCheckOut: (logID: string) => void;
  onLogout: () => void;
}

export default function PetugasDashboard({
  logs,
  availableCount,
  totalCapacity,
  onOpenScanner,
  onTriggerCheckIn,
  onTriggerCheckOut,
  onLogout
}: PetugasDashboardProps) {
  const occupiedCount = totalCapacity - availableCount;
  const progressPercent = Math.min(100, Math.max(0, (occupiedCount / totalCapacity) * 100));

  return (
    <div className="flex-grow flex flex-col justify-start relative w-full h-[850px] max-w-md mx-auto bg-slate-50 md:shadow-2xl md:rounded-3xl overflow-hidden pb-16 border border-slate-100">
      
      {/* Top App bar */}
      <header className="bg-white w-full border-b border-slate-100 flex justify-between items-center px-4 py-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="p-1 px-2.5 bg-indigo-600 rounded-xl text-white text-lg font-black font-sans leading-none">P</span>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">ParkWise</span>
        </div>
        <button 
          onClick={onLogout}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Main Body view */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        
        {/* Dashboard Title & Location header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Petugas Dashboard</h1>
            <p className="text-xs font-semibold text-slate-400">Monitor dan kelola sesi parkir aktif di lokasi.</p>
          </div>

          {/* Assigned Location information Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MapPin size={22} className="animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Penugasan Parkir</p>
              <h2 className="text-sm font-extrabold text-slate-800">Tunjungan Plaza Zone A</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-600">Aktif &amp; Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Big Action: Scan Centerpiece */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-60"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Pulsing camera round target */}
            <div 
              onClick={onOpenScanner}
              className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/15 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            
            <h2 className="text-md font-extrabold text-slate-800 mb-1 leading-none">Pindai QR Reservasi</h2>
            <p className="text-[11px] font-medium text-slate-500 max-w-[280px] mb-4">
              Verifikasi pemesanan pengendara secara instan dengan memindai kode QR tiket masuk mereka.
            </p>
            
            <button 
              onClick={onOpenScanner}
              className="bg-indigo-600 text-white font-sans text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-indigo-500/15 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 focus:outline-none"
            >
              <Camera size={14} />
              Buka Scanner
            </button>
          </div>
        </div>

        {/* Small stats layout grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Available Slots */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Slot Kosong</p>
                <h3 className="text-3xl font-black text-indigo-600 leading-none">{availableCount}</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-sans font-black text-xs">P</div>
            </div>
            <div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${100 - progressPercent}%` }}></div>
              </div>
              <p className="text-[10px] font-semibold text-slate-400">{totalCapacity} Total Kapasitas</p>
            </div>
          </div>

          {/* Occupied slots stats */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Terisi</p>
                <h3 className="text-3xl font-black text-slate-800 leading-none">{occupiedCount}</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-sans font-black text-xs">🚗</div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <TrendingUp size={12} className="text-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-slate-600 leading-none">+12 jam terakhir</p>
            </div>
          </div>

        </div>

        {/* Recent logs checkins list Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Catatan Log Terbaru</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Daftar kendaraan keluar dan masuk hari ini.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-sans font-black text-sm">
                    {log.type === 'Walk-in' ? '🛵' : '🚗'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-none mb-1">{log.plateNumber}</h4>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {log.type === 'Walk-in' ? 'Pelanggan Walk-In' : `ID Booking: ${log.bookingID}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right leading-none">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Waktu</p>
                    <p className="text-[11px] font-bold text-slate-700">{log.time}</p>
                  </div>
                  
                  {log.direction === 'Check-In' ? (
                    <button
                      onClick={() => onTriggerCheckOut(log.id)}
                      className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
                    >
                      <LogIn size={11} />
                      Masuk
                    </button>
                  ) : (
                    <button
                      onClick={() => onTriggerCheckIn(log.id)}
                      className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
                    >
                      <LogOut size={11} />
                      Keluar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </main>

    </div>
  );
}
