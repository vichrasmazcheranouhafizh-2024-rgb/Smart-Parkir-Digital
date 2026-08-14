import React, { useState, useRef, useEffect } from 'react';
import { Search, Sliders, Scan, History, MapPin, Compass, CalendarCheck, User as UserIcon, Plus, X, AlertTriangle, Loader2, Camera, Check, Wallet, CheckCircle, Save, ImagePlus, Shield, Receipt, Flag } from 'lucide-react';
import { ParkingLocation, Booking, UserProfile, UserTransactionRecord, createDefaultProfile } from '../../types';
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

  // Interactive added features states
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  
  // Custom camera scanner mechanics
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Custom wallet top-up mechanics
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [customTopUpVal, setCustomTopUpVal] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'bca_va' | 'gopay'>('qris');
  const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);

  // Profile editor state
  const [profile, setProfile] = useState<UserProfile>(createDefaultProfile());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Category filter state
  // off-street = parkir pinggir jalan raya
  // in-street = parkir di dalam gedung / mall
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'off-street' | 'in-street'>('all');

  // Map elements references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || loc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Map global bridge for selection callback
  useEffect(() => {
    (window as any).onSelectLocationFromMap = (locId: string) => {
      const found = locations.find(l => l.id === locId);
      if (found) {
        onSelectLocation(found);
      }
    };
    return () => {
      delete (window as any).onSelectLocationFromMap;
    };
  }, [locations, onSelectLocation]);

  // Leaflet map setup effect when on Search tab
  useEffect(() => {
    if (activeTab === 'search' && mapContainerRef.current) {
      const L = (window as any).L;
      if (!L) {
        console.warn('Leaflet global "L" is not loaded yet');
        return;
      }

      // If map instance is already active, dismantle it cleanly first
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error(e);
        }
        mapRef.current = null;
      }

      // Center around middle of Surabaya
      const map = L.map(mapContainerRef.current, {
        center: [-7.2616, 112.7397],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });
      mapRef.current = map;

      // Add Voyager light maps tile style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      // Add zoom control at bottom-right of viewport to maintain clean aesthetic
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Display custom styled markers on the map canvas
      filteredLocations.forEach(loc => {
        const markerColor = loc.category === 'off-street' ? '#f59e0b' : '#3b82f6'; // Yellow/Amber vs Blue
        const markerLabel = loc.category === 'off-street' ? 'ROAD' : 'MALL';

        const markerHtml = `
          <div style="position: relative; display: inline-block;">
            <div style="background-color: ${markerColor}; border: 2.5px solid #ffffff; width: 34px; height: 34px; border-radius: 50%; color: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.25); font-family: system-ui, sans-serif;">
              <span style="font-size: 8px; font-weight: 900; line-height: 1; letter-spacing: -0.2px;">P</span>
              <span style="font-size: 7px; font-weight: 700; line-height: 1; transform: scale(0.95);">${markerLabel}</span>
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

        const categoryBadge = loc.category === 'off-street' ? 'Off-Street (Pinggir Jalan)' : 'In-Street (Gedung/Mall)';
        
        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 3px; min-width: 170px; line-height: 1.4;">
            <span style="display: block; font-size: 8px; font-weight: 950; background-color: ${markerColor}20; color: ${markerColor}; border-radius: 4px; padding: 2px 5px; width: fit-content; text-transform: uppercase; margin-bottom: 5px;">
              ${categoryBadge}
            </span>
            <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 2px;">${loc.name}</strong>
            <span style="color: #64748b; font-size: 10px; display: block; margin-bottom: 6px;">📍 ${loc.region}, Surabaya</span>
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 5px; margin-bottom: 8px;">
              <span style="color: #4f46e5; font-weight: 850; font-size: 12px;">Rp ${loc.ratePerHour.toLocaleString('id-ID')} / jam</span>
              <span style="background-color: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-weight: 800; font-size: 9.5px; color: #475569;">${loc.availableCount} Slot free</span>
            </div>
            
            <button onclick="window.onSelectLocationFromMap?.('${loc.id}')" style="width: 100%; height: 28px; background-color: #4f46e5; color: #ffffff; border: none; font-size: 10.5px; font-weight: 800; border-radius: 8px; cursor: pointer; text-align: center; line-height: 1.2;">
              Pilih & Pesan Slot
            </button>
          </div>
        `;

        L.marker([loc.latitude, loc.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
      });

      // Fit map viewport range to show all match pins if available
      if (filteredLocations.length > 0) {
        const coords = filteredLocations.map(loc => [loc.latitude, loc.longitude]);
        try {
          map.fitBounds(coords, { padding: [30, 30] });
        } catch (e) {
          console.warn('Map boundary fit failure: ', e);
        }
      }
    }
  }, [activeTab, searchQuery, selectedCategory, filteredLocations.length]);

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

    const syncResult = await syncProfileToSupabase(nextProfile);
    const successMessage = syncResult.ok ? syncResult.message : `Profil tersimpan di lokal. ${syncResult.message}`;

    setProfileMessage(successMessage);
    setIsEditingProfile(false);
    triggerToast(syncResult.ok ? 'Profil Anda berhasil diperbarui.' : 'Profil disimpan di lokal, sinkronisasi cloud belum tersedia.', syncResult.ok ? 'success' : 'info');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const photoUrl = typeof reader.result === 'string' ? reader.result : profile.profilePhotoUrl;
      const nextProfile = { ...profile, profilePhotoUrl: photoUrl };
      setProfile(nextProfile);
      await putUserProfile(nextProfile);

      const syncResult = await syncProfileToSupabase(nextProfile);
      const successMessage = syncResult.ok ? syncResult.message : `Foto profil tersimpan di lokal. ${syncResult.message}`;

      setProfileMessage(successMessage);
      triggerToast(syncResult.ok ? 'Foto profil berhasil diperbarui.' : 'Foto profil disimpan di lokal, sinkronisasi cloud belum tersedia.', syncResult.ok ? 'success' : 'info');
    };
    reader.readAsDataURL(file);
  };

  // Trigger Toast Notification safely
  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMsg('');
    }, 4500);
  };

  // 1. Scan & Park Camera Request Engine
  const handleScanAndParkClick = async () => {
    setCameraModalOpen(true);
    setScanSuccess(false);
    setCameraError(false);
    setIsStreaming(false);

    // Give browser brief time to mount overlay, then request raw media context
    setTimeout(async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setIsStreaming(true);
          }
        } else {
          throw new Error("getUserMedia not supported.");
        }
      } catch (err) {
        console.warn("Camera media access blocked, switching to simulation camera: ", err);
        setCameraError(true);
      }
    }, 200);
  };

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsStreaming(false);
    setCameraModalOpen(false);
  };

  // Trigger Mock Success check-in or booking validation
  const handleSimulatedScanOk = () => {
    setScanSuccess(true);
    triggerToast("QR Gate Parkir Berhasil Dipindai! Tiket aktif Anda sekarang berstatus 'Sudah Tiba' dan Pintu gate masuk otomatis dibuka.", "success");
    
    // Check in all Active bookings
    activeBookings.forEach((b: Booking) => {
      if (b.status === 'Active') {
        onCheckInBooking(b.bookingID);
      }
    });

    setTimeout(() => {
      stopCameraStream();
    }, 2000);
  };

  // 2. History menu navigation router check
  const handleHistoryMenuClick = () => {
    setActiveTab('booking');
    if (activeBookings.length === 0) {
      triggerToast("Anda belum memiliki reservasi aktif", "error");
    } else {
      triggerToast("Menampilkan daftar reservasi aktif Anda.", "success");
    }
  };

  // 3. Wallet top-up modal popup
  const handleWalletClick = () => {
    setTopUpModalOpen(true);
    setCustomTopUpVal('');
    setIsTopUpProcessing(false);
  };

  const handleQuickAmountSelect = (amount: number) => {
    setCustomTopUpVal(amount.toString());
  };

  const handleConfirmTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(customTopUpVal, 10);
    if (!amountVal || amountVal <= 0) {
      triggerToast("Silakan masukkan nominal pengisian saldo yang valid.", "error");
      return;
    }

    setIsTopUpProcessing(true);
    setTimeout(() => {
      setIsTopUpProcessing(false);
      setTopUpModalOpen(false);
      onTopUp(amountVal); // fires App.tsx wallet state increment
      triggerToast(`Saldo e-wallet berhasil diisi sebesar Rp ${amountVal.toLocaleString('id-ID')}!`, "success");
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-[100dvh] md:h-[850px] max-w-md mx-auto bg-slate-50 md:shadow-2xl md:rounded-3xl overflow-hidden pb-16">
      
      {/* Search Header Wrapper with City Map Background Overlay */}
      <div className="relative pt-12 pb-6 px-4 bg-gradient-to-b from-indigo-50 to-slate-50/50 border-b border-slate-100 shadow-sm">
        
        {/* Floating Custom Toast notifications inside the app viewport */}
        {toastMsg && (
          <div className="absolute top-2 left-4 right-4 z-50 animate-fade-in">
            <div className={`p-3.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-2 shadow-lg ${
              toastType === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                : toastType === 'error' 
                  ? 'bg-rose-50 text-rose-800 border-rose-100' 
                  : 'bg-indigo-50 text-indigo-800 border-indigo-100'
            }`}>
              <div className="flex items-center gap-1.5">
                {toastType === 'success' ? <CheckCircle size={15} className="text-emerald-500 shrink-0" /> : <AlertTriangle size={15} className="shrink-0" />}
                <span className="capitalize">{toastMsg}</span>
              </div>
              <button onClick={() => setToastMsg('')} className="text-slate-400 hover:text-slate-600 font-bold px-1 text-xs">✕</button>
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <span className="p-1 px-2.5 bg-indigo-600 rounded-xl text-white text-lg font-black font-sans leading-none">P</span>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">ParkWise</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onLogout}
              className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold px-2.5 py-1.5 rounded-xl transition-all"
            >
              Logout
            </button>
            <div className="w-9 h-9 rounded-full bg-indigo-100 overflow-hidden border border-slate-200">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGPAlcBSpjzcMKi7wUNMp1YYPSpgsHB-17kv78E72Vy4oSmHYQ-nXcW_p8k13GTB9HCnyjbgYTOtIK2gFLa4G5y7_Shmxm85qHSlkEESeDo2V3nAJNUbmYMg7yvyYU2Tb1LEiDs5tBwGikV6GkAbOUw9zDGIJHHwBBROPdvLKe2grtrULpgNM0NYqbeXa-94xki6-Whvqml4JAzjssKdyOSKUuUKI3OSZ-SU6l61ZeYcb2417fJw7ogwnB81jf0syyyaFzwIpcX6hV" 
              />
            </div>
          </div>
        </div>

        {/* Floating Search Input */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200/50 p-1 flex items-center gap-2 mb-4">
          <Search className="text-slate-400 pl-2.5" size={32} />
          <input 
            type="text" 
            placeholder="Cari lokasi parkir di Surabaya..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'search') setActiveTab('search');
            }}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 font-medium text-sm py-2 animate-fade-in"
          />
          <button 
            type="button" 
            onClick={() => setFilterActive(!filterActive)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              filterActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Sliders size={16} />
          </button>
        </div>

        {/* Quick Actions Bento Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button 
            onClick={handleScanAndParkClick}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-slate-200/40 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-all active:scale-95 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Scan size={16} />
            </div>
            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tight text-center">Scan Gate</span>
          </button>

          <button 
            onClick={onOpenVerifyJukir}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-slate-200/40 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Shield size={16} />
            </div>
            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tight text-center">Cek Jukir</span>
          </button>

          <button 
            onClick={onOpenLaporPungli}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-red-200/40 flex flex-col items-center justify-center gap-1 hover:bg-red-50 transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Flag size={16} />
            </div>
            <span className="text-[9px] font-bold text-red-700 uppercase tracking-tight text-center">Lapor Pungli</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleHistoryMenuClick}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-slate-200/40 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <History size={16} />
            </div>
            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tight">Reservasi</span>
          </button>

          <div 
            onClick={handleWalletClick}
            className="bg-indigo-600 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-2.5 shadow-md flex flex-col items-start justify-center gap-0.5 cursor-pointer hover:from-indigo-700 transition-all active:scale-95"
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-100">Wallet</span>
              <Plus size={10} className="text-indigo-100" />
            </div>
            <span className="text-[10px] font-black tracking-tight">Rp {walletBalance.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Main Dynamic View Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <>
            {/* Active Bookings Banner Carousel if any match */}
            {activeBookings.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-50/50 to-slate-100/50 border border-indigo-150 rounded-2xl p-4 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-indigo-900">
                    <CalendarCheck size={16} className="animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Booking Aktif Terkonfirmasi</span>
                  </div>
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">BK-2026</span>
                </div>
                {activeBookings.map((b, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{b.locationName}</p>
                      <p className="text-xs font-medium text-slate-500">Slot: {b.slotID} • Tiba sblm: <span className="text-red-500 font-bold">{b.batasTiba}</span></p>
                    </div>
                    <button 
                      onClick={onShowHistory}
                      className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      Lihat Tiket
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Nearby Parking Section Layout */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-extrabold text-slate-800 leading-none">Terdekat di Sekitar Anda</h3>
                <button 
                  onClick={() => setActiveTab('search')}
                  className="text-xs font-extrabold text-indigo-600 flex items-center hover:text-indigo-700 transition-colors"
                >
                  Lihat Semua
                </button>
              </div>

              {/* Horizontal Scroll Parking Cards */}
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none snap-x snap-mandatory">
                {locations.map((loc) => (
                  <div 
                    key={loc.id}
                    onClick={() => onSelectLocation(loc)}
                    className="flex-none w-[280px] bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer snap-start relative overflow-hidden"
                  >
                    {/* Badge Overlay */}
                    {loc.fastFill && (
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white px-2.5 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 z-10 animate-pulse">
                        ✦ FAST FILL
                      </div>
                    )}
                    
                    <div className="flex gap-3 mb-4 mt-1">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        <img 
                          alt={loc.name} 
                          className="w-full h-full object-cover transition-transform hover:scale-110 duration-300" 
                          src={loc.imageUrl} 
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1 leading-snug">{loc.name}</h4>
                        <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center">
                          <MapPin size={11} className="mr-0.5 text-slate-400" /> {loc.distance}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status Lokasi</span>
                        {loc.availableCount > 15 ? (
                          <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {loc.availableCount} Slot Tersedia
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {loc.availableCount} Sisa Sedikit
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right leading-none mb-0.5">
                        <span className="text-sm font-black text-indigo-600">Rp {loc.ratePerHour / 1000}k <span className="text-slate-400 font-medium text-xs">/jam</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/50">
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest inline-block mb-1.5">Maju Bersama Kota Surabaya</span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Pemerintah Kota Surabaya mengimbau penggunaan sistem **ParkWise** cashless untuk kelancaran arus lalu lintas dan transparansi perparkiran kota.
              </p>
            </div>
          </>
        )}

        {/* TAB 2: SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            
            {/* Header pencarian & Kategori Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Kategori Parkir Surabaya
                </h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest leading-none">Surabaya Maps</span>
              </div>
              
              {/* Category selector */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/40 shadow-sm">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all text-center leading-none ${
                    selectedCategory === 'all'
                      ? 'bg-white text-indigo-600 shadow-sm font-black ring-1 ring-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('off-street')}
                  className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex flex-col items-center justify-center leading-none ${
                    selectedCategory === 'off-street'
                      ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-400'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="font-extrabold">Off-Street</span>
                  <span className="text-[7.5px] font-semibold opacity-90 mt-0.5">Sisi Jalan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('in-street')}
                  className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex flex-col items-center justify-center leading-none ${
                    selectedCategory === 'in-street'
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="font-extrabold">In-Street</span>
                  <span className="text-[7.5px] font-semibold opacity-90 mt-0.5 font-sans">Gedung / Mall</span>
                </button>
              </div>
            </div>

            {/* MAP CONTAINER FOR LEAFLET API */}
            <div className="space-y-1.5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white bg-slate-100 shadow-md h-[240px] w-full z-10">
                <div ref={mapContainerRef} className="w-full h-full" id="leaflet-map-canvas" />
                <div className="absolute bottom-2 left-2 z-20 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm pointer-events-none text-[8.5px] font-black text-slate-500 uppercase tracking-wider leading-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                  <span>Tekan pin map untuk pesan</span>
                </div>
              </div>
            </div>

            {/* List of locations conforming to selections */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Daftar Lokasi Terdekat ({filteredLocations.length})
              </h4>
              
              {filteredLocations.length > 0 ? (
                <div className="space-y-3">
                  {filteredLocations.map(loc => (
                    <div 
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3 relative overflow-hidden"
                    >
                      {/* Category Pill Tag Overlay inside Card */}
                      <span className={`absolute top-0 right-0 text-[8px] font-bold px-2 py-0.5 rounded-bl-xl ${
                        loc.category === 'off-street' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {loc.category === 'off-street' ? 'OFF-STREET' : 'IN-STREET'}
                      </span>

                      <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                        <img alt={loc.name} className="w-full h-full object-cover" src={loc.imageUrl} />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between pt-1">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800 leading-snug line-clamp-1 pr-14">{loc.name}</h4>
                          <p className="text-[10px] font-semibold text-slate-400 flex items-center mt-0.5">
                            <MapPin size={10} className="mr-0.5 text-slate-400" /> {loc.region}, Surabaya • {loc.distance}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-black text-indigo-600">Rp {loc.ratePerHour.toLocaleString('id-ID')}/jam</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                            loc.availableCount > 15 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {loc.availableCount} slot kosong
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-white border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-400">Tidak ada lokasi pencarian yang cocok.</p>
                  <button 
                    type="button"
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                    className="mt-2 text-xs font-extrabold text-indigo-600 hover:underline"
                  >
                    Reset semua filter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS + TRANSACTION HISTORY */}
        {activeTab === 'booking' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">Daftar Reservasi Parkir</h3>
              {activeBookings.length > 0 ? (
                <div className="space-y-3">
                  {activeBookings.map((b, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative">
                      <span className={`absolute top-4 right-4 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        b.status === 'CheckedIn' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-150 animate-pulse' 
                          : 'bg-amber-50 text-amber-750 border border-amber-150'
                      }`}>
                        {b.status === 'Active' ? 'Belum Tiba' : b.status === 'CheckedIn' ? 'Sudah Tiba' : b.status}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-800 pr-16">{b.locationName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 mb-3">{b.locationRegion}</p>
                      <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100 text-center mb-3">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Lantai</p>
                          <p className="text-xs font-bold text-slate-800">{b.floor}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Slot ID</p>
                          <p className="text-xs font-bold text-indigo-600">{b.slotID}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Bayar</p>
                          <p className="text-xs font-bold text-slate-800">{b.paymentMethod}</p>
                        </div>
                      </div>
                      <button 
                        onClick={onShowHistory}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs py-2 rounded-xl border border-indigo-200 transition-colors"
                      >
                        Buka E-Tiket Digital (QR)
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 bg-white rounded-2xl border border-slate-200 text-center px-6 mb-4">
                  <CalendarCheck className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-sm font-bold text-slate-700">Belum ada booking aktif</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Receipt size={16} className="text-indigo-600" /> Riwayat Transaksi Pribadi
              </h3>
              {userTransactions.length > 0 ? (
                <div className="space-y-2">
                  {userTransactions.map((tx) => (
                    <div key={tx.id} className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-slate-800">{tx.location}</p>
                        <p className="text-[10px] text-slate-400">{tx.plateNumber} • {tx.paymentMethod}</p>
                        <p className="text-[9px] text-slate-400">{new Date(tx.createdAt).toLocaleString('id-ID')}</p>
                      </div>
                      <p className="text-sm font-black text-indigo-600">Rp {tx.amount.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 bg-white rounded-2xl border border-slate-200 text-center">
                  <p className="text-xs text-slate-400 font-semibold">Belum ada riwayat transaksi parkir</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-300">
                <img 
                  alt="User Profile" 
                  className="w-full h-full object-cover" 
                  src={profile.profilePhotoUrl}
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-extrabold text-slate-800">{profile.fullName}</h4>
                <p className="text-xs text-slate-400">{profile.email}</p>
                <p className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1.5 inline-block">Surabaya Smart Member</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600"
                aria-label="Upload foto"
              >
                <ImagePlus size={16} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            {profileMessage ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700">
                {profileMessage}
              </div>
            ) : null}

            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700"
              >
                Edit Profil
              </button>
            ) : (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Username
                    <input
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Nama Lengkap
                    <input
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Email
                    <input
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Nomor HP
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Plat Kendaraan
                    <input
                      value={profile.vehiclePlate}
                      onChange={(e) => setProfile({ ...profile, vehiclePlate: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Password
                    <input
                      type="password"
                      value={profile.password}
                      onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 md:col-span-2">
                    Alamat
                    <input
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    />
                  </label>
                </div>
                <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                  <span>Notifikasi Aktif</span>
                  <input
                    type="checkbox"
                    checked={profile.notificationEnabled}
                    onChange={(e) => setProfile({ ...profile, notificationEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </label>
                <div className="flex gap-2">
                  <button onClick={saveProfile} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">
                    <Save size={14} />
                    Simpan Profil
                  </button>
                  <button onClick={() => setIsEditingProfile(false)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
                    Batal
                  </button>
                </div>
              </div>
            )}

            <div className="border-t pt-4 space-y-3 font-medium text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Username</span>
                <span className="font-bold text-slate-800">{profile.username}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Plat Kendaraan</span>
                <span className="font-bold text-slate-800">{profile.vehiclePlate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>E-wallet Saldo</span>
                <span className="font-bold text-indigo-600">Rp {walletBalance.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Akun Terdaftar Sejak</span>
                <span className="font-bold text-slate-800">{profile.joinedAt}</span>
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-3 rounded-xl border border-red-200 transition-colors"
            >
              Keluar Akun
            </button>
          </div>
        )}

      </div>

      {/* Persistent Bottom App Tab Bar (Mobile Shell Only) */}
      <nav aria-label="Bottom Navigation" className="absolute bottom-0 w-full z-20 rounded-t-2xl shadow-xl bg-white border-t border-slate-200/80 flex justify-around items-center h-16 pb-safe">
        <button 
          onClick={() => { setActiveTab('home'); setQuerySearchIfHome(); }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Compass size={18} />
          <span className="text-[10px] font-bold mt-1">Eksplor</span>
        </button>

        <button 
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'search' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search size={18} />
          <span className="text-[10px] font-bold mt-1">Cari</span>
        </button>

        <button 
          onClick={() => setActiveTab('booking')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'booking' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CalendarCheck size={18} />
          <span className="text-[10px] font-bold mt-1">Reservasi</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserIcon size={18} />
          <span className="text-[10px] font-bold mt-1">Profil</span>
        </button>
      </nav>

      {/* ----------------- MODAL OVERLAY: CAMERA SCANNER (SCAN & PARK) ----------------- */}
      {cameraModalOpen && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex flex-col justify-between p-6 animate-fade-in text-white">
          {/* Top Close Row */}
          <div className="flex justify-between items-center mt-8">
            <div className="flex items-center gap-2">
              <Camera className="text-indigo-400 animate-pulse" size={20} />
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">Akses Scanner Kamera</span>
            </div>
            <button 
              onClick={stopCameraStream} 
              className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Viewfinder Area */}
          <div className="my-auto relative max-w-sm w-full mx-auto aspect-video rounded-3xl overflow-hidden border-2 border-indigo-500 bg-black shadow-2xl flex flex-col items-center justify-center">
            {scanSuccess ? (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-center gap-3 animate-fade-in z-20 p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-bounce">
                  <Check size={26} />
                </div>
                <h4 className="text-sm font-black text-emerald-200">SCAN BERHASIL</h4>
                <p className="text-xs text-slate-300">Pintu gate masuk terdeteksi dibuka.</p>
              </div>
            ) : null}

            {/* If streaming exists, render real HTML5 video */}
            {isStreaming && !cameraError && (
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            )}

            {/* Animation laser line always showing when loading/scanning */}
            {!scanSuccess && (
              <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-lg shadow-indigo-400/50 animate-scanline z-10" />
            )}

            {/* Backup mock viewport (e.g. on iframe restrictions or camera errors, keeps evaluating fluid and error free) */}
            {(cameraError || !isStreaming) && !scanSuccess && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950">
                <div className="relative w-40 h-28 border border-white/20 rounded-xl flex flex-col items-center justify-center bg-slate-900 overflow-hidden mb-3">
                  {/* Gate Barrier Vector Graphic representation */}
                  <div className="w-full h-1 bg-rose-500 rotate-[-12deg] origin-left animate-pulse" />
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-indigo-400/80 flex items-center justify-center text-xs text-indigo-400 font-bold font-mono">
                    QR
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 font-semibold mb-1">
                  {cameraError ? "Simulasi Kamera Aktif" : "Menghubungkan ke Lensa..."}
                </p>
                <p className="text-[9px] text-slate-500 font-medium font-sans">Arahkan QR tiket ke kotak pemindaian.</p>
              </div>
            )}
          </div>

          {/* Bottom Guideline Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center mb-8">
            <p className="text-xs font-bold mb-1">Arahkan kamera ke QR Code gate parkir</p>
            <p className="text-[10px] text-slate-300 mb-3 font-semibold">Tahan posisi 10-15 cm untuk memindai pintu otomatis.</p>
            
            {/* Interactive button to trigger scanning success */}
            <button
              onClick={handleSimulatedScanOk}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans"
            >
              <CheckCircle size={14} />
              Simulasi Pindai Berhasil
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MODAL OVERLAY: WALLET BALANCE TOP UP SHEET ----------------- */}
      {topUpModalOpen && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end animate-fade-in shadow-2xl">
          <form 
            onSubmit={handleConfirmTopUpSubmit}
            className="w-full bg-white rounded-t-[32px] p-6 border-t border-slate-100 space-y-4 flex flex-col animate-slide-up"
          >
            {/* Top Row Title */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-indigo-600">
                <Wallet size={18} />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Top Up Saldo E-Wallet</h3>
              </div>
              <button 
                type="button"
                onClick={() => setTopUpModalOpen(false)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-extrabold rounded-lg text-xs cursor-pointer shadow-sm"
              >
                Tutup
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Pilih jumlah pengisian saldo cepat atau ketik nominal manual Surabaya Smart Member anda di bawah:
            </p>

            {/* Quick value grids */}
            <div className="grid grid-cols-4 gap-2 font-mono">
              {[10000, 20000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmountSelect(amt)}
                  className={`py-2 text-[11px] font-black rounded-lg border transition-all cursor-pointer ${
                    customTopUpVal === amt.toString() ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold'
                  }`}
                >
                  {amt / 1000}k
                </button>
              ))}
            </div>

            {/* Manual input */}
            <div className="space-y-1.5 font-sans">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="nominal-input">
                Nominal Manual (IDR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-xs text-slate-400">Rp</span>
                <input
                  id="nominal-input"
                  type="number"
                  placeholder="Masukkan nominal, contoh: 35000"
                  value={customTopUpVal}
                  onChange={(e) => setCustomTopUpVal(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-black focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            {/* Direct Methods Payment selector */}
            <div className="space-y-1.5 font-sans">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Metode Pembayaran</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('qris')}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    selectedMethod === 'qris' ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold' : 'border-slate-200 grayscale text-slate-500 font-bold'
                  }`}
                >
                  <span className="text-[10px] font-black leading-none uppercase">QRIS</span>
                  <span className="text-[8px] font-medium leading-none">Instant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bca_va')}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    selectedMethod === 'bca_va' ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold' : 'border-slate-200 grayscale text-slate-500 font-bold'
                  }`}
                >
                  <span className="text-[10px] font-black leading-none uppercase">BCA VA</span>
                  <span className="text-[8px] font-medium leading-none">Transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('gopay')}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    selectedMethod === 'gopay' ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold' : 'border-slate-200 grayscale text-slate-500 font-bold'
                  }`}
                >
                  <span className="text-[10px] font-black leading-none uppercase">GoPay</span>
                  <span className="text-[8px] font-medium leading-none">E-Wallet</span>
                </button>
              </div>
            </div>

            {/* Confirm buttons */}
            <button
              type="submit"
              disabled={isTopUpProcessing}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer disabled:bg-indigo-400"
            >
              {isTopUpProcessing ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="animate-spin text-white" size={14} />
                  <span>Sedang Diproses...</span>
                </div>
              ) : (
                <span>Konfirmasi Top Up</span>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );

  function setQuerySearchIfHome() {
    setSearchQuery('');
  }
}
