export type Role = 'guest' | 'user' | 'petugas' | 'admin';

export interface ParkingSlot {
  slotID: string;
  zone: 'A' | 'B';
  type: 'Regular' | 'VIP';
  status: 'Available' | 'Occupied' | 'Booked' | 'Selected';
  vehiclePlate?: string;
  distanceToLift: number;
  covered: boolean;
  ratePerHour: number;
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
  status: 'Active' | 'CheckedIn' | 'Completed' | 'Cancelled';
  batasTiba: string; // "14:30 WIB"
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
