import React, { useState } from 'react';
import { ArrowLeft, Clock, Wallet, QrCode, Landmark } from 'lucide-react';
import { ParkingLocation, ParkingSlot } from '../../types';

interface BookingConfirmationProps {
  location: ParkingLocation;
  slot: ParkingSlot;
  onBack: () => void;
  onCheckoutComplete: (paymentMethod: string, estArrival: string, totalAmount: number) => void;
}

export default function BookingConfirmation({ location, slot, onBack, onCheckoutComplete }: BookingConfirmationProps) {
  const [estArrival, setEstArrival] = useState<'10 Min' | '20 Min' | '30 Min'>('10 Min');
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');

  // Let's assume booking covers 3 hours of safety reservation
  const rate = slot.ratePerHour;
  const hours = 3;
  const totalAmount = rate * hours;

  const handleCheckout = () => {
    onCheckoutComplete(paymentMethod, estArrival, totalAmount);
  };

  return (
    <div className="flex-grow flex flex-col justify-start relative w-full h-[100dvh] md:h-[850px] max-w-md mx-auto bg-slate-50 md:shadow-2xl md:rounded-3xl overflow-hidden pb-24 border border-slate-100">
      
      {/* Top App Bar Headers */}
      <header className="bg-white w-full top-0 border-b border-slate-100 flex justify-between items-center px-4 py-4 sticky z-40 shadow-sm">
        <button 
          onClick={onBack}
          className="text-slate-600 hover:bg-slate-100 transition-all cursor-pointer active:scale-95 p-1.5 rounded-full flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Metode Pembayaran</h1>
        <div className="w-9"></div> {/* Balancer spacer */}
      </header>

      {/* Checkout Forms Body container */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        
        {/* Reservation Location summary card */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-100/40 rounded-full opacity-60 blur-xl"></div>
          
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <span className="text-lg font-black font-sans leading-none">P</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Lokasi Parkir</p>
              <h2 className="text-sm font-extrabold text-slate-800 leading-snug">{location.name}</h2>
              <p className="text-xs font-semibold text-slate-400 flex items-center mt-1">
                <span className="mr-1">📍</span> {location.region}, {location.city}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Lantai</p>
              <p className="text-xs font-extrabold text-slate-700">Lantai B1</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Slot ID Terpilih</p>
              <p className="text-xs font-black text-indigo-600">{slot.slotID}</p>
            </div>
          </div>
        </section>

        {/* Estimated Arrival picker card */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={15} className="text-indigo-600" />
                Estimasi Waktu Tiba
              </h3>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mb-4 leading-relaxed">
              Pilih rentang perkiraan waktu sampai untuk memblokir slot agar tidak dipesan pengguna lain.
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
                  className={`py-2 px-1.5 rounded-lg border-2 font-mono text-xs font-extrabold text-center transition-all ${
                    active 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </section>

        {/* Payment Methods selector list card */}
        <section className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden pb-2.5">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet size={15} className="text-indigo-600" />
              Metode Pembayaran
            </h3>
          </div>

          <div className="pt-2 px-2.5 space-y-1">
            {/* Method: QRIS */}
            <label className="flex items-center p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors relative group">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3 shrink-0">
                <QrCode size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-slate-800">QRIS</p>
                <p className="text-[10px] font-medium text-slate-400">Pembayaran digital instan</p>
              </div>
              <input 
                checked={paymentMethod === 'QRIS'} 
                onChange={() => setPaymentMethod('QRIS')}
                name="payment" 
                type="radio"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            {/* Method: Tunai */}
            <label className="flex items-center p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors relative group">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mr-3 shrink-0 font-sans font-black text-[10px]">
                CASH
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-slate-800">Tunai</p>
                <p className="text-[10px] font-medium text-slate-400">Bayar langsung ke petugas parkir resmi</p>
              </div>
              <input 
                checked={paymentMethod === 'Tunai'} 
                onChange={() => setPaymentMethod('Tunai')}
                name="payment" 
                type="radio"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            {/* Method: OVO */}
            <label className="flex items-center p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors relative group">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mr-3 shrink-0 font-sans font-black text-xs">
                OVO
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-slate-800">OVO Cashless</p>
                <p className="text-[10px] font-medium text-slate-400">Instan terhubung ke nomor HP</p>
              </div>
              <input 
                checked={paymentMethod === 'OVO'} 
                onChange={() => setPaymentMethod('OVO')}
                name="payment" 
                type="radio"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            {/* Method: DANA */}
            <label className="flex items-center p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors relative group">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mr-3 shrink-0 font-sans font-black text-[11px]">
                DANA
              </div>
              <div className="flex-grow">
                <p className="text-xs font-extrabold text-slate-800">DANA Wallet</p>
                <p className="text-[10px] font-medium text-slate-400">Hubungkan akun dompet digital</p>
              </div>
              <input 
                checked={paymentMethod === 'DANA'} 
                onChange={() => setPaymentMethod('DANA')}
                name="payment" 
                type="radio"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            {/* Method: GoPay */}
            <label className="flex items-center p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors relative group">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mr-3 shrink-0 font-sans font-black text-[10px]">
                GOPAY
              </div>
              <div className="flex-grow">
                <p className="text-xs font-extrabold text-slate-800">GoPay Smart</p>
                <p className="text-[10px] font-medium text-slate-400">Pemberitahuan otomatis bebas repot</p>
              </div>
              <input 
                checked={paymentMethod === 'GoPay'} 
                onChange={() => setPaymentMethod('GoPay')}
                name="payment" 
                type="radio"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            {/* Method: Bank Transfer */}
            <label className="flex items-center p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors relative group">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mr-3 shrink-0">
                <Landmark size={18} />
              </div>
              <div className="flex-grow">
                <p className="text-xs font-extrabold text-slate-800">Bank Transfer</p>
                <p className="text-[10px] font-medium text-slate-400">Virtual Account (VA BCA, Mandiri, BRI)</p>
              </div>
              <input 
                checked={paymentMethod === 'BankTransfer'} 
                onChange={() => setPaymentMethod('BankTransfer')}
                name="payment" 
                type="radio"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>
          </div>
        </section>

      </main>

      {/* Sticky Bottom Action Checkout row bar */}
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-5 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="leading-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Pembayaran</p>
            <p className="text-xl font-black text-indigo-600 leading-none">Rp {totalAmount.toLocaleString('id-ID')}</p>
          </div>
          
          <button 
            type="button"
            onClick={handleCheckout}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-sm font-bold py-3.5 px-7 rounded-xl shadow-lg shadow-indigo-500/10 active:scale-95 transition-all outline-none"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>

    </div>
  );
}
