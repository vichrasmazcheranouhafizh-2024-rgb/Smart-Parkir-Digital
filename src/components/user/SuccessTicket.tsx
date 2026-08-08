import React from 'react';
import { CheckCircle, Navigation, Home, QrCode, MapPin, Clock } from 'lucide-react';
import { Booking } from '../../types';

interface SuccessTicketProps {
  booking: Booking;
  onGoHome: () => void;
}

function QRGenerator({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
      <svg width="176" height="176" viewBox="0 0 29 29" className="w-40 h-40 text-slate-800 fill-current">
        {/* Corner Left-Top Anchor */}
        <rect x="0" y="0" width="7" height="7" className="text-slate-900" />
        <rect x="1" y="1" width="5" height="5" fill="white" />
        <rect x="2" y="2" width="3" height="3" className="text-indigo-600" />

        {/* Corner Right-Top Anchor */}
        <rect x="22" y="0" width="7" height="7" className="text-slate-900" />
        <rect x="23" y="1" width="5" height="5" fill="white" />
        <rect x="24" y="2" width="3" height="3" className="text-indigo-600" />

        {/* Corner Left-Bottom Anchor */}
        <rect x="0" y="22" width="7" height="7" className="text-slate-900" />
        <rect x="1" y="23" width="5" height="5" fill="white" />
        <rect x="2" y="24" width="3" height="3" className="text-indigo-600" />

        {/* Corner Right-Bottom Anchor small alignment pattern */}
        <rect x="20" y="20" width="5" height="5" className="text-slate-900" />
        <rect x="21" y="21" width="3" height="3" fill="white" />
        <rect x="22" y="22" width="1" height="1" className="text-indigo-600" />

        {/* Deterministic paths */}
        <path d="M 8,0 H 9 V 3 H 8 Z M 10,1 H 12 V 2 H 10 Z M 14,0 H 16 V 1 H 14 Z M 17,2 H 18 V 3 H 17 Z 
                 M 8,5 H 10 V 6 H 8 Z M 11,4 H 13 V 5 H 11 Z M 15,5 H 17 V 6 H 15 Z M 19,4 H 20 V 5 H 19 Z
                 M 20,1 H 21 V 3 H 20 Z M 8,8 H 9 V 12 H 8 Z M 10,9 H 11 V 11 H 10 Z M 13,8 H 15 V 9 H 13 Z
                 M 16,9 H 18 V 10 H 16 Z M 20,8 H 22 V 10 H 20 Z M 24,8 H 26 V 9 H 24 Z M 27,9 H 29 V 11 H 27 Z
                 M 9,13 H 12 V 14 H 9 Z M 14,12 H 16 V 13 H 14 Z M 18,13 H 20 V 14 H 18 Z M 22,12 H 24 V 13 H 22 Z
                 M 1,8 H 2 V 10 H 1 Z M 4,9 H 6 V 10 H 4 Z M 1,12 H 3 V 13 H 1 Z M 5,12 H 7 V 13 H 5 Z
                 M 10,16 H 12 V 17 H 10 Z M 13,15 H 14 V 17 H 13 Z M 16,16 H 18 V 17 H 16 Z M 19,15 H 20 V 17 H 19 Z
                 M 0,16 H 3 V 17 H 0 Z M 5,15 H 7 V 16 H 5 Z M 4,18 H 6 V 19 H 4 Z M 8,19 H 11 V 20 H 8 Z
                 M 12,20 H 14 V 21 H 12 Z M 15,19 H 17 V 20 H 15 Z M 19,19 H 21 V 20 H 19 Z M 23,19 H 25 V 20 H 23 Z
                 M 11,22 H 13 V 23 H 11 Z M 14,23 H 16 V 24 H 14 Z M 17,22 H 19 V 23 H 17 Z M 20,23 H 21 V 24 H 20 Z
                 M 8,25 H 11 V 26 H 8 Z M 13,26 H 15 V 27 H 13 Z M 17,25 H 18 V 27 H 17 Z M 19,26 H 20 V 27 H 19 Z
                 M 26,27 H 28 V 28 H 26 Z M 23,26 H 25 V 27 H 23 Z M 21,28 H 22 V 29 H 21 Z M 25,28 H 26 V 29 H 25 Z" 
                 className="text-slate-800" />
        <path d="M 9,9 H 10 V 10 H 9 Z M 12,11 H 13 V 12 H 12 Z M 15,8 H 16 V 9 H 15 Z M 18,10 H 19 V 11 H 18 Z
                 M 22,9 H 23 V 10 H 22 Z M 13,13 H 14 V 14 H 13 Z M 17,12 H 18 V 13 H 17 Z M 21,13 H 22 V 14 H 21 Z
                 M 2,10 H 3 V 11 H 2 Z M 6,8 H 7 V 9 H 6 Z M 9,17 H 10 V 18 H 9 Z M 14,18 H 15 V 19 H 14 Z
                 M 18,15 H 19 V 16 H 18 Z M 22,17 H 23 V 18 H 22 Z M 25,16 H 26 V 17 H 25 Z M 28,17 H 29 V 18 H 28 Z
                 M 1,19 H 2 V 20 H 1 Z M 6,19 H 7 V 20 H 6 Z M 9,21 H 10 V 22 H 9 Z M 13,22 H 14 V 23 H 13 Z
                 M 16,21 H 17 V 22 H 16 Z M 20,21 H 21 V 22 H 20 Z M 24,21 H 25 V 22 H 24 Z" 
                 className="text-indigo-650" />
        
        {/* Center label */}
        <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" className="text-indigo-650" />
        <rect x="12" y="12" width="5" height="5" rx="1.2" fill="white" />
        <path d="M 14,13 H 15 V 16 H 14 Z M 13.5,14 H 15.5 V 15 H 13.5 Z" className="text-indigo-600 fill-current" />
      </svg>
    </div>
  );
}

