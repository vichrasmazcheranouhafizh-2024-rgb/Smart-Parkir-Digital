import React, { useState } from 'react';
import { ArrowLeft, Layers, CheckCircle, Lock, Car, ArrowRight, ShieldCheck } from 'lucide-react';
import { ParkingLocation, ParkingSlot } from '../../types';

interface SlotSelectionProps {
  location: ParkingLocation;
  onBack: () => void;
  onConfirmSlot: (slot: ParkingSlot) => void;
}

export default function SlotSelection({ location, onBack, onConfirmSlot }: SlotSelectionProps) {
  // Setup default selected slot (A05 is selected by default to mirror image layout perfectly!)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot>(() => {
    const a05 = location.slots.find(s => s.slotID === 'A05');
    return a05 || location.slots.find(s => s.status === 'Available' || s.status === 'Selected') || location.slots[0];
  });

  const slots = location.slots;
  const zoneA = slots.filter(s => s.zone === 'A');
  const zoneB = slots.filter(s => s.zone === 'B');

  const handleSelectSlot = (slot: ParkingSlot) => {
    if (slot.status === 'Occupied' || slot.status === 'Booked') {
      return; // Cannot select occupied or booked slots
    }
    setSelectedSlot(slot);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-[100dvh] md:h-[850px] max-w-md mx-auto bg-white md:shadow-2xl md:rounded-3xl overflow-hidden select-none">
      
      {/* Top Header Navigation bar */}
      <header className="w-full bg-white text-blue-600 border-b border-slate-100 flex justify-between items-center px-4 py-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
            aria-label="Kembali"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="leading-tight">
            <h1 className="text-sm font-extrabold text-slate-800 leading-none">{location.name}</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{location.region}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border">
          <span className="text-xs font-bold font-sans">Level B1</span>
          <Layers size={13} className="text-slate-400" />
        </div>
      </header>

      {/* Main Interactive Grid Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 relative bg-slate-50 bg/20">
        
        {/* Status Legend box */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-3 mb-4 rounded-2xl shadow-sm border border-slate-200/50 z-10 flex flex-wrap gap-x-4 gap-y-2.5 justify-center">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 bg-emerald-50" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-400" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-indigo-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            </div>
            <span>Selected</span>
          </div>
        </div>

        {/* Dynamic Zone Slots Layout */}
        <div className="space-y-6 max-w-md mx-auto pt-2">
          
          <div className="flex gap-4">
            
            {/* Zone A Card Grid */}
            <div className="flex-1 bg-white rounded-2xl p-3 border border-slate-200/60 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Zone A</h3>
              <div className="grid grid-cols-2 gap-2">
                {zoneA.map((s) => {
                  const isSelected = selectedSlot.slotID === s.slotID;
                  
                  if (s.status === 'Occupied') {
                    return (
                      <div 
                        key={s.slotID} 
                        className="h-14 rounded-xl bg-slate-300 text-white flex flex-col items-center justify-center relative cursor-not-allowed group"
                      >
                        <span className="text-[11px] font-bold opacity-90">{s.slotID}</span>
                        <Car size={14} className="opacity-70 mt-1" />
                      </div>
                    );
                  }
                  
                  if (s.status === 'Booked') {
                    return (
                      <div 
                        key={s.slotID} 
                        className="h-14 rounded-xl bg-amber-400 text-[#78350F] flex flex-col items-center justify-center cursor-not-allowed group"
                      >
                        <span className="text-[11px] font-bold">{s.slotID}</span>
                        <Lock size={12} className="opacity-80 mt-1 animate-pulse" />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={s.slotID}
                      type="button"
                      onClick={() => handleSelectSlot(s)}
                      className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-extrabold ring-4 ring-indigo-50 shadow-md' 
                          : 'border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      <span className="text-xs font-bold">{s.slotID}</span>
                      {isSelected ? (
                        <CheckCircle size={14} className="text-indigo-600 mt-1 animate-pulse" />
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-500 mt-0.5">VIP</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Driving Direction Arrow Lane */}
            <div className="w-8 flex flex-col items-center justify-center relative">
              <div className="absolute inset-y-0 w-0.5 border-l-2 border-dashed border-slate-300/80" />
              <div className="bg-slate-50 py-2.5 z-10 flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-black tracking-widest writing-mode-vertical uppercase rotate-90 leading-none mb-1">Lane</span>
                <span className="text-indigo-400 animate-bounce">↓</span>
              </div>
            </div>

            {/* Zone B Card Grid */}
            <div className="flex-1 bg-white rounded-2xl p-3 border border-slate-200/60 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Zone B</h3>
              <div className="grid grid-cols-2 gap-2">
                {zoneB.map((s) => {
                  const isSelected = selectedSlot.slotID === s.slotID;
                  
                  if (s.status === 'Occupied') {
                    return (
                      <div 
                        key={s.slotID} 
                        className="h-14 rounded-xl bg-slate-300 text-white flex flex-col items-center justify-center relative cursor-not-allowed"
                      >
                        <span className="text-[11px] font-bold opacity-90">{s.slotID}</span>
                        <Car size={14} className="opacity-70 mt-1" />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={s.slotID}
                      type="button"
                      onClick={() => handleSelectSlot(s)}
                      className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-extrabold ring-4 ring-indigo-50 shadow-md' 
                          : 'border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      <span className="text-xs font-bold">{s.slotID}</span>
                      {isSelected && <CheckCircle size={14} className="text-indigo-600 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Notice Banner */}
          <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100 flex items-start gap-2 max-w-sm mx-auto">
            <ShieldCheck size={16} className="text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-indigo-800 leading-relaxed font-semibold">
              Kamera LPR (License Plate Recognition) akan otomatis memverifikasi kecocokan plat nomor sblm gate terbuka.
            </p>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Context Drawer Card */}
      <div className="bg-slate-100 border-t border-slate-200 p-5 rounded-t-3xl shadow-[0_-8px_20px_rgba(0,0,0,0.05)] shrink-0">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Slot Terpilih</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-black text-indigo-600 leading-none">{selectedSlot.slotID}</span>
          <span className="text-xs font-bold text-slate-400">Zone {selectedSlot.zone} • {selectedSlot.type}</span>
        </div>

        <div className="space-y-2 mb-5 text-xs font-semibold text-slate-600">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
            <span>Tarif Per Jam</span>
            <span className="font-extrabold text-slate-800">Rp {selectedSlot.ratePerHour.toLocaleString('id-ID')} / jam</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
            <span>Jarak ke Lift Utama</span>
            <span className="font-extrabold text-slate-800">{selectedSlot.distanceToLift} m</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>Atap Pelindung</span>
            <span className="font-extrabold text-indigo-600">{selectedSlot.covered ? 'Ya (Indoor)' : 'Tidak (Outdoor)'}</span>
          </div>
        </div>

        {/* Progress Trigger button */}
        <button
          onClick={() => onConfirmSlot(selectedSlot)}
          className="w-full bg-indigo-600 text-white font-sans text-sm font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/15 hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 focus:outline-none"
        >
          Pilih Slot
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}
