import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Sliders, Scan, History, MapPin, Compass, CalendarCheck, User as UserIcon, 
  Plus, X, AlertTriangle, Loader2, Camera, Check, Wallet, CheckCircle, Save, ImagePlus, 
  Shield, Receipt, Flag, Sparkles, PhoneCall, RefreshCw, Car, Bike, Info, ArrowRight
} from 'lucide-react';
import { ParkingLocation, Booking, UserProfile, UserTransactionRecord, createDefaultProfile, ParkingSlot } from '../../types';
import { getUserProfile, putUserProfile } from '../../db';
import { syncProfileToSupabase } from '../../lib/supabase';

interface UserDashboardProps {
  locations: ParkingLocation[];
  walletBalance: number;
  activeBookings: Booking[];
  userTransactions: UserTransactionRecord[];
  reporterName: string;
  reporterPhone: string;
  onSelectLocation: (loc: ParkingLocation) => void;
  onSelectLocationWithSlot?: (loc: ParkingLocation, slot: ParkingSlot) => void;
  onOpenScanner: () => void;
  onOpenVerifyJukir: () => void;
  onOpenLaporPungli: () => void;
  onShowHistory: () => void;
  onTopUp: (amount: number) => void;
  onLogout: () => void;
  onCheckInBooking: (bookingID: string) => void;
}

