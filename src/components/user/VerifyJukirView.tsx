import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, QrCode, CheckCircle, XCircle, Shield, Camera, X, AlertCircle, Sparkles } from 'lucide-react';
import { getJukirByKTA } from '../../db';
import { JukirProfile } from '../../types';

interface VerifyJukirViewProps {
  onBack: () => void;
}

export default function VerifyJukirView({ onBack }: VerifyJukirViewProps) {
  const [manualKTA, setManualKTA] = useState('');
  const [result, setResult] = useState<{ ok: boolean; profile?: JukirProfile; message: string } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const verifyCode = async (code: string) => {
    let kta = code.trim();
    if (kta.toUpperCase().startsWith('PARKWISE:JUKIR:')) {
      kta = kta.split(':')[2] ?? kta;
    }

    const profile = await getJukirByKTA(kta);
    if (!profile) {
      setResult({ ok: false, message: `KTA "${kta}" tidak ditemukan dalam database petugas resmi Dishub Surabaya.` });
      return;
    }
    if (profile.verificationStatus === 'revoked') {
      setResult({ ok: false, profile, message: '⚠️ KTA ini telah DICABUT oleh Dishub. Juru parkir ini TIDAK berwenang bertugas.' });
      return;
    }
    if (profile.verificationStatus === 'pending') {
      setResult({ ok: false, profile, message: '⏳ KTA juru parkir ini masih dalam status MENUNGGU VERIFIKASI Admin Dishub.' });
      return;
    }
    setResult({ ok: true, profile, message: '✅ JURU PARKIR RESMI TERVERIFIKASI oleh Dinas Perhubungan Kota Surabaya.' });
  };

  const startCamera = async () => {
    setCameraOpen(true);
    setResult(null);
    setCameraError('');
    setIsStreaming(false);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setIsStreaming(true);
        }
      } else {
        throw new Error('Fitur kamera tidak didukung di browser ini.');
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Izin akses kamera diblokir atau perangkat tidak mendukung. Gunakan tombol simulasi scan.');
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setCameraOpen(false);
  };

  useEffect(() => () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  }, []);

  return (
    <div className="flex-grow flex flex-col max-w-md mx-auto w-full h-[100dvh] md:h-[850px] bg-slate-50 md:rounded-3xl overflow-hidden select-none border border-slate-100">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 shrink-0 shadow-sm">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-extrabold text-slate-800">Verifikasi Juru Parkir Resmi</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Pindai QR KTA digital atau masukkan nomor KTA</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Open Camera Button */}
        <button
          onClick={startCamera}
          className="w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
        >
          <Camera size={20} />
          <span>Buka Kamera Scan QR Jukir</span>
        </button>

        <div className="relative flex items-center gap-2 my-2">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">atau periksa manual</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Manual Input */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nomor KTA Petugas</label>
          <div className="flex gap-2">
            <input
              value={manualKTA}
              onChange={(e) => setManualKTA(e.target.value)}
              placeholder="Contoh: KTA-SBY-2024-0042"
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="button"
              onClick={() => verifyCode(manualKTA)}
              className="px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              Cek KTA
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setManualKTA('KTA-SBY-2024-0042'); verifyCode('KTA-SBY-2024-0042'); }}
              className="text-[10px] text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Isi Demo KTA Resmi
            </button>
          </div>
        </div>

        {/* Verification Result Card */}
        {result && (
          <div className={`rounded-3xl border p-4 shadow-md animate-fade-in ${result.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-start gap-3">
              {result.ok ? <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={24} /> : <XCircle className="text-rose-600 shrink-0 mt-0.5" size={24} />}
              <div className="flex-1">
                <p className={`text-xs font-extrabold ${result.ok ? 'text-emerald-900' : 'text-rose-900'}`}>{result.message}</p>
                {result.profile && (
                  <div className="mt-3 bg-white/90 rounded-2xl p-3.5 border border-emerald-100 shadow-sm space-y-2">
                    <div className="flex items-center gap-3">
                      <img src={result.profile.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
                      <div>
                        <p className="text-xs font-black text-slate-900">{result.profile.fullName}</p>
                        <p className="text-[10px] font-mono text-indigo-600 font-bold">{result.profile.ktaNumber}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{result.profile.assignedLocation}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-bold">Shift Kerja:</span>
                        <span className="font-extrabold text-slate-700">{result.profile.shift} (Resmi)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Terdaftar Sejak:</span>
                        <span className="font-extrabold text-slate-700">{result.profile.joinedAt}</span>
                      </div>
                    </div>

                    {result.ok && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full w-full justify-center mt-1">
                        <Shield size={11} /> Surat Tugas Resmi Dinas Perhubungan Surabaya
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Information box */}
        <div className="bg-slate-100 rounded-2xl p-3.5 text-[11px] text-slate-600 font-medium leading-relaxed border border-slate-200/60">
          <p className="font-black text-slate-800 mb-1 flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-600" />
            Himbauan Anti-Pungli Dishub Surabaya:
          </p>
          Selalu pastikan juru parkir memiliki rompi dan KTA QR resmi. Jangan bayar melebihi tarif resmi (Motor Rp 2.000 / Mobil Rp 3.000 - Rp 5.000) dan laporkan bila terdapat oknum liar melalui tombol <strong>Lapor Pungli</strong>.
        </div>
      </div>

      {/* Live Camera Scanner Overlay */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Camera size={16} className="text-indigo-400" />
              Pindai QR KTA Petugas
            </span>
            <button onClick={stopCamera} className="text-white p-2 rounded-full hover:bg-white/10 cursor-pointer">
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 rounded-3xl overflow-hidden bg-black relative mb-4 flex items-center justify-center border-2 border-indigo-500/50 shadow-2xl">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />

            {/* Target Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-indigo-400 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl -mb-1 -mr-1"></div>
                <div className="w-full h-0.5 bg-indigo-400/80 animate-bounce mt-28"></div>
              </div>
            </div>

            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={36} className="text-amber-400 mb-2" />
                <p className="text-xs text-slate-200 font-bold mb-4">{cameraError}</p>
                <button
                  onClick={() => { verifyCode('KTA-SBY-2024-0042'); stopCamera(); }}
                  className="bg-indigo-600 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg"
                >
                  Gunakan Simulasi Scan KTA Resmi
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => { verifyCode('KTA-SBY-2024-0042'); stopCamera(); }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase shadow-xl cursor-pointer active:scale-95 transition-all"
          >
            <QrCode size={18} />
            <span>Simulasi Pindai QR KTA Berhasil</span>
          </button>
        </div>
      )}
    </div>
  );
}
