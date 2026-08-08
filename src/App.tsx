/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_LOCATIONS, INITIAL_LOGS, INITIAL_TRANSACTIONS } from './data';
import { ParkingLocation, ParkingSlot, Booking, CheckInLog, Transaction, Role } from './types';
import {
  db,
  addBooking as dbAddBooking,
  addCheckInLog as dbAddLog,
  addTransaction as dbAddTx,
  getActiveBookings as dbGetActiveBookings,
  getCheckInLogs as dbGetLogs,
  getTransactions as dbGetTransactions,
  getBookingByID,
  updateBookingStatus,
  updateLogDirection,
  seedIfEmpty,
} from './db';
import { syncSnapshotToSupabase, isSupabaseConfigured, syncBookingToSupabase } from './lib/supabase';

// Importing UI screens from modular component barrel
import {
  SplashView,
  OnboardingView,
  LoginView,
  UserDashboard,
  SlotSelection,
  BookingConfirmation,
  SuccessTicket,
  PetugasDashboard,
  PetugasScanner,
  AdminDashboard,
  AdminSlotOverride,
  RoleSelector
} from './components';

type AppState = 
  | 'splash' 
  | 'onboarding' 
  | 'login' 
  | 'dashboard' 
  | 'slot_selection' 
  | 'booking_confirmation' 
  | 'success_ticket' 
  | 'petugas_scanner' 
  | 'admin_lots';