export default function UserDashboard({
  locations,
  walletBalance,
  activeBookings,
  userTransactions,
  reporterName,
  reporterPhone,
  onSelectLocation,
  onSelectLocationWithSlot,
  onOpenScanner,
  onOpenVerifyJukir,
  onOpenLaporPungli,
  onShowHistory,
  onTopUp,
  onLogout,
  onCheckInBooking
}: UserDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'booking' | 'profile'>('home');

  // Filter criteria
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'off-street' | 'in-street'>('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState<'all' | 'car' | 'motorcycle'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Interactive added features states
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  
  // Custom camera scanner mechanics for Scan Gate
  const [gateCameraModalOpen, setGateCameraModalOpen] = useState(false);
  const [isGateStreaming, setIsGateStreaming] = useState(false);
  const [gateCameraError, setGateCameraError] = useState(false);
  const [scanGateSuccess, setScanGateSuccess] = useState(false);
  const [showGateInfoModal, setShowGateInfoModal] = useState(false);
  const gateVideoRef = useRef<HTMLVideoElement | null>(null);
  const gateMediaStreamRef = useRef<MediaStream | null>(null);

  // Custom wallet top-up mechanics
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [customTopUpVal, setCustomTopUpVal] = useState('');
  const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);

  // Profile editor state
  const [profile, setProfile] = useState<UserProfile>(createDefaultProfile());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Map elements references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<ParkingLocation | null>(null);

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || loc.category === selectedCategory;
    const matchesVehicle = selectedVehicleType === 'all' || (loc.vehicleTypes ? loc.vehicleTypes.includes(selectedVehicleType) : true);
    const matchesAvailable = !onlyAvailable || loc.availableCount > 0;
    return matchesSearch && matchesCategory && matchesVehicle && matchesAvailable;
  });

  // Map global bridge for slot selection
  useEffect(() => {
    (window as any).onSelectSlotFromLeaflet = (locId: string, slotId: string) => {
      const loc = locations.find(l => l.id === locId);
      if (loc) {
        const slot = loc.slots.find(s => s.slotID === slotId);
        if (slot) {
          if (slot.status === 'Occupied' || slot.status === 'Booked') {
            triggerToast(`Slot ${slot.slotID} sedang terisi (${slot.vehiclePlate || 'Booked'}). Pilih slot warna hijau!`, 'error');
            return;
          }
          if (slot.status === 'Maintenance') {
            triggerToast(`Slot ${slot.slotID} sedang dalam perbaikan (Maintenance).`, 'error');
            return;
          }
          if (slot.status === 'IllegalBlock') {
            triggerToast(`Slot ${slot.slotID} terdeteksi blok ilegal / parkir liar! Menghubungi Dishub...`, 'error');
            return;
          }
          if (onSelectLocationWithSlot) {
            onSelectLocationWithSlot(loc, slot);
          } else {
            onSelectLocation(loc);
          }
        } else {
          onSelectLocation(loc);
        }
      }
    };

    (window as any).onSelectLocationFromMap = (locId: string) => {
      const found = locations.find(l => l.id === locId);
      if (found) {
        onSelectLocation(found);
      }
    };

    return () => {
      delete (window as any).onSelectSlotFromLeaflet;
      delete (window as any).onSelectLocationFromMap;
    };
  }, [locations, onSelectLocation, onSelectLocationWithSlot]);

  // Leaflet map setup with Real-Time Slot polygon overlays (as in user's image reference)
  useEffect(() => {
    if (activeTab === 'search' && mapContainerRef.current) {
      const L = (window as any).L;
      if (!L) {
        console.warn('Leaflet global "L" is not loaded yet');
        return;
      }

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error(e);
        }
        mapRef.current = null;
      }

      // Default center around Jl. Tunjungan / Surabaya center
      const map = L.map(mapContainerRef.current, {
        center: [-7.2598, 112.7390],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Render location markers & visual slot boxes on the map
      filteredLocations.forEach(loc => {
        const markerColor = loc.category === 'off-street' ? '#f59e0b' : '#3b82f6';
        const markerLabel = loc.category === 'off-street' ? 'STREET' : 'MALL';

        const markerHtml = `
          <div style="position: relative; display: inline-block; cursor: pointer;">
            <div style="background-color: ${markerColor}; border: 2.5px solid #ffffff; width: 34px; height: 34px; border-radius: 50%; color: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-family: system-ui, sans-serif;">
              <span style="font-size: 9px; font-weight: 900; line-height: 1;">P</span>
              <span style="font-size: 6.5px; font-weight: 800; line-height: 1; letter-spacing: -0.2px;">${markerLabel}</span>
            </div>
            <div style="position: absolute; bottom: -3px; left: 14px; width: 6px; height: 6px; background-color: ${markerColor}; transform: rotate(45deg); border-right: 1px solid white; border-bottom: 1px solid white;"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-map-pin',
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -32]
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px; min-width: 190px; line-height: 1.4;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 8px; font-weight: 900; background-color: ${markerColor}20; color: ${markerColor}; border-radius: 4px; padding: 2px 6px; text-transform: uppercase;">
                ${loc.category === 'off-street' ? 'Parkir Jalan' : 'Gedung Parkir'}
              </span>
              <span style="font-size: 9px; font-weight: 800; color: #16a34a;">${loc.availableCount} Slot Free</span>
            </div>
            <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 2px;">${loc.name}</strong>
            <span style="color: #64748b; font-size: 10px; display: block; margin-bottom: 6px;">📍 ${loc.region}, Surabaya</span>
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 6px; margin-bottom: 8px;">
              <span style="color: #4f46e5; font-weight: 900; font-size: 12px;">Rp ${loc.ratePerHour.toLocaleString('id-ID')} / jam</span>
            </div>
            
            <button onclick="window.onSelectLocationFromMap?.('${loc.id}')" style="width: 100%; height: 30px; background-color: #4f46e5; color: #ffffff; border: none; font-size: 11px; font-weight: 800; border-radius: 8px; cursor: pointer; text-align: center;">
              Lihat Slot & Pesan
            </button>
          </div>
        `;

        L.marker([loc.latitude, loc.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);

        // Render Real-time Slot Boxes directly along street / parking bay (matching the user's reference image)
        if (loc.slots && loc.slots.length > 0) {
          loc.slots.slice(0, 6).forEach((slot, sIdx) => {
            const slotLat = slot.lat || (loc.latitude + (sIdx - 2.5) * 0.00012);
            const slotLng = slot.lng || (loc.longitude + (sIdx - 2.5) * 0.00015);

            let boxBg = '#84cc16'; // default lime green for empty
            let boxBorder = '#65a30d';
            let textColor = '#14532d';
            let labelText = slot.slotLabel || 'empty';

            if (slot.status === 'Occupied' || slot.status === 'Booked') {
              boxBg = '#ea580c'; // orange/red for booked
              boxBorder = '#c2410c';
              textColor = '#ffffff';
              labelText = 'booked';
            } else if (slot.status === 'Maintenance') {
              boxBg = '#ffffff';
              boxBorder = '#f97316';
              textColor = '#c2410c';
              labelText = 'mainte-nance';
            } else if (slot.status === 'IllegalBlock' || slot.type === 'Illegal') {
              boxBg = '#ffffff';
              boxBorder = '#ea580c';
              textColor = '#9a3412';
              labelText = 'ILEGAL bloc empty';
            } else {
              boxBg = '#84cc16';
              boxBorder = '#ea580c'; // orange border with lime fill as in image
              textColor = '#0f172a';
              labelText = 'empty';
            }

            const slotHtml = `
              <div onclick="window.onSelectSlotFromLeaflet?.('${loc.id}', '${slot.slotID}')" style="background-color: ${boxBg}; border: 2px solid ${boxBorder}; width: 34px; height: 50px; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.25); cursor: pointer; transform: rotate(-8deg); transition: transform 0.2s;" title="Slot ${slot.slotID} - ${slot.status}">
                <span style="font-size: 6.5px; font-weight: 900; line-height: 1; color: ${textColor}; padding: 1px; text-transform: lowercase;">${labelText}</span>
                <span style="font-size: 5.5px; font-weight: 800; color: ${textColor}; opacity: 0.8; margin-top: 1px;">${slot.slotID}</span>
              </div>
            `;

            const slotIcon = L.divIcon({
              html: slotHtml,
              className: 'custom-slot-box',
              iconSize: [34, 50],
              iconAnchor: [17, 25]
            });

            L.marker([slotLat, slotLng], { icon: slotIcon }).addTo(map);
          });
        }
      });

      // Fit bounds
      if (filteredLocations.length > 0) {
        const coords = filteredLocations.map(l => [l.latitude, l.longitude]);
        try {
          map.fitBounds(coords, { padding: [40, 40], maxZoom: 17 });
        } catch (e) {
          console.warn('Map bounds fit error:', e);
        }
      }
    }
  }, [activeTab, searchQuery, selectedCategory, selectedVehicleType, onlyAvailable, filteredLocations.length]);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      const savedProfile = await getUserProfile();
      if (!cancelled) {
        if (savedProfile) {
          setProfile(savedProfile);
        } else {
          await putUserProfile(createDefaultProfile());
        }
      }
    };
    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = async () => {
    const nextProfile = { ...profile };
    await putUserProfile(nextProfile);
    setProfile(nextProfile);
    setIsEditingProfile(false);
    triggerToast('Profil warga berhasil diperbarui.', 'success');
  };

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMsg('');
    }, 4500);
  };

  // Scan Gate Camera Engine with proper mobile/desktop video stream
  const handleScanGateClick = async () => {
    setGateCameraModalOpen(true);
    setScanGateSuccess(false);
    setGateCameraError(false);
    setIsGateStreaming(false);

    setTimeout(async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } }
          });
          gateMediaStreamRef.current = stream;
          if (gateVideoRef.current) {
            gateVideoRef.current.srcObject = stream;
            gateVideoRef.current.setAttribute('playsinline', 'true');
            await gateVideoRef.current.play();
            setIsGateStreaming(true);
          }
        } else {
          throw new Error('getUserMedia not supported.');
        }
      } catch (err) {
        console.warn('Camera stream error:', err);
        setGateCameraError(true);
      }
    }, 200);
  };

  const stopGateCamera = () => {
    if (gateMediaStreamRef.current) {
      gateMediaStreamRef.current.getTracks().forEach(track => track.stop());
      gateMediaStreamRef.current = null;
    }
    setIsGateStreaming(false);
    setGateCameraModalOpen(false);
  };

  const handleSimulatedGateScanOk = () => {
    setScanGateSuccess(true);
    triggerToast('✅ QR Gate Parkir Berhasil Dipindai! Palang pintu gerbang otomatis terbuka.', 'success');
    
    activeBookings.forEach((b: Booking) => {
      if (b.status === 'Active') {
        onCheckInBooking(b.bookingID);
      }
    });

    setTimeout(() => {
      stopGateCamera();
    }, 1800);
  };

  const handleConfirmTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(customTopUpVal, 10);
    if (!amountVal || amountVal <= 0) {
      triggerToast('Masukkan nominal isi saldo yang valid.', 'error');
      return;
    }

    setIsTopUpProcessing(true);
    setTimeout(() => {
      setIsTopUpProcessing(false);
      setTopUpModalOpen(false);
      onTopUp(amountVal);
      triggerToast(`Saldo e-wallet berhasil diisi Rp ${amountVal.toLocaleString('id-ID')} via QRIS!`, 'success');
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-[100dvh] md:h-[850px] max-w-md mx-auto bg-slate-50 md:shadow-2xl md:rounded-3xl overflow-hidden pb-16 select-none border border-slate-100">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-3 left-4 right-4 z-50 animate-fade-in">
          <div className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-between gap-2 shadow-xl ${
            toastType === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : toastType === 'error' 
                ? 'bg-rose-50 text-rose-900 border-rose-200' 
                : 'bg-indigo-50 text-indigo-900 border-indigo-200'
          }`}>
            <div className="flex items-center gap-2">
              {toastType === 'success' ? <CheckCircle size={16} className="text-emerald-600 shrink-0" /> : <AlertTriangle size={16} className="text-rose-500 shrink-0" />}
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg('')} className="text-slate-400 hover:text-slate-600 font-bold px-1 text-xs cursor-pointer">✕</button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="relative pt-10 pb-4 px-4 bg-gradient-to-b from-indigo-50 via-slate-50/80 to-slate-50 border-b border-slate-100 shadow-sm shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-500/20">
              P
            </div>
            <div>
              <span className="font-black text-slate-900 tracking-tight text-base block leading-tight">Parkir SBY</span>
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Smart Mobility</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onLogout}
              className="text-[11px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Keluar
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden border border-indigo-200">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src={profile.profilePhotoUrl} 
              />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/60 p-1 flex items-center gap-2 mb-3">
          <Search className="text-slate-400 pl-3 shrink-0" size={28} />
          <input 
            type="text" 
            placeholder="Cari jalan / gedung parkir di Surabaya..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'search') setActiveTab('search');
            }}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 font-semibold text-xs py-2.5"
          />
          <button 
            type="button" 
            onClick={() => setFilterActive(!filterActive)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              filterActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Filter Pencarian"
          >
            <Sliders size={16} />
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {filterActive && (
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-lg mb-3 space-y-2.5 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 text-[11px] uppercase tracking-wider">Filter Lokasi & Slot</span>
              <button 
                onClick={() => { setSelectedCategory('all'); setSelectedVehicleType('all'); setOnlyAvailable(false); }}
                className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Tipe Parkir:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'all' as const, label: 'Semua' },
                  { id: 'off-street' as const, label: 'Pinggir Jalan' },
                  { id: 'in-street' as const, label: 'Gedung / Mall' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      selectedCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Jenis Kendaraan:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'all' as const, label: 'Semua' },
                  { id: 'car' as const, label: 'Mobil 🚗' },
                  { id: 'motorcycle' as const, label: 'Motor 🛵' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleType(v.id)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      selectedVehicleType === v.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Only Available toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-slate-100">
              <input 
                type="checkbox" 
                checked={onlyAvailable} 
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-[11px] font-bold text-slate-700">Hanya tampilkan lokasi yang memiliki slot kosong</span>
            </label>
          </div>
        )}

        {/* Quick Action Bento Grid */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={handleScanGateClick}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer relative group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
              <Scan size={16} />
            </div>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight text-center">Scan Gate</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowGateInfoModal(true); }}
              className="absolute top-1 right-1 text-slate-300 hover:text-indigo-600"
              title="Info Scan Gate"
            >
              <Info size={11} />
            </button>
          </button>

          <button 
            onClick={onOpenVerifyJukir}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
              <Shield size={16} />
            </div>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight text-center">Cek Jukir</span>
          </button>

          <button 
            onClick={onOpenLaporPungli}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 shadow-sm border border-red-100 flex flex-col items-center justify-center gap-1 hover:bg-red-50 transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
              <Flag size={16} />
            </div>
            <span className="text-[9px] font-black text-rose-700 uppercase tracking-tight text-center">Lapor Pungli</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Body */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        
        {/* Tab 1: HOME */}
        {activeTab === 'home' && (
          <>
            {/* Active Booking Banner */}
            {activeBookings.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-3xl p-4 shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                      Tiket Aktif ({activeBookings[0].estimatedArrival})
                    </span>
                    <h3 className="text-sm font-extrabold mt-1">{activeBookings[0].locationName}</h3>
                    <p className="text-[11px] text-indigo-100">Slot ID: <strong className="text-white">{activeBookings[0].slotID}</strong> • Batas: {activeBookings[0].batasTiba}</p>
                  </div>
                  <button
                    onClick={() => onCheckInBooking(activeBookings[0].bookingID)}
                    className="bg-white text-indigo-700 text-xs font-black px-3.5 py-2 rounded-xl shadow active:scale-95 transition-all cursor-pointer"
                  >
                    Buka Tiket
                  </button>
                </div>
              </div>
            )}

            {/* Quick Map Teaser Banner */}
            <div 
              onClick={() => setActiveTab('search')}
              className="bg-white border border-slate-200/80 rounded-3xl p-3.5 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Compass size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Cari Slot Parkir Real-Time di Peta</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Lihat slot hijau (kosong) & merah (terisi) langsung</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-indigo-600 group-hover:translate-x-1 transition-transform mr-1" />
            </div>

            {/* Parking Locations List */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Titik Parkir Surabaya ({filteredLocations.length})</h3>
                <button onClick={() => setActiveTab('search')} className="text-[10px] font-bold text-indigo-600 hover:underline">
                  Buka di Peta
                </button>
              </div>

              <div className="space-y-3">
                {filteredLocations.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => onSelectLocation(loc)}
                    className="bg-white rounded-3xl border border-slate-200/70 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-3 group"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 relative shrink-0">
                      <img 
                        src={loc.imageUrl} 
                        alt={loc.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <span className={`absolute top-1.5 left-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-md text-white ${
                        loc.category === 'off-street' ? 'bg-amber-600' : 'bg-indigo-600'
                      }`}>
                        {loc.category === 'off-street' ? 'Street' : 'Gedung'}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400">📍 {loc.region}</span>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {loc.availableCount} Slot Free
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 leading-snug mt-0.5 line-clamp-1">{loc.name}</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Jukir: <strong>{loc.assignedJukirName || 'Petugas Dishub'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 mt-1">
                        <span className="text-xs font-black text-indigo-600">Rp {loc.ratePerHour.toLocaleString('id-ID')} / jam</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          Pilih Slot →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modern Improvised Homepage Footer */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-4 mt-6 border border-indigo-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-indigo-600 rounded-xl text-white font-black text-xs">SBY</span>
                  <span className="font-extrabold text-sm tracking-tight">Surabaya Smart Mobility 2026</span>
                </div>
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live 24/7
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Mewujudkan ekosistem parkir Kota Pahlawan yang tertib, 100% transparan, bebas kemacetan dan pungutan liar melalui reservasi digital & pembayaran QRIS terpadu.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1 text-center">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                  <p className="text-base font-black text-indigo-300">100% Non-Tunai</p>
                  <p className="text-[9px] text-slate-400 font-medium">QRIS Resmi Kas Daerah</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                  <p className="text-base font-black text-emerald-300">Zero Pungli</p>
                  <p className="text-[9px] text-slate-400 font-medium">KTA Digital Terverifikasi</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>Dinas Perhubungan Surabaya</span>
                <a href="tel:112" className="text-indigo-300 font-bold flex items-center gap-1 hover:text-white">
                  <PhoneCall size={11} /> Call Center 112
                </a>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: MAP REAL-TIME SLOTS (Visual boxes matching user's image) */}
        {activeTab === 'search' && (
          <div className="flex flex-col h-full space-y-2">
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Compass size={14} className="text-indigo-600" /> Peta Slot Real-Time Surabaya
                </h3>
                <p className="text-[10px] text-slate-400">Klik kotak slot untuk memesan langsung</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 text-[9px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-lime-500 border border-orange-500" /> Kosong</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-600" /> Terisi</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded border border-orange-600" /> Ilegal</span>
              </div>
            </div>

            {/* Leaflet Container */}
            <div 
              ref={mapContainerRef} 
              className="w-full flex-1 min-h-[420px] rounded-3xl overflow-hidden border border-slate-200 shadow-md relative z-10"
            />
          </div>
        )}

        {/* Tab 3: BOOKINGS / HISTORY */}
        {activeTab === 'booking' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Tiket & Riwayat Transaksi</h3>

            {activeBookings.length > 0 ? (
              <div className="space-y-3">
                {activeBookings.map((b) => (
                  <div key={b.bookingID} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {b.status}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 mt-1">{b.locationName}</h4>
                        <p className="text-xs text-slate-500">Slot <strong>{b.slotID}</strong> • Batas: {b.batasTiba}</p>
                      </div>
                      <span className="text-xs font-black text-indigo-600">Rp {b.totalAmount.toLocaleString('id-ID')}</span>
                    </div>

                    <button
                      onClick={() => onCheckInBooking(b.bookingID)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <Receipt size={14} /> Buka E-Tiket Digital
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-slate-400">
                <Receipt size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-600">Tidak ada reservasi aktif</p>
                <p className="text-[10px] mt-1">Pilih lokasi dan pesan slot parkir sekarang.</p>
              </div>
            )}

            {/* Past transactions */}
            {userTransactions.length > 0 && (
              <div className="pt-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Riwayat Pembayaran & Refund</h4>
                <div className="space-y-2">
                  {userTransactions.map((tx) => (
                    <div key={tx.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-slate-800">{tx.location}</p>
                        <p className="text-[10px] text-slate-400">{tx.createdAt}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black ${tx.type === 'Refund' ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {tx.type === 'Refund' ? '+' : ''}Rp {tx.amount.toLocaleString('id-ID')}
                        </p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${tx.type === 'Refund' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {tx.type || 'QRIS'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-indigo-500 shadow-md">
                <img src={profile.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-base font-black text-slate-900">{profile.fullName}</h3>
              <p className="text-xs font-mono text-indigo-600 font-bold">{profile.vehiclePlate}</p>
              <p className="text-[10px] text-slate-400 mt-1">{profile.email} • {profile.phone}</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Edit Data Pengendara</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400">Nama Lengkap</label>
                  <input 
                    value={profile.fullName} 
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">Nomor Plat Kendaraan Utama</label>
                  <input 
                    value={profile.vehiclePlate} 
                    onChange={(e) => setProfile({ ...profile, vehiclePlate: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">Nomor Telepon / WhatsApp</label>
                  <input 
                    value={profile.phone} 
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
              <button 
                onClick={saveProfile}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow cursor-pointer active:scale-95"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation Bar for User */}
      <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-16 z-30 shadow-lg">
        {[
          { id: 'home' as const, label: 'Beranda', icon: MapPin },
          { id: 'search' as const, label: 'Peta Slot', icon: Compass },
          { id: 'booking' as const, label: 'Tiket Saya', icon: CalendarCheck },
          { id: 'profile' as const, label: 'Profil', icon: UserIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center py-1 px-3 transition-colors cursor-pointer ${
              activeTab === id ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon size={19} />
            <span className="text-[10px] font-black mt-0.5">{label}</span>
          </button>
        ))}
      </nav>

      {/* Scan Gate Explanation Modal */}
      {showGateInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Scan size={28} />
            </div>
            <h3 className="text-sm font-black text-slate-900">Apa itu Fitur Scan Gate?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium text-left">
              <strong>Scan Gate</strong> digunakan oleh pengendara untuk memindai kode QR pada tiang palang pintu masuk / keluar gedung parkir otomatis di Surabaya.
            </p>
            <ul className="text-[11px] text-slate-600 text-left mt-2 space-y-1 list-disc pl-4 font-medium">
              <li>Membuka barrier palang pintu tanpa perlu karcis fisik.</li>
              <li>Otomatis memvalidasi reservasi aktif Anda.</li>
              <li>Mencegah antrian panjang di gerbang masuk.</li>
            </ul>
            <button 
              onClick={() => setShowGateInfoModal(false)}
              className="mt-4 w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Live Scan Gate Camera Overlay */}
      {gateCameraModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Scan size={16} className="text-indigo-400" />
              Scan QR Barrier Gate Masuk / Keluar
            </span>
            <button onClick={stopGateCamera} className="text-white p-2 rounded-full hover:bg-white/10 cursor-pointer">
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 rounded-3xl overflow-hidden bg-black relative mb-4 flex items-center justify-center border-2 border-indigo-500/50 shadow-2xl">
            <video
              ref={gateVideoRef}
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
                <div className="w-full h-0.5 bg-emerald-400/90 animate-bounce mt-28"></div>
              </div>
            </div>

            {gateCameraError && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle size={36} className="text-amber-400 mb-2" />
                <p className="text-xs text-slate-200 font-bold mb-4">Izin kamera diblokir browser. Gunakan simulasi scan di bawah.</p>
                <button
                  onClick={handleSimulatedGateScanOk}
                  className="bg-indigo-600 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg"
                >
                  Simulasi Buka Gate Otomatis
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSimulatedGateScanOk}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase shadow-xl cursor-pointer active:scale-95 transition-all"
          >
            <CheckCircle size={18} />
            <span>Simulasi Pindai QR Gate Berhasil (Buka Palang)</span>
          </button>
        </div>
      )}

    </div>
  );
}
