import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle, Navigation, Home, QrCode, MapPin, Clock, HardDriveDownload, AlertTriangle, RefreshCcw, ShieldAlert, ArrowRight } from 'lucide-react';
import { Booking } from '../../types';
import { uploadBookingTicket, isSupabaseConfigured } from '../../lib/supabase';

interface SuccessTicketProps {
  booking: Booking;
  onGoHome: () => void;
  onTriggerLateRefund?: (booking: Booking) => void;
}

function RealQRCode({ booking }: { booking: Booking }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const qrPayload = `PARKWISE:${booking.bookingID}`;

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
    <div className="flex items-center justify-center bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
      <canvas id="ticket-qr-canvas" ref={canvasRef} className="w-40 h-40" />
    </div>
  );
}

export default function SuccessTicket({ booking, onGoHome, onTriggerLateRefund }: SuccessTicketProps) {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  
  // ETA Timer Countdown Simulation (default minutes from booking)
  const initialMinutes = parseInt(booking.estimatedArrival?.split(' ')[0] || '15', 10);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(initialMinutes * 60);
  const [showLateRefundModal, setShowLateRefundModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowLateRefundModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulateLateArrival = () => {
    setTimeLeftSeconds(0);
    setShowLateRefundModal(true);
    if (onTriggerLateRefund) {
      onTriggerLateRefund(booking);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const uploadTicket = async () => {
      if (!isSupabaseConfigured()) {
        return;
      }

      setUploadState('uploading');
      setUploadMessage('Mengunggah tiket ke Supabase cloud...');

      const canvas = document.querySelector<HTMLCanvasElement>('#ticket-qr-canvas');
      if (!canvas) {
        if (!cancelled) {
          setUploadState('error');
          setUploadMessage('QR belum siap untuk diunggah.');
        }
        return;
      }

      const dataUrl = canvas.toDataURL('image/png');
      const result = await uploadBookingTicket(booking, dataUrl);
      if (!cancelled) {
        setUploadState(result.ok ? 'success' : 'error');
        setUploadMessage(result.message);
      }
    };

    uploadTicket();

    return () => {
      cancelled = true;
    };
  }, [booking]);

  return (
    <div className="flex-grow flex flex-col justify-start px-4 py-6 max-w-md mx-auto w-full select-none relative overflow-y-auto bg-slate-50 min-h-[100dvh] md:h-[850px] shadow-2xl rounded-3xl border border-slate-100 pb-12">
      <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600/5 rounded-b-[50%] blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl -z-10" />

      {/* Header Status */}
      <div className="text-center mb-4 pt-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-2 border border-emerald-100 shadow-sm">
          <CheckCircle size={26} className="animate-pulse" />
        </div>
        <h1 className="text-xl font-black text-slate-900 leading-tight">Pembayaran QRIS Berhasil</h1>
        <p className="text-xs font-semibold text-slate-500">Tiket digital resmi terdaftar di sistem Dishub Surabaya.</p>
      </div>

      {/* Live ETA Warning Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-3.5 mb-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Clock size={20} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-100">Batas Waktu Tiba (ETA)</p>
            <p className="text-sm font-black tracking-wide">
              {booking.batasTiba} • <span className="font-mono text-base">{formatCountdown(timeLeftSeconds)}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleSimulateLateArrival}
          className="bg-white text-orange-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl hover:bg-orange-50 active:scale-95 transition-all shadow cursor-pointer"
        >
          Tes Telat
        </button>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-3xl p-5 mb-4 shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-1/2 -left-3.5 w-7 h-7 bg-slate-50 rounded-full transform -translate-y-1/2 border-r border-slate-200 shadow-[inset_-3px_0_3px_rgba(0,0,0,0.02)]" />
        <div className="absolute top-1/2 -right-3.5 w-7 h-7 bg-slate-50 rounded-full transform -translate-y-1/2 border-l border-slate-200 shadow-[inset_3px_0_3px_rgba(0,0,0,0.02)]" />

        <div className="border-b border-dashed border-slate-200 pb-3 mb-3 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Kode Booking</p>
          <p className="text-base font-black text-slate-800 tracking-wide font-mono leading-none">{booking.bookingID}</p>
        </div>

        <div className="flex flex-col items-center justify-center mb-3">
          <div className="p-2 bg-gradient-to-tr from-slate-100 to-white rounded-2xl shadow-inner border border-slate-200/50 mb-3 relative group overflow-hidden">
            <RealQRCode booking={booking} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 text-center px-4 leading-relaxed">
            Tunjukkan kode QR ini ke scanner Gate otomatis atau petugas parkir saat Anda sampai di lokasi.
          </p>
          {isSupabaseConfigured() && (
            <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-slate-400">
              <HardDriveDownload size={11} />
              <span>{uploadMessage}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-left">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <div className="flex items-center text-slate-400 gap-1 mb-1 leading-none">
              <QrCode size={12} />
              <span className="text-[9px] font-black uppercase tracking-wider">Slot ID</span>
            </div>
            <p className="text-xs font-black text-slate-800 leading-none">{booking.slotID}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <div className="flex items-center text-slate-400 gap-1 mb-1 leading-none">
              <Clock size={12} />
              <span className="text-[9px] font-black uppercase tracking-wider">Metode Bayar</span>
            </div>
            <p className="text-xs font-black text-indigo-600 leading-none">QRIS (Lunas)</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 col-span-2 flex items-start gap-2">
            <MapPin size={15} className="text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5 leading-none">Lokasi Parkir</p>
              <p className="text-xs font-extrabold text-slate-800 leading-snug">{booking.locationName}</p>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{booking.locationRegion}, Surabaya</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5 mt-auto">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.locationName + ' Surabaya')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-black py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10 active:scale-95 transition-all text-center cursor-pointer"
        >
          <Navigation size={15} />
          Petunjuk Arah (Google Maps)
        </a>

        <button
          onClick={onGoHome}
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-sans text-xs font-black py-3.5 rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all outline-none cursor-pointer"
        >
          <Home size={15} />
          Kembali ke Beranda
        </button>
      </div>

      {/* Late Arrival Notification & Automatic Refund Modal */}
      {showLateRefundModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-100 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Waktu Tiba Melebihi Batas
            </span>

            <h3 className="text-lg font-black text-slate-900 mt-3 leading-tight">
              Reservasi Telat & Dana Dikembalikan
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
              Anda tidak tiba di lokasi sebelum batas waktu yang dipilih ({booking.batasTiba}). Slot <strong>{booking.slotID}</strong> telah otomatis dibebaskan kembali untuk pengendara lain.
            </p>

            <div className="my-4 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <RefreshCcw size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Garansi Uang Kembali (100%)</p>
                <p className="text-xs font-black text-emerald-900">
                  Rp {booking.totalAmount.toLocaleString('id-ID')} Dikembalikan ke QRIS
                </p>
                <p className="text-[9px] text-emerald-600 font-semibold">Tercatat di mutasi riwayat & pembukuan admin</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowLateRefundModal(false);
                if (onTriggerLateRefund) {
                  onTriggerLateRefund(booking);
                }
                onGoHome();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <span>Mengerti & Kembali ke Beranda</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
