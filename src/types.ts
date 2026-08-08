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
