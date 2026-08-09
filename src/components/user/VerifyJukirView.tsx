import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, QrCode, CheckCircle, XCircle, Shield, Camera, X } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const verifyCode = async (code: string) => {
    let kta = code.trim();
    if (kta.toUpperCase().startsWith('PARKWISE:JUKIR:')) {
      kta = kta.split(':')[2] ?? kta;
    }

    const profile = await getJukirByKTA(kta);
    if (!profile) {
      setResult({ ok: false, message: `KTA "${kta}" tidak ditemukan di database petugas resmi.` });
      return;
    }
    if (profile.verificationStatus === 'revoked') {
      setResult({ ok: false, profile, message: '⚠️ KTA ini telah dicabut oleh Admin Dishub. Petugas TIDAK resmi.' });
      return;
    }
    if (profile.verificationStatus === 'pending') {
      setResult({ ok: false, profile, message: 'KTA masih menunggu verifikasi Admin Dishub.' });
      return;
    }
    setResult({ ok: true, profile, message: '✅ Petugas parkir RESMI terverifikasi oleh Dishub Surabaya.' });
  };

  const startCamera = async () => {
    setCameraOpen(true);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch {
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsStreaming(false);
    setCameraOpen(false);
  };

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  return (
    <div className="flex-grow flex flex-col max-w-md mx-auto w-full h-[850px] bg-slate-50 md:rounded-3xl overflow-hidden">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-100"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-sm font-extrabold text-slate-800">Verifikasi Jukir Resmi</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Scan QR / masukkan nomor KTA petugas</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <button
          onClick={startCamera}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-md"
        >
          <Camera size={20} /> Scan QR Identitas Petugas
        </button>

        <div className="relative flex items-center gap-2">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">atau</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase">Nomor KTA Manual</label>
          <div className="flex gap-2">
            <input
              value={manualKTA}
              onChange={(e) => setManualKTA(e.target.value)}
              placeholder="KTA-SBY-2024-0042"
              className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold font-mono"
            />
            <button
              type="button"
              onClick={() => verifyCode(manualKTA)}
              className="px-4 bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Cek
            </button>
          </div>
        </div>

        {result && (
          <div className={`rounded-2xl border p-4 ${result.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-start gap-3">
              {result.ok ? <CheckCircle className="text-emerald-600 shrink-0" size={24} /> : <XCircle className="text-rose-600 shrink-0" size={24} />}
              <div className="flex-1">
                <p className={`text-sm font-extrabold ${result.ok ? 'text-emerald-800' : 'text-rose-800'}`}>{result.message}</p>
                {result.profile && (
                  <div className="mt-3 flex gap-3 items-center bg-white/60 rounded-xl p-3">
                    <img src={result.profile.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white" />
                    <div>
                      <p className="text-xs font-black text-slate-800">{result.profile.fullName}</p>
                      <p className="text-[10px] font-mono text-indigo-600">{result.profile.ktaNumber}</p>
                      <p className="text-[10px] text-slate-500">{result.profile.assignedLocation}</p>
                      {result.ok && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                          <Shield size={10} /> Terverifikasi Dishub
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-100 rounded-xl p-3 text-[10px] text-slate-500 font-medium leading-relaxed">
          Pastikan petugas parkir menunjukkan QR identitas resmi. Hanya petugas dengan KTA digital terverifikasi yang berwenang mengelola parkir resmi Kota Surabaya.
        </div>
      </div>

      {cameraOpen && (
        <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-white uppercase">Scan QR Petugas</span>
            <button onClick={stopCamera} className="text-white p-2"><X size={20} /></button>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden bg-black relative mb-4">
            {isStreaming && <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">Simulasi Scanner Aktif</div>
            )}
          </div>
          <button
            onClick={() => { verifyCode('KTA-SBY-2024-0042'); stopCamera(); }}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <QrCode size={16} /> Simulasi Scan Berhasil
          </button>
        </div>
      )}
    </div>
  );
}
