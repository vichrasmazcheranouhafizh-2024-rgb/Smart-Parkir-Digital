import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Search } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: () => void;
}

interface Step {
  title: string;
  desc: string;
  icon: string;
  mapOverlay: React.ReactNode;
}

export default function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "Cari Lokasi Parkir",
      desc: "Temukan ribuan lokasi parkir di Surabaya dengan peta interaktif secara real-time.",
      icon: "local_parking",
      mapOverlay: (
        <div className="absolute inset-0 bg-[#e2e8f0]/40 overflow-hidden">
          {/* Grid lines simulating technical layout */}
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
          
          {/* Main pulsing locator mapping pin */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <div className="w-10 h-10 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white text-white font-bold">
                P
              </div>
              <div className="absolute top-0 left-0 w-10 h-10 bg-indigo-600 rounded-full animate-ping opacity-30" />
            </div>
            <div className="w-2 h-2 bg-indigo-600/40 rounded-full mt-1 animate-pulse" />
          </div>

          {/* Secondary static locations pin */}
          <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-85">
            <div className="w-8 h-8 bg-white text-indigo-600 rounded-full shadow-md flex items-center justify-center border border-indigo-200 font-bold text-sm">
              P
            </div>
          </div>

          <div className="absolute bottom-1/3 left-1/3 transform translate-x-1/2 translate-y-1/2 flex flex-col items-center opacity-70">
            <div className="w-8 h-8 bg-white text-indigo-600 rounded-full shadow-md flex items-center justify-center border border-indigo-200 font-bold text-sm">
              P
            </div>
          </div>

          {/* Device User Pulsing Spot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-md relative">
              <div className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-75" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Booking Slot Praktis",
      desc: "Pilih dan amankan slot parkir favorit Anda agar bebas khawatir saat tiba di tujuan.",
      icon: "space_dashboard",
      mapOverlay: (
        <div className="absolute inset-0 bg-[#e2e8f0]/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3 w-56 flex flex-col gap-2 scale-105">
            <div className="flex border-b pb-1.5 justify-between text-[11px] font-bold text-slate-500">
              <span>Lantai B1</span>
              <span className="text-indigo-600">Terpilih: A12</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 py-1">
              <div className="h-8 bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] rounded font-bold flex items-center justify-center">A10</div>
              <div className="h-8 bg-slate-300 text-white text-[10px] rounded flex items-center justify-center">A11</div>
              <div className="h-8 bg-indigo-500 text-white text-[10px] rounded font-bold flex items-center justify-center border-2 border-indigo-600 ring-2 ring-indigo-200">A12</div>
              <div className="h-8 bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] rounded font-bold flex items-center justify-center">A13</div>
              <div className="h-8 bg-slate-300 text-white text-[10px] rounded flex items-center justify-center">A14</div>
              <div className="h-8 bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] rounded font-bold flex items-center justify-center">A15</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pembayaran Cashless",
      desc: "Bayar otomatis menggunakan e-wallet (QRIS, OVO, Gopay) tanpa antre karcis fisik.",
      icon: "payments",
      mapOverlay: (
        <div className="absolute inset-0 bg-[#e2e8f0]/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-4 w-48 border border-slate-100 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Tariff</span>
            <span className="text-lg font-extrabold text-indigo-600">Rp 15.000</span>
            <div className="w-full h-px bg-slate-100 my-1" />
            <div className="flex gap-1.5 w-full justify-center">
              <span className="text-[10px] px-2 py-0.5 bg-indigo-50 border border-indigo-250 text-indigo-600 rounded-full font-bold">QRIS</span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-bold">OVO</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold">GoPay</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div id="onboarding-container" className="flex-1 flex flex-col relative w-full h-[850px] max-w-md mx-auto bg-[#faf8ff] md:shadow-2xl md:rounded-3xl overflow-hidden border border-slate-100">
      
      {/* Header Actions */}
      <header className="w-full flex justify-between items-center px-6 py-4 absolute top-0 z-20">
        <div className="flex items-center space-x-1.5 text-indigo-600 font-extrabold">
          <span className="text-xl">ParkWise</span>
        </div>
        <button 
          onClick={onComplete}
          className="text-slate-400 text-sm font-semibold hover:text-indigo-600 transition-colors focus:outline-none"
        >
          Skip
        </button>
      </header>

      {/* Dynamic Interactive Illustration Canvas */}
      <div className="flex-1 relative w-full bg-indigo-50/20 flex items-center justify-center p-8 mt-12 rounded-b-[40px] overflow-hidden">
        {/* Underlay city map backdrop illustration */}
        <div className="absolute inset-0 w-full h-full opacity-60">
          <img 
            alt="City Map background Surabaya" 
            className="w-full h-full object-cover grayscale opacity-40 mix-blend-multiply" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkPkEeBbx5xJdVyOpcB7F2gpmeaVUwF7FNt38ZacmB7pUfkHSWpymnfeaQhBCB2j7j8LuriMvksxhkzZXK4QIPuYI72fiwsyfWKPwlAh1t4rEBVIPfp5sxtvS-0UpihVI_xVsFW9pDX5N9eNPsqRSJpIVM5Hx1gsfC-B9a7VIUHkUsAWWCsRrqrBcXEwxjuwsPcqGFOVQgvvmeYsLId8TruQeuPQm2BECvXV0wYpVYFlwbCrhy5d0CaMzdbEdpjha5vMsnfSQUZBY1"
          />
        </div>

        {/* Floating Device Frame Visual with full animation transition */}
        <div className="relative z-10 w-full max-w-[280px] aspect-[4/5] bg-white rounded-3xl shadow-xl border border-slate-200/50 flex flex-col overflow-hidden transform duration-500">
          {/* Device header search mockup */}
          <div className="h-12 bg-slate-50 flex items-center px-4 border-b border-slate-100">
            <div className="w-full h-8 bg-white border border-slate-200/80 rounded-full flex items-center px-3 shadow-sm">
              <Search className="text-slate-400 mr-2" size={14} />
              <div className="w-24 h-2 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Interactive display mockup loaded matching current slide step */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                {steps[currentStep].mapOverlay}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Backdrop glowing sphere accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-100 rounded-full blur-[80px] -z-10 opacity-70" />
      </div>

      {/* Content & Navigation Console */}
      <div className="w-full bg-white px-6 py-8 flex flex-col justify-end min-h-[320px] shadow-inner">
        {/* Pagination Dots Indicator */}
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Card Text Content with sliding fade translation */}
        <div className="text-center mb-8 h-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-extrabold text-slate-800 mb-2.5 tracking-tight">
                {steps[currentStep].title}
              </h1>
              <p className="text-sm font-medium text-slate-500 max-w-[290px] mx-auto leading-relaxed">
                {steps[currentStep].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Primary Action Button */}
        <div className="w-full mt-auto">
          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 text-white font-sans text-sm font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 group"
          >
            {currentStep === steps.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
            <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