export default function SuccessTicket({ booking, onGoHome }: SuccessTicketProps) {
  return (
    <div className="flex-grow flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full select-none relative overflow-hidden bg-slate-50 min-h-[850px] shadow-2xl rounded-3xl border">
      
      {/* Dynamic decorative visual gradients */}
      <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600/5 rounded-b-[50%] blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl -z-10" />

      {/* Success Status Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100 shadow-sm shadow-emerald-500/5">
          <CheckCircle size={28} className="animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1.5">Pembayaran Berhasil</h1>
        <p className="text-xs font-semibold text-slate-500">Booking Anda telah berhasil dikonfirmasi.</p>
      </div>

      {/* Main Movie Ticket Card with Round Side Cutouts */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Left & Right Circle Ticket Cutouts */}
        <div className="absolute top-1/2 -left-3.5 w-7 h-7 bg-slate-50 rounded-full transform -translate-y-1/2 border-r border-slate-200 shadow-[inset_-3px_0_3px_rgba(0,0,0,0.02)]" />
        <div className="absolute top-1/2 -right-3.5 w-7 h-7 bg-slate-50 rounded-full transform -translate-y-1/2 border-l border-slate-200 shadow-[inset_3px_0_3px_rgba(0,0,0,0.02)]" />

        {/* Top Booking ID section */}
        <div className="border-b border-dashed border-slate-200 pb-4 mb-4 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">ID Reservasi Anda</p>
          <p className="text-lg font-black text-slate-800 tracking-wide font-mono leading-none">{booking.bookingID}</p>
        </div>

        {/* QR Ticket Canvas */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-tr from-slate-100 to-white rounded-2xl shadow-inner border border-slate-200/50 mb-4 relative group overflow-hidden">
            <QRGenerator value={booking.bookingID} />
            {/* Animating Laser Scanner line overlay */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-indigo-600/90 shadow-md shadow-indigo-500 rounded-full animate-scan" style={{ top: '50%' }} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 text-center px-4 leading-relaxed">
            Kode QR Reservasi Anda terverifikasi di database Surabaya. Tunjukkan ke scanner pintu gerbang parkir.
          </p>
        </div>

        {/* Information Grid Section */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-left">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center text-slate-400 gap-1 mb-1 leading-none">
              <QrCode size={12} />
              <span className="text-[9px] font-black uppercase tracking-wider">Slot ID</span>
            </div>
            <p className="text-xs font-black text-slate-800 leading-none">{booking.slotID}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center text-slate-400 gap-1 mb-1 leading-none">
              <Clock size={12} />
              <span className="text-[9px] font-black uppercase tracking-wider">Batas Tiba</span>
            </div>
            <p className="text-xs font-black text-red-500 leading-none">{booking.batasTiba}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2 flex items-start gap-1.5">
            <MapPin size={14} className="text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5 leading-none">Lokasi Parkir</p>
              <p className="text-xs font-extrabold text-slate-800 leading-snug">{booking.locationName}</p>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{booking.locationRegion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Underneath directional maps & back trigger actions */}
      <div className="flex flex-col gap-3">
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.locationName + ' Surabaya')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-black py-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10 active:scale-95 transition-all text-center"
        >
          <Navigation size={15} />
          Navigasi ke Lokasi (Google Maps)
        </a>
        
        <button 
          onClick={onGoHome}
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-sans text-xs font-black py-4 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all outline-none"
        >
          <Home size={15} />
          Kembali ke Beranda
        </button>
      </div>

    </div>
  );
}
