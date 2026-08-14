import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Flashlight, CheckCircle, AlertTriangle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface PetugasScannerProps {
  onBack: () => void;
  onVerifyCode: (code: string) => Promise<{ success: boolean; message: string }>;
}

export default function PetugasScanner({ onBack, onVerifyCode }: PetugasScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [flashSupported, setFlashSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-reader-petugas";

  useEffect(() => {
    // Initialize Scanner on mount
    const html5QrCode = new Html5Qrcode(scannerDivId);
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      async (decodedText) => {
        // on success
        if (html5QrCode.isScanning) {
          html5QrCode.pause();
        }
        await handleVerify(decodedText);
      },
      (errorMessage) => {
        // on error (ignore frequent failures finding QR in frame)
      }
    ).then(() => {
      // Check if flash is supported
      const track = html5QrCode.getRunningTrackCameraCapabilities();
      if (!track || !track.torchFeature().isSupported()) {
        setFlashSupported(false);
      }
    }).catch(err => {
      console.error("Camera error:", err);
      setErrorMsg("Kamera tidak dapat diakses. Coba periksa izin browser.");
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, []);

  // Flash Toggle handler
  const toggleFlash = async () => {
    if (!scannerRef.current || !flashSupported) return;
    
    try {
      const state = !flashOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: state } as any]
      });
      setFlashOn(state);
    } catch (err) {
      console.error("Flash toggle failed", err);
      setFlashSupported(false);
    }
  };

  const handleVerify = async (codeToVerify: string) => {
    const trimmed = codeToVerify.trim();
    if (!trimmed) return;

    setErrorMsg('');
    setSuccessMsg('');

    const result = await onVerifyCode(trimmed);
    if (result.success) {
      setSuccessMsg(result.message);
      // Wait 3 seconds then resume scan
      setTimeout(() => {
        setSuccessMsg('');
        if (scannerRef.current?.getState() === 2 /* PAUSED */) {
          scannerRef.current.resume();
        }
      }, 3000);
    } else {
      setErrorMsg(result.message);
      // Wait 3 seconds then resume scan
      setTimeout(() => {
        setErrorMsg('');
        if (scannerRef.current?.getState() === 2 /* PAUSED */) {
          scannerRef.current.resume();
        }
      }, 3000);
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-start relative w-full h-[100dvh] md:h-[850px] max-w-md mx-auto bg-slate-900 md:shadow-2xl md:rounded-3xl overflow-hidden pb-16">
      
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
          onClick={toggleFlash}
          disabled={!flashSupported}
          className={`p-2 rounded-full transition-colors cursor-pointer active:scale-95 ${
            !flashSupported ? 'text-slate-300' :
            flashOn ? 'text-amber-500 bg-amber-50' : 'text-slate-600 hover:bg-slate-100'
          }`}
          aria-label="Senter"
          title={!flashSupported ? "Flash tidak didukung" : "Toggle Senter"}
        >
          <Flashlight size={18} />
        </button>
      </header>

      {/* Main Scanner viewport layout */}
      <main className="flex-1 relative flex flex-col w-full h-full bg-slate-950 overflow-hidden">
        
        {/* Real Camera Feed Target */}
        <div className="absolute inset-0 w-full h-full">
          <div id={scannerDivId} className="w-full h-full object-cover [&>video]:object-cover [&>video]:h-full [&>video]:w-full" />
        </div>

        {/* Framing viewfinder with scanner overlays */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="relative w-64 h-64 border-2 border-transparent">
            {/* Viewfinder borders simulation */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
            
            {/* Red animating horizontal laser sweeps */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-500 shadow-md shadow-indigo-400 rounded-xl animate-scan" />
          </div>
        </div>

        {/* Bottom Panel drawer */}
        <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-xl p-5 flex flex-col gap-4 z-40">
          
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs py-2 px-3 rounded-lg border border-red-100 font-medium">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 text-xs py-2 px-3 rounded-lg border border-emerald-100 font-medium">
              <CheckCircle size={14} className="shrink-0" />
              <span>{successMsg}</span>
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
                placeholder="Masukkan ID Booking..."
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50 font-mono text-xs uppercase text-slate-700 outline-none transition-colors"
              />
              <button 
                type="button"
                onClick={() => {
                  if (scannerRef.current?.isScanning) scannerRef.current.pause();
                  handleVerify(manualCode);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors shadow-sm outline-none shrink-0"
              >
                Verifikasi
              </button>
            </div>
          </div>

          {/* Fast Testing Trigger Badge */}
          <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-semibold text-indigo-800">
            <span>Uji Coba: Pindai Cepat</span>
            <button 
              type="button"
              onClick={() => {
                const testCode = 'BK-2026-0001';
                setManualCode(testCode);
                if (scannerRef.current?.isScanning) scannerRef.current.pause();
                handleVerify(testCode);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all leading-none"
            >
              Simulasikan
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
