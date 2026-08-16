export type Role = 'guest' | 'user' | 'petugas' | 'admin';

export type SlotStatus = 'Available' | 'Occupied' | 'Booked' | 'Selected' | 'Maintenance' | 'IllegalBlock';

export interface ParkingSlot {
  slotID: string;
  zone: 'A' | 'B' | 'C' | 'Street';
  type: 'Regular' | 'VIP' | 'Disabled' | 'Illegal';
  status: SlotStatus;
  vehiclePlate?: string;
  distanceToLift: number;
  covered: boolean;
  ratePerHour: number;
  lat?: number;
  lng?: number;
  slotLabel?: string; // e.g. "empty", "booked", "maintenance", "ILEGAL bloc empty"
}

export interface ParkingLocation {
  id: string;
  name: string;
  city: string;
  region: string;
  distance: string;
  availableCount: number;
  totalCapacity: number;
  ratePerHour: number;
  imageUrl: string;
  fastFill: boolean;
  occupancyRate: number;
  latitude: number;
  longitude: number;
  slots: ParkingSlot[];
  category?: 'off-street' | 'in-street';
  assignedJukirName?: string;
  assignedJukirKTA?: string;
  vehicleTypes?: ('car' | 'motorcycle')[];
}

export interface Booking {
  bookingID: string;
  locationID: string;
  locationName: string;
  locationRegion: string;
  floor: string;
  slotID: string;
  rate: number;
  duration: number; // in hours
  totalAmount: number;
  estimatedArrival: string; // "10 Min" | "20 Min" | "30 Min"
  paymentMethod: string;
  bookingTime: string; // Date ISO string
  status: 'Active' | 'CheckedIn' | 'Completed' | 'Cancelled' | 'Refunded';
  batasTiba: string; // "14:30 WIB"
  batasTibaTimestamp?: number; // Epoch milliseconds for live timer
  refundedAmount?: number;
  refundTime?: string;
}

export interface CheckInLog {
  id: string;
  plateNumber: string;
  bookingID?: string;
  type: 'Walk-in' | 'Booking';
  slotID: string;
  time: string; // "14:32 WIB"
  direction: 'Check-In' | 'Check-Out';
  locationName: string;
}

export interface Transaction {
  id: string;
  plateNumber: string;
  location: string;
  amount: number;
  timeAgo: string;
  vehicleType: 'car' | 'motorcycle';
  type?: 'Payment' | 'Refund' | 'TopUp';
  status?: 'Success' | 'Refunded' | 'Pending';
  timestamp?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  vehiclePlate: string;
  password: string;
  profilePhotoUrl: string;
  joinedAt: string;
  address: string;
  notificationEnabled: boolean;
}

export function createDefaultProfile(): UserProfile {
  return {
    id: 'user-profile',
    username: 'achmadrosihan',
    fullName: 'Achmad Rosihan',
    email: 'achmad.rosih@ft.um.ac.id',
    phone: '0812-3456-7890',
    vehiclePlate: 'L 1234 AB',
    password: 'parkir123',
    profilePhotoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGPAlcBSpjzcMKi7wUNMp1YYPSpgsHB-17kv78E72Vy4oSmHYQ-nXcW_p8k13GTB9HCnyjbgYTOtIK2gFLa4G5y7_Shmxm85qHSlkEESeDo2V3nAJNUbmYMg7yvyYU2Tb1LEiDs5tBwGikV6GkAbOUw9zDGIJHHwBBROPdvLKe2grtrULpgNM0NYqbeXa-94xki6-Whvqml4JAzjssKdyOSKUuUKI3OSZ-SU6l61ZeYcb2417fJw7ogwnB81jf0syyyaFzwIpcX6hV',
    joinedAt: '11 Des 2024',
    address: 'Surabaya, Jawa Timur',
    notificationEnabled: true,
  };
}

// ========================
// Auth & Role Accounts
// ========================

export type AccountApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface AuthAccount {
  id: string;
  email: string;
  password: string;
  role: Role;
  fullName: string;
  phone?: string;
  createdAt: string;
  approvalStatus?: AccountApprovalStatus;
  assignedLocationId?: string;
  assignedLocationName?: string;
  nik?: string;
  ktaNumber?: string;
  shift?: 'Pagi' | 'Siang' | 'Malam';
}

