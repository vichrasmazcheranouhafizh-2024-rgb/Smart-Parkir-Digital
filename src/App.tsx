/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_LOCATIONS, INITIAL_LOGS, INITIAL_TRANSACTIONS } from './data';
import { 
  ParkingLocation, ParkingSlot, Booking, CheckInLog, Transaction, Role, 
  UserTransactionRecord, AuthAccount, SlotStatus 
} from './types';
import {
  db,
  addBooking as dbAddBooking,
  addCheckInLog as dbAddLog,
  addTransaction as dbAddTx,
  addUserTransaction as dbAddUserTx,
  getActiveBookings as dbGetActiveBookings,
  getCheckInLogs as dbGetLogs,
  getTransactions as dbGetTransactions,
  getUserTransactions as dbGetUserTransactions,
  getBookingByID,
  updateBookingStatus,
  updateLogDirection,
  seedIfEmpty,
  getPungliReports,
  getAccounts,
  updateAccountApproval,
} from './db';
import { syncSnapshotToSupabase, isSupabaseConfigured, syncBookingToSupabase } from './lib/supabase';

// Importing UI screens from modular component barrel
import {
  SplashView,
  OnboardingView,
  RoleLoginView,
  UserDashboard,
  SlotSelection,
  BookingConfirmation,
  SuccessTicket,
  PetugasDashboard,
  PetugasScanner,
  AdminDashboard,
  AdminSlotOverride,
  RoleSelector,
  RoleHomeView,
  VerifyJukirView,
  LaporPungliView,
  JukirProfileView,
  AdminPetugasManage,
  AdminPungliCenter,
  AdminAnalyticsView,
  AdminPaymentView,
} from './components';

type AppState =
  | 'splash'
  | 'onboarding'
  | 'role_selection'
  | 'login'
  | 'dashboard'
  | 'slot_selection'
  | 'booking_confirmation'
  | 'success_ticket'
  | 'petugas_scanner'
  | 'user_verify_jukir'
  | 'user_lapor_pungli'
  | 'petugas_profile'
  | 'admin_lots'
  | 'admin_petugas'
  | 'admin_pungli';