export default function App() {
  // State Machine routing
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentRole, setCurrentRole] = useState<Role>('user');
  
  // Persistent Database Collections (synced with IndexedDB)
  const [locations, setLocations] = useState<ParkingLocation[]>(INITIAL_LOCATIONS);
  const [logs, setLogs] = useState<CheckInLog[]>(INITIAL_LOGS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('parkir_wallet_balance');
    return saved ? parseInt(saved, 10) : 45000;
  });
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [dbReady, setDbReady] = useState(false);

  // Selection states
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);

  // ===========================
  // IndexedDB Init & Sync
  // ===========================
  useEffect(() => {
    async function initDB() {
      try {
        // Seed initial data if DB is empty
        await seedIfEmpty(INITIAL_LOGS, INITIAL_TRANSACTIONS);

        // Load persisted data
        const [savedLogs, savedTx, savedBookings] = await Promise.all([
          dbGetLogs(),
          dbGetTransactions(),
          dbGetActiveBookings(),
        ]);
        
        if (savedLogs.length > 0) setLogs(savedLogs);
        if (savedTx.length > 0) setTransactions(savedTx);
        if (savedBookings.length > 0) {
          setActiveBookings(savedBookings);
          setLatestBooking(savedBookings[savedBookings.length - 1]);
        }
        
        setDbReady(true);
      } catch (err) {
        console.error('IndexedDB init error:', err);
        setDbReady(true); // fallback to in-memory
      }
    }
    initDB();
  }, []);

  // Persist wallet balance to localStorage
  useEffect(() => {
    localStorage.setItem('parkir_wallet_balance', walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const payload = {
      walletBalance,
      locations,
      transactions,
      logs,
      activeBookings,
      updatedAt: new Date().toISOString(),
    };

    void syncSnapshotToSupabase(payload).catch(() => undefined);
  }, [activeBookings, locations, logs, transactions, walletBalance]);

  // Quick reset triggers for local testing
  const handleResetOnboarding = () => {
    setAppState('onboarding');
  };

  const handleWalletTopUp = useCallback(async (amount: number) => {
    setWalletBalance(prev => prev + amount);
    // Add transaction log
    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      plateNumber: 'L 1234 AB',
      vehicleType: 'car',
      amount: amount,
      location: 'Wallet Top Up (Simulasi)',
      timeAgo: 'Baru Saja'
    };
    setTransactions(prev => [newTx, ...prev]);
    if (dbReady) await dbAddTx(newTx);
    alert(`E-wallet Anda sukses diisi sebesar Rp${amount.toLocaleString('id-ID')} !`);
  }, [dbReady]);

  const handleApplyOverride = (slotID: string, newStatus: ParkingSlot['status']) => {
    if (!selectedLocation) return;

    setLocations(prevLocs => prevLocs.map(loc => {
      if (loc.id !== selectedLocation.id) return loc;

      const currentSlot = loc.slots.find(sl => sl.slotID === slotID);
      if (!currentSlot) return loc;

      const wasAvailable = currentSlot.status === 'Available';
      const willBeAvailable = newStatus === 'Available';
      const deltaAvailable = (wasAvailable && !willBeAvailable ? -1 : 0) + (!wasAvailable && willBeAvailable ? 1 : 0);

      return {
        ...loc,
        slots: loc.slots.map(sl => {
          if (sl.slotID === slotID) {
            return { ...sl, status: newStatus };
          }
          return sl;
        }),
        availableCount: Math.max(0, Math.min(loc.totalCapacity, loc.availableCount + deltaAvailable)),
      };
    }));
  };

  const handleConfirmCheckout = useCallback(async (paymentMethod: string, estArrival: string, totalAmount: number) => {
    if (!selectedLocation || !selectedSlot) return;

    if (walletBalance < totalAmount) {
      alert('Maaf, saldo e-wallet Anda tidak mencukupi. Silakan lakukan Top Up terlebih dahulu.');
      return;
    }

    // Deduct E-wallet balance
    setWalletBalance(prev => prev - totalAmount);

    // Generate unique booking ID
    const bookingID = `BK-${Date.now().toString(36).toUpperCase()}`;

    // Create Booking node
    const newBooking: Booking = {
      bookingID,
      locationID: selectedLocation.id,
      locationName: selectedLocation.name,
      locationRegion: selectedLocation.region,
      floor: 'Lantai B1',
      slotID: selectedSlot.slotID,
      rate: selectedSlot.ratePerHour,
      duration: 3,
      totalAmount: totalAmount,
      estimatedArrival: estArrival,
      paymentMethod: paymentMethod,
      bookingTime: new Date().toISOString(),
      status: 'Active',
      batasTiba: estArrival === '10 Min' ? '14:20 WIB' : estArrival === '20 Min' ? '14:30 WIB' : '14:40 WIB',
    };

    setActiveBookings(prev => [newBooking, ...prev]);
    setLatestBooking(newBooking);
    void syncBookingToSupabase(newBooking).catch(() => undefined);

    // Create Transaction Log
    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      plateNumber: 'L 1234 AB',
      vehicleType: 'car',
      amount: totalAmount,
      location: selectedLocation.name,
      timeAgo: 'Baru Saja'
    };
    setTransactions(prev => [newTx, ...prev]);

    // Create Municipal Officer Check-In Log
    const newLog: CheckInLog = {
      id: `LOG-${Date.now()}`,
      plateNumber: 'L 1234 AB',
      bookingID: bookingID,
      type: 'Booking',
      slotID: selectedSlot.slotID,
      time: 'Baru Saja',
      direction: 'Check-In',
      locationName: selectedLocation.name,
    };
    setLogs(prev => [newLog, ...prev]);

    // Persist to IndexedDB
    if (dbReady) {
      await Promise.all([
        dbAddBooking(newBooking),
        dbAddTx(newTx),
        dbAddLog(newLog),
      ]);
    }

    // Update spot status to Occupied in db model
    setLocations(prevLocs => prevLocs.map(loc => {
      if (loc.id === selectedLocation.id) {
        return {
          ...loc,
          availableCount: Math.max(0, loc.availableCount - 1),
          slots: loc.slots.map(sl => {
            if (sl.slotID === selectedSlot.slotID) {
              return { ...sl, status: 'Occupied' };
            }
            return sl;
          })
        };
      }
      return loc;
    }));

    // Route to tickets receipt
    setAppState('success_ticket');
  }, [selectedLocation, selectedSlot, walletBalance, dbReady]);

  // QR Scanning verifications inside Petugas Dashboard
  const handleVerifyQRScan = useCallback(async (code: string): Promise<{ success: boolean; message: string; booking?: Booking }> => {
    // Try to parse as JSON (from real QR scan)
    let bookingID = code;
    try {
      const parsed = JSON.parse(code);
      if (parsed.bookingID) {
        bookingID = parsed.bookingID;
      }
    } catch {
      // Not JSON, treat as plain booking ID
      bookingID = code.trim().toUpperCase();
    }

    // Lookup in IndexedDB first
    if (dbReady) {
      const booking = await getBookingByID(bookingID);
      if (booking) {
        if (booking.status === 'CheckedIn') {
          return { success: false, message: `Booking ${bookingID} sudah di-check-in sebelumnya.` };
        }
        if (booking.status === 'Completed' || booking.status === 'Cancelled') {
          return { success: false, message: `Booking ${bookingID} sudah ${booking.status === 'Completed' ? 'selesai' : 'dibatalkan'}.` };
        }

        // Valid! Update status
        await updateBookingStatus(bookingID, 'CheckedIn');
        setActiveBookings(prev => prev.map(b => b.bookingID === bookingID ? { ...b, status: 'CheckedIn' } : b));
        setLatestBooking(prev => prev && prev.bookingID === bookingID ? { ...prev, status: 'CheckedIn' } : prev);

        // Update log direction
        const allLogs = await dbGetLogs();
        const matchingLog = allLogs.find(l => l.bookingID === bookingID);
        if (matchingLog) {
          await updateLogDirection(matchingLog.id, 'Check-Out');
        }

        // Update in-memory logs
        setLogs(prev => prev.map(l => 
          l.bookingID === bookingID ? { ...l, direction: 'Check-Out' as const, time: 'Terverifikasi' } : l
        ));

        return { 
          success: true, 
          message: `✅ Booking ${bookingID} terverifikasi! Slot: ${booking.slotID}, Lokasi: ${booking.locationName}`,
          booking
        };
      }
    }

    // Fallback: check in-memory active bookings
    const inMemBooking = activeBookings.find(b => b.bookingID === bookingID);
    if (inMemBooking) {
      setActiveBookings(prev => prev.map(b => b.bookingID === bookingID ? { ...b, status: 'CheckedIn' } : b));
      setLogs(prev => prev.map(l => 
        l.bookingID === bookingID ? { ...l, direction: 'Check-Out' as const, time: 'Terverifikasi' } : l
      ));
      return { 
        success: true, 
        message: `✅ Booking ${bookingID} terverifikasi! Slot: ${inMemBooking.slotID}, Lokasi: ${inMemBooking.locationName}`,
        booking: inMemBooking
      };
    }

    // Also accept BK- prefix for simulation
    if (bookingID.startsWith('BK-')) {
      setLogs(prev => prev.map(l => 
        l.bookingID === bookingID ? { ...l, direction: 'Check-Out' as const, time: 'Terverifikasi' } : l
      ));
      return { success: true, message: `✅ Booking ${bookingID} terverifikasi! (simulasi)` };
    }

    return { success: false, message: `❌ Booking ID "${bookingID}" tidak ditemukan atau tidak aktif.` };
  }, [dbReady, activeBookings]);

  const handleTriggerCheckIn = useCallback(async (logID: string) => {
    setLogs(prev => prev.map(l => l.id === logID ? { ...l, direction: 'Check-Out' } : l));
    setLocations(prev => prev.map(loc => ({ ...loc, availableCount: Math.max(0, loc.availableCount - 1) })));
    if (dbReady) await updateLogDirection(logID, 'Check-Out');
  }, [dbReady]);

  const handleTriggerCheckOut = useCallback(async (logID: string) => {
    setLogs(prev => prev.map(l => l.id === logID ? { ...l, direction: 'Check-In' } : l));
    setLocations(prev => prev.map(loc => ({ ...loc, availableCount: Math.min(120, loc.availableCount + 1) })));
    if (dbReady) await updateLogDirection(logID, 'Check-In');
  }, [dbReady]);

  const handleCheckInBooking = useCallback(async (bookingID: string) => {
    setActiveBookings(prev => prev.map(b => b.bookingID === bookingID ? { ...b, status: 'CheckedIn' } : b));
    setLatestBooking(prev => {
      if (prev && prev.bookingID === bookingID) {
        return { ...prev, status: 'CheckedIn' };
      }
      return prev;
    });
    if (dbReady) await updateBookingStatus(bookingID, 'CheckedIn');
  }, [dbReady]);

  // Router dispatcher
  const renderCurrentScreen = () => {
    switch (appState) {
      case 'splash':
        return <SplashView onComplete={() => setAppState('onboarding')} />;
      
      case 'onboarding':
        return <OnboardingView onComplete={() => setAppState('login')} />;
      
      case 'login':
        return (
          <LoginView 
            onLogin={(role) => {
              setCurrentRole(role);
              setAppState('dashboard');
            }} 
          />
        );

      case 'dashboard':
        if (currentRole === 'user') {
          return (
            <UserDashboard 
              locations={locations}
              walletBalance={walletBalance}
              activeBookings={activeBookings}
              onSelectLocation={(loc) => {
                setSelectedLocation(loc);
                setAppState('slot_selection');
              }}
              onOpenScanner={() => {
                alert('Membuka akses Kamera... Pindai tiket masuk Anda.');
              }}
              onShowHistory={() => {
                if (latestBooking) {
                  setAppState('success_ticket');
                } else {
                  alert('Anda belum memiliki reservasi aktif.');
                }
              }}
              onTopUp={handleWalletTopUp}
              onLogout={() => setAppState('login')}
              onCheckInBooking={handleCheckInBooking}
            />
          );
        } else if (currentRole === 'petugas') {
          return (
            <PetugasDashboard 
              logs={logs}
              availableCount={42}
              totalCapacity={120}
              onOpenScanner={() => setAppState('petugas_scanner')}
              onTriggerCheckIn={handleTriggerCheckIn}
              onTriggerCheckOut={handleTriggerCheckOut}
              onLogout={() => setAppState('login')}
            />
          );
        } else {
          return (
            <AdminDashboard 
              locations={locations}
              transactions={transactions}
              onNavigateToLots={() => {
                const firstLocation = locations[0];
                if (firstLocation) {
                  setSelectedLocation(firstLocation);
                }
                setAppState('admin_lots');
              }}
              onLogout={() => setAppState('login')}
            />
          );
        }

      case 'slot_selection':
        if (selectedLocation) {
          return (
            <SlotSelection 
              location={selectedLocation}
              onBack={() => setAppState('dashboard')}
              onConfirmSlot={(slot) => {
                setSelectedSlot(slot);
                setAppState('booking_confirmation');
              }}
            />
          );
        }
        setAppState('dashboard');
        return null;

      case 'booking_confirmation':
        if (selectedLocation && selectedSlot) {
          return (
            <BookingConfirmation 
              location={selectedLocation}
              slot={selectedSlot}
              onBack={() => setAppState('slot_selection')}
              onCheckoutComplete={handleConfirmCheckout}
            />
          );
        }
        setAppState('dashboard');
        return null;

      case 'success_ticket':
        if (latestBooking) {
          return (
            <SuccessTicket 
              booking={latestBooking}
              onGoHome={() => setAppState('dashboard')}
            />
          );
        }
        setAppState('dashboard');
        return null;

      case 'petugas_scanner':
        return (
          <PetugasScanner 
            onBack={() => setAppState('dashboard')}
            onVerifyCode={handleVerifyQRScan}
          />
        );

      case 'admin_lots':
        if (selectedLocation) {
          return (
            <AdminSlotOverride 
              location={selectedLocation}
              onBack={() => setAppState('dashboard')}
              onApplyOverride={handleApplyOverride}
              onLogout={() => setAppState('login')}
            />
          );
        }
        setAppState('dashboard');
        return null;

      default:
        return <SplashView onComplete={() => setAppState('onboarding')} />;
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-100 flex flex-col justify-between antialiased">
      {/* Central Viewport rendering box */}
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        {renderCurrentScreen()}
      </div>

      {/* Floating developer simulation controls deck */}
      <RoleSelector 
        currentRole={currentRole}
        onChangeRole={(role) => {
          setCurrentRole(role);
          setAppState('dashboard');
        }}
        onResetOnboarding={handleResetOnboarding}
      />
    </div>
  );
}


