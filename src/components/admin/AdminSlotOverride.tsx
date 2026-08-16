import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ArrowLeft, Plus, Minus, Layers, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, MapPin } from 'lucide-react';
import { ParkingLocation, ParkingSlot, SlotStatus } from '../../types';

interface AdminSlotOverrideProps {
  location: ParkingLocation;
  allLocations?: ParkingLocation[];
  onSelectLocation?: (loc: ParkingLocation) => void;
  onBack: () => void;
  onApplyOverride: (slotID: string, newStatus: SlotStatus) => void;
  onLogout: () => void;
}

export default function AdminSlotOverride({
  location,
  allLocations = [],
  onSelectLocation,
  onBack,
  onApplyOverride,
  onLogout
}: AdminSlotOverrideProps) {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<SlotStatus>('Available');
  const [feedback, setFeedback] = useState('');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const slots = location.slots || [];

  useEffect(() => {
    const fallbackSlot = location.slots.find(s => s.status === 'Available') ?? location.slots[0] ?? null;
    setSelectedSlot(fallbackSlot);
    if (fallbackSlot) setOverrideStatus(fallbackSlot.status);
  }, [location]);

  const handleSelectSlot = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setOverrideStatus(slot.status);
    setFeedback(`Slot ${slot.slotID} dipilih.`);
  };

  const handleApply = (statusToApply?: SlotStatus) => {
    if (!selectedSlot) return;
    const targetStatus = statusToApply || overrideStatus;
    onApplyOverride(selectedSlot.slotID, targetStatus);
    setFeedback(`✓ Status slot ${selectedSlot.slotID} berhasil diubah menjadi ${targetStatus}.`);
    setSelectedSlot({ ...selectedSlot, status: targetStatus });
  };

  // Setup Leaflet map for slot overrides
  useEffect(() => {
    if (mapContainerRef.current) {
      const L = (window as any).L;
      if (!L) return;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error(e);
        }
        mapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 18,
        zoomControl: false,
        attributionControl: false
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      // Render slots on map
      slots.forEach((slot, idx) => {
        const slotLat = slot.lat || (location.latitude + (idx - 2) * 0.00012);
        const slotLng = slot.lng || (location.longitude + (idx - 2) * 0.00015);

        let boxBg = '#84cc16';
        let boxBorder = '#65a30d';
        let textColor = '#14532d';
        let labelText = 'empty';

        if (slot.status === 'Occupied' || slot.status === 'Booked') {
          boxBg = '#ea580c';
          boxBorder = '#c2410c';
          textColor = '#ffffff';
          labelText = 'booked';
        } else if (slot.status === 'Maintenance') {
          boxBg = '#ffffff';
          boxBorder = '#f97316';
          textColor = '#c2410c';
          labelText = 'mainte-nance';
        } else if (slot.status === 'IllegalBlock') {
          boxBg = '#ffffff';
          boxBorder = '#ea580c';
          textColor = '#9a3412';
          labelText = 'ILEGAL bloc';
        }

        const slotHtml = `
          <div style="background-color: ${boxBg}; border: 2px solid ${boxBorder}; width: 36px; height: 52px; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer; transform: rotate(-8deg);">
            <span style="font-size: 7px; font-weight: 900; line-height: 1; color: ${textColor}; padding: 1px; text-transform: lowercase;">${labelText}</span>
            <span style="font-size: 6px; font-weight: 800; color: ${textColor}; opacity: 0.8; margin-top: 1px;">${slot.slotID}</span>
          </div>
        `;

        const slotIcon = L.divIcon({
          html: slotHtml,
          className: 'custom-admin-slot',
          iconSize: [36, 52],
          iconAnchor: [18, 26]
        });

        const marker = L.marker([slotLat, slotLng], { icon: slotIcon }).addTo(map);
        marker.on('click', () => {
          handleSelectSlot(slot);
        });
      });
    }
  }, [location, slots]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex text-slate-800 select-none">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col py-6 space-y-4 bg-white border-r border-slate-200 shadow-sm h-screen w-[280px] fixed left-0 top-0 z-40 shrink-0">
        <div className="px-6 pb-4 mb-2 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">P</div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-none">Admin Dishub</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Slot Override Live</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Overview</span>
          </button>

          <div className="pt-4 px-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pilih Titik Parkir</span>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {allLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => onSelectLocation && onSelectLocation(loc)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    loc.id === location.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <p className="line-clamp-1 leading-snug">{loc.name}</p>
                  <p className="text-[9px] opacity-80 mt-0.5">{loc.availableCount} Slot Free</p>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Container */}
      <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full border-b border-slate-200 flex justify-between items-center px-6 py-4 bg-white z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {location.name} — Real-time Slot Override
              </h2>
              <p className="text-xs text-slate-400 font-semibold">📍 {location.region}, Surabaya • Total {slots.length} Slot</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-black text-emerald-800">Leaflet Live Sync</span>
          </div>
        </header>

        {/* Split Layout: Map vs Slot Modifier Grid */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaflet Map Preview */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Peta Visual Slot Real-Time</h3>
                <p className="text-[11px] text-slate-400">Klik kotak slot di peta atau pilih dari daftar untuk mengubah status</p>
              </div>

              <div className="flex items-center gap-2 text-[9px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-lime-500 border border-orange-500" /> Empty</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-600" /> Booked</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-white border-2 border-orange-500" /> Maintenance</span>
              </div>
            </div>

            <div ref={mapContainerRef} className="w-full h-[400px] lg:h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-md relative" />
          </div>

          {/* Slot Modifier Panel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                KONTROL STATUS SLOT
              </span>
              <h3 className="text-base font-black text-slate-900 mt-2">
                {selectedSlot ? `Slot ID: ${selectedSlot.slotID}` : 'Pilih Salah Satu Slot'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Zona {selectedSlot?.zone} • {selectedSlot?.type} • Tarif Rp {selectedSlot?.ratePerHour.toLocaleString('id-ID')}/jam
              </p>
            </div>

            {feedback && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Quick Status Modifiers */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Ubah Status Menjadi:</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleApply('Available')}
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Kosong (Available)
                </button>

                <button
                  onClick={() => handleApply('Occupied')}
                  className="p-3 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Terisi (Occupied)
                </button>

                <button
                  onClick={() => handleApply('Maintenance')}
                  className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Maintenance
                </button>

                <button
                  onClick={() => handleApply('IllegalBlock')}
                  className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Blokir Ilegal
                </button>
              </div>
            </div>

            {/* Visual Slots Grid */}
            <div className="pt-2 border-t border-slate-100 flex-1 flex flex-col">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">Daftar Seluruh Slot ({slots.length})</span>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {slots.map((s) => {
                  const isSel = selectedSlot?.slotID === s.slotID;
                  const isAvail = s.status === 'Available';
                  const isMaint = s.status === 'Maintenance';
                  const isIllegal = s.status === 'IllegalBlock';
                  return (
                    <button
                      key={s.slotID}
                      onClick={() => handleSelectSlot(s)}
                      className={`p-2 rounded-xl text-center border-2 font-mono text-xs font-black transition-all cursor-pointer ${
                        isSel ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow' 
                          : isAvail ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                          : isMaint ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : isIllegal ? 'border-rose-300 bg-rose-50 text-rose-800'
                          : 'border-orange-200 bg-orange-50 text-orange-800'
                      }`}
                    >
                      {s.slotID}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