export default function App() {
  // State Machine routing
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentRole, setCurrentRole] = useState<Role>('user');
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<Role>('user');
  const [authAccount, setAuthAccount] = useState<AuthAccount | null>(null);
  const [allAccounts, setAllAccounts] = useState<AuthAccount[]>([]);
  const [userTransactions, setUserTransactions] = useState<UserTransactionRecord[]>([]);
  const [pungliReportsCount, setPungliReportsCount] = useState(0);
  const [reporterName, setReporterName] = useState('Warga Surabaya');
  const [reporterPhone, setReporterPhone] = useState('0812-0000-0001');
  
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
        await seedIfEmpty(INITIAL_LOGS, INITIAL_TRANSACTIONS);

        const [savedLogs, savedTx, savedBookings, savedUserTx, savedPungliReports, savedAccounts] = await Promise.all([
          dbGetLogs(),
          dbGetTransactions(),
          dbGetActiveBookings(),
          dbGetUserTransactions('user-profile'),
          getPungliReports(),
          getAccounts(),
        ]);
        
        if (savedLogs.length > 0) setLogs(savedLogs);
        if (savedTx.length > 0) setTransactions(savedTx);
        if (savedBookings.length > 0) {
          setActiveBookings(savedBookings);
          setLatestBooking(savedBookings[savedBookings.length - 1]);
        }
        if (savedUserTx.length > 0) setUserTransactions(savedUserTx);
        if (savedAccounts.length > 0) setAllAccounts(savedAccounts);
        setPungliReportsCount(savedPungliReports.length);
        
        setDbReady(true);
      } catch (err) {
        console.error('IndexedDB init error:', err);
        setDbReady(true);
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

  const handleResetOnboarding = () => {
    setAppState('onboarding');
  };

  const handleWalletTopUp = useCallback(async (amount: number) => {
    setWalletBalance(prev => prev + amount);
    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      plateNumber: 'L 1234 AB',
      vehicleType: 'car',
      amount: amount,
      location: 'Top Up E-Wallet QRIS',
      timeAgo: 'Baru Saja',
      type: 'TopUp',
      status: 'Success'
    };
    const userTx: UserTransactionRecord = {
      id: `UTX-${Date.now()}`,
      userId: 'user-profile',
      plateNumber: 'L 1234 AB',
      location: 'Top Up Saldo ParkWise',
      amount,
      paymentMethod: 'QRIS',
      type: 'TopUp',
      status: 'Success',
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setTransactions(prev => [newTx, ...prev]);
    setUserTransactions(prev => [userTx, ...prev]);
    if (dbReady) {
      await Promise.all([dbAddTx(newTx), dbAddUserTx(userTx)]);
    }
  }, [dbReady]);

  // Admin Slot Override
  const handleApplyOverride = (slotID: string, newStatus: SlotStatus) => {
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

  // Location Photo Customizer
  const handleUpdateLocationImage = (locId: string, newImageUrl: string) => {
    setLocations(prev => prev.map(loc => {
      if (loc.id === locId) {
        return { ...loc, imageUrl: newImageUrl };
      }
      return loc;
    }));
  };

  // Account Approval by Admin
  const handleApproveAccount = async (accId: string) => {
    await updateAccountApproval(accId, 'approved');
    setAllAccounts(prev => prev.map(a => a.id === accId ? { ...a, approvalStatus: 'approved' } : a));
  };

  const handleRejectAccount = async (accId: string) => {
    await updateAccountApproval(accId, 'rejected');
    setAllAccounts(prev => prev.map(a => a.id === accId ? { ...a, approvalStatus: 'rejected' } : a));
  };

  // Late Arrival & 100% Refund Engine
  const handleTriggerLateRefund = useCallback(async (booking: Booking) => {
    // 1. Refund the money back
    setWalletBalance(prev => prev + booking.totalAmount);

    // 2. Mark booking as Cancelled & Refunded
    setActiveBookings(prev => prev.filter(b => b.bookingID !== booking.bookingID));
    setLatestBooking(null);
    if (dbReady) {
      await updateBookingStatus(booking.bookingID, 'Cancelled', {
        refundedAmount: booking.totalAmount,
        refundTime: new Date().toISOString(),
      });
    }

    // 3. Free up slot
    setLocations(prevLocs => prevLocs.map(loc => {
      if (loc.id === booking.locationID) {
        return {
          ...loc,
          availableCount: Math.min(loc.totalCapacity, loc.availableCount + 1),
          slots: loc.slots.map(sl => {
            if (sl.slotID === booking.slotID) {
              return { ...sl, status: 'Available' };
            }
            return sl;
          })
        };
      }
      return loc;
    }));

    // 4. Record refund transaction in central ledger & user history
    const refundTx: Transaction = {
      id: `REFUND-${Date.now().toString(36).toUpperCase()}`,
      plateNumber: 'L 1234 AB',
      vehicleType: 'car',
      amount: booking.totalAmount,
      location: `${booking.locationName} (Refund Telat)`,
      timeAgo: 'Baru Saja',
      type: 'Refund',
      status: 'Refunded',
    };
    const userRefundTx: UserTransactionRecord = {
      id: `UREF-${Date.now()}`,
      userId: 'user-profile',
      plateNumber: 'L 1234 AB',
      location: `Refund Reservasi Telat - ${booking.locationName}`,
      amount: booking.totalAmount,
      paymentMethod: 'QRIS Auto-Refund',
      bookingID: booking.bookingID,
      type: 'Refund',
      status: 'Refunded',
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setTransactions(prev => [refundTx, ...prev]);
    setUserTransactions(prev => [userRefundTx, ...prev]);

    if (dbReady) {
      await Promise.all([
        dbAddTx(refundTx),
        dbAddUserTx(userRefundTx),
      ]);
    }
  }, [dbReady]);

  // Checkout Handler (QRIS Only)
  const handleConfirmCheckout = useCallback(async (paymentMethod: string, estArrival: string, totalAmount: number) => {
    if (!selectedLocation || !selectedSlot) return;

    // Calculate Batas Tiba
    const now = new Date();
    const addMins = estArrival === '10 Min' ? 10 : estArrival === '20 Min' ? 20 : 30;
    const expiryDate = new Date(now.getTime() + addMins * 60000);
    const batasTibaStr = `${expiryDate.getHours().toString().padStart(2, '0')}:${expiryDate.getMinutes().toString().padStart(2, '0')} WIB`;

    const bookingID = `BK-${Date.now().toString(36).toUpperCase()}`;

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
      paymentMethod: 'QRIS',
      bookingTime: new Date().toISOString(),
      status: 'Active',
      batasTiba: batasTibaStr,
      batasTibaTimestamp: expiryDate.getTime(),
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
      timeAgo: 'Baru Saja',
      type: 'Payment',
      status: 'Success',
      timestamp: new Date().toISOString(),
    };
    const userTx: UserTransactionRecord = {
      id: `UTX-${Date.now()}`,
      userId: 'user-profile',
      plateNumber: 'L 1234 AB',
      location: selectedLocation.name,
      amount: totalAmount,
      paymentMethod: 'QRIS',
      bookingID: bookingID,
      type: 'Payment',
      status: 'Success',
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setTransactions(prev => [newTx, ...prev]);
    setUserTransactions(prev => [userTx, ...prev]);

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

    if (dbReady) {
      await Promise.all([
        dbAddBooking(newBooking),
        dbAddTx(newTx),
        dbAddUserTx(userTx),
        dbAddLog(newLog),
      ]);
    }

    // Update spot status to Occupied in locations
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

    setAppState('success_ticket');
  }, [selectedLocation, selectedSlot, dbReady]);

  // QR Scanning verifications inside Petugas Dashboard
  const handleVerifyQRScan = useCallback(async (code: string): Promise<{ success: boolean; message: string; booking?: Booking }> => {
    const rawCode = code.trim();
    let bookingID = rawCode;

    if (rawCode.toUpperCase().startsWith('PARKWISE:')) {
      bookingID = rawCode.split(':').slice(1).join(':').trim().toUpperCase();
    } else {
      bookingID = rawCode.toUpperCase();
    }

    if (dbReady) {
      const booking = await getBookingByID(bookingID);
      if (booking) {
        if (booking.status === 'CheckedIn') {
          return { success: false, message: `Booking ${bookingID} sudah di-check-in sebelumnya.` };
        }
        if (booking.status === 'Completed' || booking.status === 'Cancelled') {
          return { success: false, message: `Booking ${bookingID} sudah ${booking.status === 'Completed' ? 'selesai' : 'dibatalkan'}.` };
        }

        await updateBookingStatus(bookingID, 'CheckedIn');
        setActiveBookings(prev => prev.map(b => b.bookingID === bookingID ? { ...b, status: 'CheckedIn' } : b));
        setLatestBooking(prev => prev && prev.bookingID === bookingID ? { ...prev, status: 'CheckedIn' } : prev);

        return { 
          success: true, 
          message: `✅ Tiket QR ${bookingID} terverifikasi! Slot: ${booking.slotID}, Lokasi: ${booking.locationName}`,
          booking
        };
      }
    }

    const inMemBooking = activeBookings.find(b => b.bookingID === bookingID);
    if (inMemBooking) {
      setActiveBookings(prev => prev.map(b => b.bookingID === bookingID ? { ...b, status: 'CheckedIn' } : b));
      return { 
        success: true, 
        message: `✅ Tiket QR ${bookingID} terverifikasi! Slot: ${inMemBooking.slotID}, Lokasi: ${inMemBooking.locationName}`,
        booking: inMemBooking
      };
    }

    if (bookingID.startsWith('BK-')) {
      return { success: true, message: `✅ Tiket QR ${bookingID} terverifikasi! (simulasi)` };
    }

    return { success: false, message: `❌ ID Booking "${bookingID}" tidak ditemukan atau tidak aktif.` };
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
        return <OnboardingView onComplete={() => setAppState('role_selection')} />;

      case 'role_selection':
        return (
          <RoleHomeView
            onSelectRole={(role) => {
              setSelectedRoleForLogin(role);
              setCurrentRole(role);
              setAppState('login');
            }}
          />
        );
      
      case 'login':
        return (
          <RoleLoginView
            role={selectedRoleForLogin}
            onBack={() => setAppState('role_selection')}
            onLogin={(account) => {
              setAuthAccount(account);
              setCurrentRole(account.role);
              setSelectedRoleForLogin(account.role);
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
              userTransactions={userTransactions}
              reporterName={reporterName}
              reporterPhone={reporterPhone}
              onSelectLocation={(loc) => {
                setSelectedLocation(loc);
                setAppState('slot_selection');
              }}
              onSelectLocationWithSlot={(loc, slot) => {
                setSelectedLocation(loc);
                setSelectedSlot(slot);
                setAppState('booking_confirmation');
              }}
              onOpenScanner={() => {
                setAppState('petugas_scanner');
              }}
              onOpenVerifyJukir={() => setAppState('user_verify_jukir')}
              onOpenLaporPungli={() => setAppState('user_lapor_pungli')}
              onShowHistory={() => {
                if (latestBooking) {
                  setAppState('success_ticket');
                }
              }}
              onTopUp={handleWalletTopUp}
              onLogout={() => setAppState('role_selection')}
              onCheckInBooking={handleCheckInBooking}
            />
          );
        } else if (currentRole === 'petugas') {
          return (
            <PetugasDashboard 
              logs={logs}
              transactions={transactions}
              currentAccount={authAccount}
              allLocations={locations}
              onOpenScanner={() => setAppState('petugas_scanner')}
              onOpenProfile={() => setAppState('petugas_profile')}
              onTriggerCheckIn={handleTriggerCheckIn}
              onTriggerCheckOut={handleTriggerCheckOut}
              onLogout={() => setAppState('role_selection')}
            />
          );
        } else {
          return (
            <AdminDashboard 
              locations={locations}
              transactions={transactions}
              logs={logs}
              pungliCount={pungliReportsCount}
              pendingAccounts={allAccounts}
              onApproveAccount={handleApproveAccount}
              onRejectAccount={handleRejectAccount}
              onUpdateLocationImage={handleUpdateLocationImage}
              onNavigateToLots={() => {
                const firstLocation = locations[0];
                if (firstLocation) {
                  setSelectedLocation(firstLocation);
                }
                setAppState('admin_lots');
              }}
              onNavigatePetugas={() => setAppState('admin_petugas')}
              onNavigatePungli={() => setAppState('admin_pungli')}
              onLogout={() => setAppState('role_selection')}
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
              onTriggerLateRefund={handleTriggerLateRefund}
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

      case 'user_verify_jukir':
        return <VerifyJukirView onBack={() => setAppState('dashboard')} />;

      case 'user_lapor_pungli':
        return (
          <LaporPungliView
            reporterName={reporterName}
            reporterPhone={reporterPhone}
            onBack={() => setAppState('dashboard')}
            onSubmitted={() => {
              setPungliReportsCount(prev => prev + 1);
              setAppState('dashboard');
            }}
          />
        );

      case 'petugas_profile':
        return <JukirProfileView accountId={authAccount?.id || "acc-petugas-1"} onBack={() => setAppState('dashboard')} />;

      case 'admin_lots':
        if (selectedLocation) {
          return (
            <AdminSlotOverride 
              location={selectedLocation}
              allLocations={locations}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
              onBack={() => setAppState('dashboard')}
              onApplyOverride={handleApplyOverride}
              onLogout={() => setAppState('role_selection')}
            />
          );
        }
        setAppState('dashboard');
        return null;

      case 'admin_petugas':
        return <AdminPetugasManage onBack={() => setAppState('dashboard')} />;

      case 'admin_pungli':
        return <AdminPungliCenter onBack={() => setAppState('dashboard')} />;

      default:
        return <SplashView onComplete={() => setAppState('onboarding')} />;
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-100 flex flex-col justify-between antialiased">
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        {renderCurrentScreen()}
      </div>

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
