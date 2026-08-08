import React, { useState } from 'react';
import { ArrowLeft, Flashlight, CheckCircle, AlertTriangle } from 'lucide-react';

interface PetugasScannerProps {
  onBack: () => void;
  onVerifyCode: (code: string) => void;
}

export default function PetugasScanner({ onBack, onVerifyCode }: PetugasScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showStatus, setShowStatus] = useState(false);

  const handleVerify = (codeToVerify: string) => {
    const trimmed = codeToVerify.trim().toUpperCase();
    if (!trimmed) return;

    if (trimmed === 'BK-2026-0001' || trimmed.startsWith('BK-')) {
      onVerifyCode(trimmed);
      setShowStatus(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Error: Booking ID tidak ditemukan atau tidak aktif.');
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-start relative w-full h-[850px] max-w-md mx-auto bg-slate-900 md:shadow-2xl md:rounded-3xl overflow-hidden pb-16">
      
      {/* Top App bar header */}
      <header className="w-full bg-white text-indigo-600 border-b border-slate-100 flex justify-between items-center px-4 py-4 z-50 shadow-sm relative">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer active:scale-95"
            aria-label="Kembali"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Scan Kode QR</h1>
        </div>
        <button 
          onClick={() => setFlashOn(!flashOn)}
          className={`p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 ${
            flashOn ? 'text-amber-500 bg-amber-50' : 'text-slate-600'
          }`}
          aria-label="Senter"
        >
          <Flashlight size={18} />
        </button>
      </header>

      {/* Main Scanner viewport layout */}
      <main className="flex-1 relative flex flex-col w-full h-full bg-slate-950">
        
        {/* Mock Camera Background feed */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img 
            alt="Simulasi Kamera Petugas" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1vcmAfPFY3v9FO6liB5GBlVvc927-lGTzmVQ5v_FUXs6nJpWhv6c7kcM4UqLwhfdXK7VArfbwE5KdYnqpEJqwTWuGt2SsQJwu6LZO41kGJftDNAs5vQtqEAWxijHgWUZLearIdHdzHlV1lGtGk0eCBWqVhKekmPcKQkd3cv7mPmhTC5sEfocV-jaQp0qlgicmBufrQJYp7AgxDTHFYpwM2tVeck-gAPgbOeU65s4eYsu7cW-txzY2ZG7Ewhw7-HvZgMm5oMNtdcqq" 
          />
        </div>

        {/* Framing viewfinder with scanner overlays */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative w-60 h-64 border-2 border-transparent">
            {/* Viewfinder borders simulation */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
            
            {/* Red animating horizontal laser sweeps */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-500 shadow-md shadow-indigo-400 rounded-xl animate-scan" />
            
            {/* Center mockup reticle symbol opacity */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white select-none">
              🔑
            </div>
          </div>

          <div className="absolute top-[12%] w-full text-center px-6">
            <span className="text-white text-xs font-semibold bg-black/60 px-3.5 py-1.5 rounded-full inline-block backdrop-blur-sm">
              Posisikan kode QR di dalam bingkai
            </span>
          </div>
        </div>

        {/* Bottom Panel drawer */}
        <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-xl p-5 flex flex-col gap-4">
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs py-2 px-3 rounded-lg border border-red-100 font-medium">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {showStatus && (
            <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 text-xs py-2 px-3 rounded-lg border border-emerald-100 font-medium">
              <CheckCircle size={14} className="shrink-0" />
              <span>QR Kode Terverifikasi! Status kendaraan diperbarui.</span>
            </div>
          )}

          {/* Form input console */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Ada Kendala?</span>
              <span className="text-xs font-bold text-indigo-600">Entri ID Manual</span>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Masukkan ID Booking (contoh: BK-2026-0001)"
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                  setErrorMsg('');
                  setShowStatus(false);
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50 font-mono text-xs uppercase text-slate-700 outline-none transition-colors"
              />
              <button 
                type="button"
                onClick={() => handleVerify(manualCode)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors shadow-sm outline-none shrink-0"
              >
                Verifikasi
              </button>
            </div>
          </div>

          {/* Fast Testing Trigger Badge */}
          <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-semibold text-indigo-800">
            <span>Uji Coba: Pindai Cepat Booking Baru</span>
            <button 
              type="button"
              onClick={() => {
                setManualCode('BK-2026-0001');
                handleVerify('BK-2026-0001');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all leading-none"
            >
              Simulasikan BK-2026-0001
            </button>
          </div>

        </div>

      </main>

    </div>
  );
}
