import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle, Navigation, Home, QrCode, MapPin, Clock } from 'lucide-react';
import { Booking } from '../../types';

interface SuccessTicketProps {
  booking: Booking;
  onGoHome: () => void;
}

function RealQRCode({ booking }: { booking: Booking }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const qrPayload = JSON.stringify({
      bookingID: booking.bookingID,
      slotID: booking.slotID,
      locationName: booking.locationName,
      timestamp: booking.bookingTime,
    });

    QRCode.toCanvas(canvasRef.current, qrPayload, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    }).catch((err) => {
      console.error('QR generation error:', err);
      setError(true);
    });
  }, [booking]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-50 p-4 rounded-xl border border-red-200 text-red-600 text-xs font-semibold">
        Gagal membuat QR Code. Silakan coba lagi.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
      <canvas ref={canvasRef} className="w-40 h-40" />
    </div>
  );
}

export default function SuccessTicket({ booking, onGoHome }: SuccessTicketProps) {
  return (
    <div className="flex-grow flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full select-none relative overflow-hidden bg-slate-50 min-h-[850px] shadow-2xl rounded-3xl border">
      <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600/5 rounded-b-[50%] blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl -z-10" />

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100 shadow-sm shadow-emerald-500/5">
          <CheckCircle size={28} className="animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1.5">Pembayaran Berhasil</h1>
        <p className="text-xs font-semibold text-slate-500">Booking Anda telah berhasil dikonfirmasi.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 mb-6 shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-1/2 -left-3.5 w-7 h-7 bg-slate-50 rounded-full transform -translate-y-1/2 border-r border-slate-200 shadow-[inset_-3px_0_3px_rgba(0,0,0,0.02)]" />
        <div className="absolute top-1/2 -right-3.5 w-7 h-7 bg-slate-50 rounded-full transform -translate-y-1/2 border-l border-slate-200 shadow-[inset_3px_0_3px_rgba(0,0,0,0.02)]" />

        <div className="border-b border-dashed border-slate-200 pb-4 mb-4 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">ID Reservasi Anda</p>
          <p className="text-lg font-black text-slate-800 tracking-wide font-mono leading-none">{booking.bookingID}</p>
        </div>

        <div className="flex flex-col items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-tr from-slate-100 to-white rounded-2xl shadow-inner border border-slate-200/50 mb-4 relative group overflow-hidden">
            <RealQRCode booking={booking} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 text-center px-4 leading-relaxed">
            Kode QR Reservasi Anda terverifikasi di database lokal. Tunjukkan ke scanner pintu gerbang parkir.
          </p>
        </div>

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