export function createDefaultAccounts(): AuthAccount[] {
  return [
    {
      id: 'acc-user-1',
      email: 'user@parkwise.id',
      password: 'user123',
      role: 'user',
      fullName: 'Warga Surabaya',
      phone: '0812-0000-0001',
      createdAt: new Date().toISOString(),
      approvalStatus: 'approved',
    },
    {
      id: 'acc-petugas-1',
      email: 'petugas@parkwise.id',
      password: 'petugas123',
      role: 'petugas',
      fullName: 'Budi Santoso',
      phone: '0812-3456-7890',
      createdAt: new Date().toISOString(),
      approvalStatus: 'approved',
      assignedLocationId: 'tunjungan_plaza',
      assignedLocationName: 'Tunjungan Plaza TP4',
      ktaNumber: 'KTA-SBY-2024-0042',
      nik: '3578123456789012',
      shift: 'Pagi',
    },
    {
      id: 'acc-admin-1',
      email: 'admin@parkwise.id',
      password: 'admin123',
      role: 'admin',
      fullName: 'Admin Dishub Surabaya',
      phone: '0812-0000-0003',
      createdAt: new Date().toISOString(),
      approvalStatus: 'approved',
    },
  ];
}

// ========================
// Jukir (Petugas) Profile
// ========================

export type KtaVerificationStatus = 'pending' | 'verified' | 'revoked' | 'rejected';

export interface JukirProfile {
  id: string;
  accountId: string;
  ktaNumber: string;
  fullName: string;
  nik: string;
  phone: string;
  assignedZone: string;
  assignedLocation: string;
  assignedLocationId?: string;
  photoUrl: string;
  shift: 'Pagi' | 'Siang' | 'Malam';
  verificationStatus: KtaVerificationStatus;
  verifiedAt?: string;
  joinedAt: string;
}

export function createDefaultJukirProfile(accountId = 'acc-petugas-1'): JukirProfile {
  return {
    id: 'jukir-profile-1',
    accountId,
    ktaNumber: 'KTA-SBY-2024-0042',
    fullName: 'Budi Santoso',
    nik: '3578123456789012',
    phone: '0812-3456-7890',
    assignedZone: 'Zone A',
    assignedLocation: 'Tunjungan Plaza TP4',
    assignedLocationId: 'tunjungan_plaza',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkFSbTrg5ap-VyXHwmAvGpre2aFBG6QpyOo-EiJIny5Y5tgh2o_yjDlJ9pJu9GDsSLbIM4cJ7YB6VMzZCMfP_Y88dTVJhjOIg0oPeQfFh-NfppovJGK8BVqYQ9cqCvUnzjzP4DjkV8dyGbw2WDBk_tJ9K8Xy0OQ07ninDjPpSMph__D4Ob_bzKe1yxq1ACt2b2CK4EIwqbYzTCZDr_kiIkd4DpRK-ia42IwlR6wErr3BjeJvAV26qtNWBg-6Bl9fz3KdbU2os1-ZYz',
    shift: 'Pagi',
    verificationStatus: 'verified',
    verifiedAt: '15 Jan 2025',
    joinedAt: '1 Jan 2024',
  };
}

export function buildJukirQRPayload(profile: JukirProfile): string {
  return `PARKWISE:JUKIR:${profile.ktaNumber}:${profile.fullName}`;
}

// ========================
// Lapor Pungli
// ========================

export type PungliReportStatus = 'submitted' | 'reviewing' | 'dispatched' | 'resolved';

export interface PungliReport {
  id: string;
  reporterName: string;
  reporterPhone: string;
  location: string;
  region: string;
  description: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  status: PungliReportStatus;
  submittedAt: string;
  forwardedTo112: boolean;
  forwardedToInstagram: boolean;
  officerNotes?: string;
}

// ========================
// Petugas Notifications
// ========================

export interface PetugasNotification {
  id: string;
  title: string;
  message: string;
  type: 'verification' | 'info' | 'warning';
  read: boolean;
  createdAt: string;
}

export function createDefaultPetugasNotifications(): PetugasNotification[] {
  return [
    {
      id: 'notif-1',
      title: 'KTA Digital Terverifikasi',
      message: 'Selamat! KTA Digital Anda (KTA-SBY-2024-0042) telah diverifikasi oleh Admin Dishub Surabaya.',
      type: 'verification',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

// ========================
// User Transaction History (personal)
// ========================

export interface UserTransactionRecord {
  id: string;
  userId: string;
  plateNumber: string;
  location: string;
  amount: number;
  paymentMethod: string;
  bookingID?: string;
  createdAt: string;
  type?: 'Payment' | 'Refund' | 'TopUp';
  status?: 'Success' | 'Refunded';
}
