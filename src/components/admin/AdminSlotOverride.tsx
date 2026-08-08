import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Layers } from 'lucide-react';
import { ParkingLocation, ParkingSlot, Role } from '../../types';

interface AdminSlotOverrideProps {
  location: ParkingLocation;
  onBack: () => void;
  onApplyOverride: (slotID: string, newStatus: ParkingSlot['status']) => void;
  onLogout: () => void;
}

export default function AdminSlotOverride({
  location,
  onBack,
  onApplyOverride,
  onLogout
}: AdminSlotOverrideProps) {
  const [selectedLvl, setSelectedLvl] = useState<'L2' | 'L3' | 'L4'>('L2');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot>(location.slots[4]); // A05/B2
  const [overrideStatus, setOverrideStatus] = useState<ParkingSlot['status']>('Selected');

  const slots = location.slots;
  const zoneA = slots.filter(s => s.zone === 'A');
  const zoneB = slots.filter(s => s.zone === 'B');

  const handleSelectSlot = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setOverrideStatus(slot.status);
  };

  const handleApply = () => {
    onApplyOverride(selectedSlot.slotID, overrideStatus);
    alert(`Status slot ${selectedSlot.slotID} diperbarui menjadi ${overrideStatus}!`);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-100 flex text-slate-800 select-none">
      
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col py-6 space-y-4 bg-white border-r border-slate-200 shadow-sm h-screen w-[280px] fixed left-0 top-0 z-40 transition-all duration-200 shrink-0">
        <div className="px-6 pb-4 mb-4 border-b border-slate-100 flex items-center gap-3">
          <img 
            alt="Admin Headshot" 
            className="w-12 h-12 rounded-full object-cover border" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkFSbTrg5ap-VyXHwmAvGpre2aFBG6QpyOo-EiJIny5Y5tgh2o_yjDlJ9pJu9GDsSLbIM4cJ7YB6VMzZCMfP_Y88dTVJhjOIg0oPeQfFh-NfppovJGK8BVqYQ9cqCvUnzjzP4DjkV8dyGbw2WDBk_tJ9K8Xy0OQ07ninDjPpSMph__D4Ob_bzKe1yxq1ACt2b2CK4EIwqbYzTCZDr_kiIkd4DpRK-ia42IwlR6wErr3BjeJvAV26qtNWBg-6Bl9fz3KdbU2os1-ZYz" 
          />
          <div>
            <h2 className="text-sm font-extrabold text-indigo-900 leading-none">Admin Panel</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Asset Surabaya</p>
            <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded mt-1.5 inline-block">v2.1.0</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-1 font-sans text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Overview</span>
          </button>

          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
          >
            <Layers size={16} />
            <span>Manage Lots</span>
          </button>
        </nav>

        <div className="px-4 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl border border-red-200 text-xs font-bold uppercase transition-colors"
          >
            Sistem Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area split */}
      <main className="flex-1 lg:ml-[280px] flex flex-col h-screen overflow-hidden">
        
        {/* App Bar Header */}
        <header className="w-full border-b border-slate-200 flex justify-between items-center px-6 py-4 bg-white z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="lg:hidden p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-md font-extrabold text-slate-800 leading-none">
              Tunjungan Plaza - Level 2 Monitor
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            <span className="w-2.5 h-3.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
            <span className="text-xs font-bold text-emerald-800">Live Sync Active</span>
          </div>
        </header>

        {/* Lower body pane splits: grid layout vs sidebar override */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
          
          {/* Layout map graphic area */}
          <div className="flex-1 relative overflow-auto p-6 flex flex-col">
            
            {/* Top L2/L3 selection and zoom cards overlay */}
            <div className="flex justify-between items-start mb-6">
              <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200/50 flex gap-1">
                {(['L2', 'L3', 'L4'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLvl(lvl)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedLvl === lvl ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200/50 flex flex-col gap-2">
                <button aria-label="Perbesar" className="p-1 rounded hover:bg-slate-50 text-slate-600">
                  <Plus size={16} />
                </button>
                <div className="h-px bg-slate-100" />
                <button aria-label="Perkecil" className="p-1 rounded hover:bg-slate-50 text-slate-600">
                  <Minus size={16} />
                </button>
              </div>
            </div>

            {/* Custom Grid Map visual layout matching Mock exactly */}
            <div className="min-w-[750px] p-6 bg-white rounded-3xl border border-slate-200/40 shadow-sm flex flex-col items-center gap-6 my-auto">
              
              {/* Row A */}
              <div className="flex items-center gap-6">
                <span className="text-lg font-black text-slate-300 w-8 text-center">A</span>
                <div className="flex gap-2">
                  {zoneA.map(s => {
                    const isFocus = selectedSlot.slotID === s.slotID;
                    const statusClass = 
                      isFocus ? 'border-2 border-indigo-600 bg-indigo-50/50 text-indigo-700 font-extrabold ring-4 ring-indigo-50 shadow-md scale-105' :
                      s.status === 'Occupied' ? 'bg-slate-300 text-slate-500' :
                      s.status === 'Booked' ? 'bg-amber-400 text-amber-950 font-bold border-2 border-amber-500' :
                      'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/50';

                    return (
                      <button
                        key={s.slotID}
                        onClick={() => handleSelectSlot(s)}
                        className={`w-14 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${statusClass}`}
                      >
                        <span className="text-xs font-bold leading-none mb-1">{s.slotID}</span>
                        {s.status === 'Occupied' && <span className="text-[10px]">🚗</span>}
                        {s.status === 'Booked' && <span className="text-[10px] animate-pulse">🔒</span>}
                      </button>
                    );
                  })}
                </div>
                
                {/* Traffic exit placeholder */}
                <div className="w-28 h-20 border-2 border-dashed border-slate-300 bg-slate-50/80 rounded-xl flex items-center justify-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    ↑ EXIT WAY
                  </span>
                </div>
              </div>

              {/* Driving driveway lane divider */}
              <div className="w-full max-w-2xl h-12 flex items-center justify-center border-y border-dashed border-slate-200">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                  ← 🚗 Driveway Lane 🛵 ←
                </span>
              </div>

              {/* Row B */}
              <div className="flex items-center gap-6">
                <span className="text-lg font-black text-slate-300 w-8 text-center">B</span>
                <div className="flex gap-2">
                  {zoneB.map(s => {
                    const isFocus = selectedSlot.slotID === s.slotID;
                    const statusClass = 
                      isFocus ? 'border-2 border-indigo-600 bg-indigo-50/50 text-indigo-700 font-extrabold ring-4 ring-indigo-50 shadow-md scale-105' :
                      s.status === 'Occupied' ? 'bg-slate-300 text-slate-500' :
                      s.status === 'Booked' ? 'bg-amber-400 text-amber-950 font-bold border-2 border-amber-500' :
                      'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/50';

                    return (
                      <button
                        key={s.slotID}
                        onClick={() => handleSelectSlot(s)}
                        className={`w-14 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${statusClass}`}
                      >
                        <span className="text-xs font-bold leading-none mb-1">{s.slotID}</span>
                        {s.status === 'Occupied' && <span className="text-[10px]">🚗</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Pillar mockup indicator */}
                <div className="w-28 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-400 border uppercase tracking-wider">
                  PILLAR
                </div>
              </div>

            </div>

          </div>

          {/* Right contextual panel side sheet */}
          <aside className="w-full md:w-[320px] bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-sm overflow-y-auto">
            
            {/* Occupany status header summary */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Level 2 Status</h3>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-4xl font-black text-indigo-600">82%</span>
                <span className="text-xs font-bold text-slate-400">Penuh</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '82%' }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase mb-1">Kosong</p>
                  <p className="text-emerald-500">45 slot</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase mb-1">Kapasitas</p>
                  <p className="text-slate-700">250 slot</p>
                </div>
              </div>
            </div>

            {/* Selected Override options Panel */}
            <div id="slot-override-block" className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Status Override</h4>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded border border-indigo-100 font-mono">
                    ID: {selectedSlot.slotID}
                  </span>
                </div>

                {/* Grid inputs */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 border-b pb-2.5">
                    <span>Status Saat Ini</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-1 leading-none">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse inline-block" /> {selectedSlot.status}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      overrideStatus === 'Available' ? 'bg-white border-emerald-500 ring-2 ring-emerald-50 shadow-sm' : 'bg-transparent border-slate-200 hover:bg-slate-100/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="override" 
                        checked={overrideStatus === 'Available'} 
                        onChange={() => setOverrideStatus('Available')}
                        className="text-indigo-600 focus:ring-indigo-500 border-slate-200 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-700 flex-1">Mark Available</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </label>

                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      overrideStatus === 'Occupied' ? 'bg-white border-slate-400 ring-2 ring-slate-50 shadow-sm' : 'bg-transparent border-slate-200 hover:bg-slate-100/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="override" 
                        checked={overrideStatus === 'Occupied'} 
                        onChange={() => setOverrideStatus('Occupied')}
                        className="text-indigo-600 focus:ring-indigo-500 border-slate-200 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-700 flex-1">Mark Occupied</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    </label>

                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      overrideStatus === 'Booked' ? 'bg-white border-amber-500 ring-2 ring-amber-50 shadow-sm' : 'bg-transparent border-slate-200 hover:bg-slate-100/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="override" 
                        checked={overrideStatus === 'Booked'} 
                        onChange={() => setOverrideStatus('Booked')}
                        className="text-indigo-600 focus:ring-indigo-500 border-slate-200 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-700 flex-1">Maintenance Lock</span>
                      <span className="text-[10px] text-amber-500 font-bold">⚠️ LOCKED</span>
                    </label>
                  </div>
                </div>

                <button 
                  onClick={handleApply}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                >
                  Apply Override
                </button>
              </div>

              {/* prediction analytics widgets spacer */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Peak Hours Estimation</span>
                <div className="h-16 w-full flex items-end justify-between px-1 gap-1">
                  <div className="bg-indigo-200 h-[30%] w-full rounded" />
                  <div className="bg-indigo-300 h-[45%] w-full rounded" />
                  <div className="bg-indigo-500 h-[60%] w-full rounded" />
                  <div className="bg-indigo-600 h-[95%] w-full rounded animate-pulse" />
                  <div className="bg-indigo-500 h-[75%] w-full rounded" />
                  <div className="bg-indigo-300 h-[50%] w-full rounded" />
                  <div className="bg-indigo-200 h-[30%] w-full rounded" />
                </div>
                <div className="flex justify-between text-[9px] font-black text-slate-400">
                  <span>10.00</span>
                  <span>13.00</span>
                  <span>16.00</span>
                </div>
              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}
