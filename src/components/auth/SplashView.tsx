import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashViewProps {
  onComplete: () => void;
}

export default function SplashView({ onComplete }: SplashViewProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      id="splash-screen" 
      className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 min-h-screen w-screen flex flex-col items-center justify-center overflow-hidden antialiased text-white select-none relative"
    >
      {/* Ambient background blur elements for modern aesthetic */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-slate-400 blur-[140px]" />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md px-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Glowing App Logo Card with elegant gradients */}
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-indigo-50 opacity-80" />
            <span className="text-indigo-600 font-extrabold text-5xl relative z-10 font-sans tracking-tighter">P</span>
          </div>

          <h1 className="font-sans text-4xl font-extrabold text-center tracking-tight text-white mb-2 drop-shadow-md">
            ParkWise
          </h1>
          
          <p className="font-sans text-sm text-indigo-200 text-center tracking-widest font-medium uppercase opacity-90">
            Digital Parking Solutions
          </p>
        </motion.div>

        {/* High fidelity CSS-based Loader Ring */}
        <div className="mt-12 flex justify-center items-center">
          <div className="relative w-10 h-10">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-white/20 rounded-full" />
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>

      {/* Municipal Attribution */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-8 w-full flex justify-center pb-4"
      >
        <p className="font-sans text-xs text-indigo-200 tracking-wider font-semibold uppercase">
          Surabaya Smart City Initiative
        </p>
      </motion.div>
    </div>
  );
}
