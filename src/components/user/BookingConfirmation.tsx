import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, QrCode, ShieldCheck, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { ParkingLocation, ParkingSlot } from '../../types';

interface BookingConfirmationProps {
  location: ParkingLocation;
  slot: ParkingSlot;
  onBack: () => void;
  onCheckoutComplete: (paymentMethod: string, estArrival: string, totalAmount: number) => void;
}

export default function BookingConfirmation({ location, slot, onBack, onCheckoutComplete }: BookingConfirmationProps) {
  const [estArrival, setEstArrival] = useState<'10 Min' | '20 Min' | '30 Min'>('10 Min');
  const paymentMethod = 'QRIS'; // Strictly QRIS only per user requirement

  // Standard booking covers 3 hours reservation block
  const rate = slot.ratePerHour;
  const hours = 3;
  const totalAmount = rate * hours;

  const handleCheckout = () => {
    onCheckoutComplete(paymentMethod, estArrival, totalAmount);
  };

  return (
    <div className="flex-grow flex flex-col justify-start relative w-full h-[100dvh] md:h-[850px] max-w-md mx-auto bg-slate-50 md:shadow-2xl md:rounded-3xl overflow-hidden pb-24 border border-slate-100 select-none">
      
      {/* Top App Bar Headers */}
      <header className="bg-white w-full top-0 border-b border-slate-100 flex justify-between items-center px-4 py-4 sticky z-40 shadow-sm">
        <button 
          onClick={onBack}
          className="text-slate-600 hover:bg-slate-100 transition-all cursor-pointer active:scale-95 p-1.5 rounded-full flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Konfirmasi Pembayaran QRIS</h1>
        <div className="w-9"></div> {/* Balancer spacer */}
      </header>

      {/* Checkout Forms Body container */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        
        {/* Reservation Location summary card */}
        <section className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full opacity-60 blur-xl"></div>
          
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20 shrink-0">
              P
            </div>
            <div>
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                {location.category === 'off-street' ? 'Pinggir Jalan' : 'Gedung / Mall'}
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 leading-snug">{location.name}</h2>
              <p className="text-xs font-semibold text-slate-500 flex items-center mt-0.5">
                <span className="mr-1">📍</span> {location.region}, Surabaya
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Zona Parkir</p>
              <p className="text-xs font-black text-slate-800">Zona {slot.zone} (Lantai Dasar)</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Slot Terpilih</p>
              <p className="text-xs font-black text-indigo-600">{slot.slotID} • {slot.type}</p>
            </div>
          </div>
        </section>

        {/* Estimated Arrival picker card with Expiry Warning */}
        <section className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={15} className="text-indigo-600" />
                Estimasi Waktu Tiba (ETA)
              </h3>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Penting
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mb-3 leading-relaxed">
              Pilih waktu perkiraan sampai. Jika Anda <strong>melebihi batas waktu (telat)</strong>, sistem akan otomatis membatalkan reservasi dan <strong>uang kembali 100% (Refund Otomatis)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['10 Min', '20 Min', '30 Min'] as const).map((opt) => {
              const active = estArrival === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setEstArrival(opt)}
                  className={`py-2.5 px-2 rounded-2xl border-2 font-mono text-xs font-black text-center transition-all cursor-pointer ${
                    active 
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-sm scale-102' 
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  ⏱️ {opt}
                </button>
              );
            })}
          </div>
        </section>

        {/* QRIS Exclusive Payment Method */}
        <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode size={16} className="text-indigo-600" />
              Metode Pembayaran Resmi
            </h3>
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              100% Cashless Dishub
            </span>
          </div>

          <div className="mt-3 p-3.5 bg-gradient-to-br from-indigo-50/70 to-slate-50 rounded-2xl border border-indigo-100 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-indigo-200 flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/300px-Logo_QRIS.svg.png" 
                alt="QRIS Logo" 
                className="w-full object-contain"
                onError={(e: any) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-[10px] font-black text-red-600 hidden">QRIS</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-black text-slate-900">QRIS Standar Nasional</p>
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              </div>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay & M-Banking lainnya.
              </p>
            </div>
          </div>

          {/* Guarantee info */}
          <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
            <ShieldCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
              Pembayaran langsung tercatat ke Kas Daerah Kota Surabaya (PAD). Bebas pungli, aman, dan bergaransi refund jika terlambat tiba.
            </p>
          </div>
        </section>

      </main>

      {/* Sticky Bottom Action Checkout row bar */}
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Biaya (3 Jam)</p>
            <p className="text-xl font-black text-indigo-600 leading-none">Rp {totalAmount.toLocaleString('id-ID')}</p>
          </div>
          
          <button 
            type="button"
            onClick={handleCheckout}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all outline-none flex items-center gap-2 cursor-pointer"
          >
            <span>Bayar via QRIS</span>
            <Sparkles size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
