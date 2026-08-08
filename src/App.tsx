/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { INITIAL_LOCATIONS, INITIAL_LOGS, INITIAL_TRANSACTIONS } from './data';
import { ParkingLocation, ParkingSlot, Booking, CheckInLog, Transaction, Role } from './types';

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
  
  // Simulated Persistent Database Collections
  const [locations, setLocations] = useState<ParkingLocation[]>(INITIAL_LOCATIONS);
  const [logs, setLogs] = useState<CheckInLog[]>(INITIAL_LOGS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [walletBalance, setWalletBalance] = useState<number>(45000);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);

  // Selection states
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);

  // Quick reset triggers for local testing
  const handleResetOnboarding = () => {
    setAppState('onboarding');
  };

  const handleWalletTopUp = (amount: number) => {
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
    alert(`E-wallet Anda sukses diisi sebesar Rp${amount.toLocaleString('id-ID')} !`);
  };

  const handleApplyOverride = (slotID: string, newStatus: ParkingSlot['status']) => {
    if (!selectedLocation) return;
    
    // Update local location grid layout
    setLocations(prevLocs => prevLocs.map(loc => {
      if (loc.id === selectedLocation.id) {
        return {
          ...loc,
          slots: loc.slots.map(sl => {
            if (sl.slotID === slotID) {
              return { ...sl, status: newStatus };
            }
            return sl;
          }),
          // Dynamically adjust count
          availableCount: newStatus === 'Available' 
            ? loc.availableCount + 1 
            : (loc.slots.find(x => x.slotID === slotID)?.status === 'Available' ? loc.availableCount - 1 : loc.availableCount)
        };
      }
      return loc;
    }));
  };

  const handleConfirmCheckout = (paymentMethod: string, estArrival: string, totalAmount: number) => {
    if (!selectedLocation || !selectedSlot) return;

    if (walletBalance < totalAmount) {
      alert('Maaf, saldo e-wallet Anda tidak mencukupi. Silakan lakukan Top Up terlebih dahulu.');
      return;
    }

    // Deduct E-wallet balance
    setWalletBalance(prev => prev - totalAmount);

    // Create Booking node
    const newBooking: Booking = {
      bookingID: 'BK-2026-0001',
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
      bookingID: 'BK-2026-0001',
      type: 'Booking',
      slotID: selectedSlot.slotID,
      time: 'Baru Saja',
      direction: 'Check-In',
      locationName: selectedLocation.name,
    };
    setLogs(prev => [newLog, ...prev]);

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
  };

  // QR Scanning verifications inside Petugas Dashboard
  const handleVerifyQRScan = (code: string) => {
    // Locate booking and mark as check-in successful
    setActiveBookings([]); // clears current booking simulating check-in completion success
    
    // Add check-in validation log
    const updatedLogs = logs.map(l => {
      if (l.bookingID === code) {
        return { ...l, direction: 'Check-Out' as const, time: 'Telah Masuk' };
      }
      return l;
    });
    setLogs(updatedLogs);
  };

  const handleTriggerCheckIn = (logID: string) => {
    setLogs(prev => prev.map(l => l.id === logID ? { ...l, direction: 'Check-Out' } : l));
    // Increase capacity occupied simulation
    setLocations(prev => prev.map(loc => ({ ...loc, availableCount: Math.max(0, loc.availableCount - 1) })));
  };

  const handleTriggerCheckOut = (logID: string) => {
    setLogs(prev => prev.map(l => l.id === logID ? { ...l, direction: 'Check-In' } : l));
    // Decrease occupied capacity simulation
    setLocations(prev => prev.map(loc => ({ ...loc, availableCount: Math.min(120, loc.availableCount + 1) })));
  };

  const handleCheckInBooking = (bookingID: string) => {
    setActiveBookings(prev => prev.map(b => b.bookingID === bookingID ? { ...b, status: 'CheckedIn' } : b));
    setLatestBooking(prev => {
      if (prev && prev.bookingID === bookingID) {
        return { ...prev, status: 'CheckedIn' };
      }
      return prev;
    });
  };

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
                setSelectedLocation(locations[0]); // defaults to TP
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
            onVerifyCode={(code) => {
              handleVerifyQRScan(code);
            }}
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

