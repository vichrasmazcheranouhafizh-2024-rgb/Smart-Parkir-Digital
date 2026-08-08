import { ParkingLocation, CheckInLog, Transaction } from './types';
 
export const INITIAL_LOCATIONS: ParkingLocation[] = [
  {
    id: 'tunjungan_plaza',
    name: 'Tunjungan Plaza TP4',
    city: 'Surabaya',
    region: 'Genteng',
    distance: '2.4 km away',
    availableCount: 45,
    totalCapacity: 120,
    ratePerHour: 5000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN8Q6K4sy1jZhgoUT8Ln0tBvm3NhJNgeeCqOoqsZo4Ah9jDr4niJ8qG4zV7GeQh4ZFictNI-7i-mMzM_PWVwRVj-un0YCCeA32LxWXSpN6c3PpRowx8N5x9aLESdsekMkIB82od1KDVvQf6FFLg-7BP5VIALkmbv1BFTBiZBHsGq5bFSNaqTNXusAAZtzQNA2l9UCfDiTznjl3-P0Y35pUiZBgTZLedBUHWO8E4nBdvDny3iOUcyKxASjjnxTAi_1ZJjtgxevao2Iw',
    fastFill: true,
    occupancyRate: 82,
    latitude: -7.2616,
    longitude: 112.7397,
    category: 'in-street',
    slots: [
      { slotID: 'A01', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 12, covered: true, ratePerHour: 5000 },
      { slotID: 'A02', zone: 'A', type: 'Regular', status: 'Occupied', vehiclePlate: 'L 1234 AB', distanceToLift: 15, covered: true, ratePerHour: 5000 },
      { slotID: 'A03', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 18, covered: true, ratePerHour: 5000 },
      { slotID: 'A04', zone: 'A', type: 'VIP', status: 'Booked', vehiclePlate: 'L 9921 ZA', distanceToLift: 10, covered: true, ratePerHour: 10000 },
      { slotID: 'A05', zone: 'A', type: 'VIP', status: 'Selected', distanceToLift: 15, covered: true, ratePerHour: 7500 },
      { slotID: 'A06', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 22, covered: true, ratePerHour: 5000 },
      { slotID: 'B01', zone: 'B', type: 'Regular', status: 'Occupied', vehiclePlate: 'M 1990 FX', distanceToLift: 25, covered: true, ratePerHour: 5000 },
      { slotID: 'B02', zone: 'B', type: 'Regular', status: 'Available', distanceToLift: 20, covered: true, ratePerHour: 5000 },
      { slotID: 'B03', zone: 'B', type: 'Regular', status: 'Occupied', vehiclePlate: 'L 2049 YU', distanceToLift: 24, covered: true, ratePerHour: 5000 },
      { slotID: 'B04', zone: 'B', type: 'Regular', status: 'Occupied', vehiclePlate: 'W 5678 CD', distanceToLift: 26, covered: false, ratePerHour: 5000 },
      { slotID: 'B05', zone: 'B', type: 'Regular', status: 'Available', distanceToLift: 30, covered: true, ratePerHour: 5000 },
      { slotID: 'B06', zone: 'B', type: 'Regular', status: 'Available', distanceToLift: 35, covered: false, ratePerHour: 5000 }
    ]
  },
  {
    id: 'grand_city',
    name: 'Grand City Mall',
    city: 'Surabaya',
    region: 'Gubeng',
    distance: '3.1 km away',
    availableCount: 12,
    totalCapacity: 240,
    ratePerHour: 4000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwgEhf89GpKaUaPVTzS0hwvWfdQkKZdbWhggs_Yp6xRnp35D0onGrXi_dPEFLiYWIU46kXX_mnGIyMol9Bjl-Z8bapvSQmtBk20EOWgHqM0lGn8T7AVI5kN8jANGbVsfGZ67K9a8hWDo88su4LAEnBoHzdaHU6uLqmUjs3JRSu6XD3aG6rRPJHVij5GYnASXZhUeVzMMf_1i4z-FyKCbBT7ckLnJjGlNQSRKg3I9pHdNmT-razWYG7fTwDCLxHihjdiItfjNtx0wI5',
    fastFill: false,
    occupancyRate: 95,
    latitude: -7.2625,
    longitude: 112.7495,
    category: 'in-street',
    slots: [
      { slotID: 'A1-01', zone: 'A', type: 'Regular', status: 'Occupied', vehiclePlate: 'L 9012 EF', distanceToLift: 8, covered: true, ratePerHour: 4000 },
      { slotID: 'A1-02', zone: 'A', type: 'Regular', status: 'Occupied', vehiclePlate: 'L 5831 YY', distanceToLift: 10, covered: true, ratePerHour: 4000 },
      { slotID: 'A1-03', zone: 'A', type: 'Regular', status: 'Occupied', vehiclePlate: 'W 2190 PO', distanceToLift: 13, covered: true, ratePerHour: 4000 },
      { slotID: 'A1-04', zone: 'A', type: 'VIP', status: 'Booked', vehiclePlate: 'N 888 VIP', distanceToLift: 5, covered: true, ratePerHour: 8000 },
      { slotID: 'B1-01', zone: 'B', type: 'Regular', status: 'Available', distanceToLift: 18, covered: true, ratePerHour: 4000 },
      { slotID: 'B1-02', zone: 'B', type: 'Regular', status: 'Available', distanceToLift: 20, covered: true, ratePerHour: 4000 }
    ]
  },
  {
    id: 'pakuwon_mall',
    name: 'Pakuwon Mall',
    city: 'Surabaya',
    region: 'Wiyung',
    distance: '7.5 km away',
    availableCount: 152,
    totalCapacity: 300,
    ratePerHour: 5000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkPkEeBbx5xJdVyOpcB7F2gpmeaVUwF7FNt38ZacmB7pUfkHSWpymnfeaQhBCB2j7j8LuriMvksxhkzZXK4QIPuYI72fiwsyfWKPwlAh1t4rEBVIPfp5sxtvS-0UpihVI_xVsFW9pDX5N9eNPsqRSJpIVM5Hx1gsfC-B9a7VIUHkUsAWWCsRrqrBcXEwxjuwsPcqGFOVQgvvmeYsLId8TruQeuPQm2BECvXV0wYpVYFlwbCrhy5d0CaMzdbEdpjha5vMsnfSQUZBY1',
    fastFill: false,
    occupancyRate: 40,
    latitude: -7.2895,
    longitude: 112.6754,
    category: 'in-street',
    slots: [
      { slotID: 'C01', zone: 'B', type: 'Regular', status: 'Available', distanceToLift: 20, covered: true, ratePerHour: 5000 },
      { slotID: 'C02', zone: 'B', type: 'Regular', status: 'Available', distanceToLift: 22, covered: true, ratePerHour: 5000 },
      { slotID: 'C03', zone: 'B', type: 'Regular', status: 'Occupied', vehiclePlate: 'N 3012 XX', distanceToLift: 25, covered: true, ratePerHour: 5000 },
      { slotID: 'C04', zone: 'B', type: 'Regular', status: 'Available', distanceToLift: 28, covered: true, ratePerHour: 5000 }
    ]
  },
  {
    id: 'jalan_tunjungan',
    name: 'Parkir Jalan Tunjungan (Pinggir Jalan)',
    city: 'Surabaya',
    region: 'Genteng',
    distance: '1.2 km away',
    availableCount: 18,
    totalCapacity: 40,
    ratePerHour: 3000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuEay4Qkbe-N_1rM7HpxYv-zT0POnR2lV05X7lH82T9S9508K_H40vO2S_T_A3vS28qCg-zS8w8c9X2N-fQ0V_lDkd7rQ0fS0_T-X_p6S8-e5rGv9H9D7V0b5k9M7',
    fastFill: true,
    occupancyRate: 55,
    latitude: -7.2588,
    longitude: 112.7385,
    category: 'off-street',
    slots: [
      { slotID: 'TJ01', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 5, covered: false, ratePerHour: 3000 },
      { slotID: 'TJ02', zone: 'A', type: 'Regular', status: 'Occupied', vehiclePlate: 'L 8877 PP', distanceToLift: 8, covered: false, ratePerHour: 3000 },
      { slotID: 'TJ03', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 10, covered: false, ratePerHour: 3000 },
      { slotID: 'TJ04', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 15, covered: false, ratePerHour: 3000 }
    ]
  },
  {
    id: 'jalan_kertajaya',
    name: 'Parkir Jalan Kertajaya (Pinggir Jalan)',
    city: 'Surabaya',
    region: 'Gubeng',
    distance: '4.5 km away',
    availableCount: 8,
    totalCapacity: 25,
    ratePerHour: 3000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuEq_8J1y8C_84T-Pzx7kM_M9wS7F_A9P_Yv-N3H7ZpxZ0R_Z-uK0X_EpxC-V_A3o8vS_W9u6K5qW_T_uN9p3V9C4_D7V_p68_P9V_97rG_g9H9p7V_p',
    fastFill: false,
    occupancyRate: 68,
    latitude: -7.2755,
    longitude: 112.7565,
    category: 'off-street',
    slots: [
      { slotID: 'KJ01', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 3, covered: false, ratePerHour: 3000 },
      { slotID: 'KJ02', zone: 'A', type: 'Regular', status: 'Occupied', vehiclePlate: 'L 6543 OP', distanceToLift: 6, covered: false, ratePerHour: 3000 },
      { slotID: 'KJ03', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 9, covered: false, ratePerHour: 3000 }
    ]
  },
  {
    id: 'jalan_pemuda',
    name: 'Parkir Koridor Jalan Pemuda (Pinggir Jalan)',
    city: 'Surabaya',
    region: 'Genteng',
    distance: '2.8 km away',
    availableCount: 14,
    totalCapacity: 30,
    ratePerHour: 3000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuEp_9Jiy-O_08T-N_pYv-9vT9P_W_y38_fQ-C8H3W9Y2N-t_Y0N-n8V7D_mS_T2vA8o-o2S8Y8n5K9V_V0v9J0T_C-V_A8v9V_N_57pS_Y8vG',
    fastFill: true,
    occupancyRate: 53,
    latitude: -7.2650,
    longitude: 112.7445,
    category: 'off-street',
    slots: [
      { slotID: 'Y01', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 4, covered: false, ratePerHour: 3000 },
      { slotID: 'Y02', zone: 'A', type: 'Regular', status: 'Occupied', vehiclePlate: 'L 1152 AB', distanceToLift: 7, covered: false, ratePerHour: 3000 },
      { slotID: 'Y03', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 10, covered: false, ratePerHour: 3000 }
    ]
  },
  {
    id: 'galaxy_mall',
    name: 'Galaxy Mall 3 Surabaya',
    city: 'Surabaya',
    region: 'Mulyorejo',
    distance: '4.8 km away',
    availableCount: 32,
    totalCapacity: 150,
    ratePerHour: 5000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuEC8z9HbyO88T_9Nv-9vT9P_W_y38_fQ-C8H3W9Y2N-t_Y0N-n8V7D_mS_T2vA8o-o2S8Y8n5K9V_V0v9J0T_C-V_A8v9V_N_57pS_Y8vG',
    fastFill: false,
    occupancyRate: 78,
    latitude: -7.2750,
    longitude: 112.7800,
    category: 'in-street',
    slots: [
      { slotID: 'GM01', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 11, covered: true, ratePerHour: 5000 },
      { slotID: 'GM02', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 14, covered: true, ratePerHour: 5000 },
      { slotID: 'GM03', zone: 'A', type: 'VIP', status: 'Available', distanceToLift: 6, covered: true, ratePerHour: 10000 }
    ]
  },
  {
    id: 'pasar_atom',
    name: 'Pasar Atom Mall Surabaya',
    city: 'Surabaya',
    region: 'Pabean Cantian',
    distance: '3.5 km away',
    availableCount: 22,
    totalCapacity: 100,
    ratePerHour: 4000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Q6K4sy1jZhgoUT8Ln0tBvm3NhJNgeeCqOoqsZo4Ah9jDr4niJ8qG4zV7GeQh4ZFictNI-7i-mMzM_PWVwRVj-un0YCCeA32LxWXSpN6c3PpRowx8N5x9aLESdsekMkIB82od1KDVvQf6FFLg-7BP5VIALkmbv1BFTBiZBHsGq5bFSNaqTNXusAAZtzQNA2l9UCfDiTznjl3-P0Y35pUiZBgTZLedBUHWO8E4nBdvDny3iOUcyKxASjjnxTAi_1ZJjtgxevao2Iw',
    fastFill: true,
    occupancyRate: 70,
    latitude: -7.2435,
    longitude: 112.7425,
    category: 'in-street',
    slots: [
      { slotID: 'PA01', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 15, covered: true, ratePerHour: 4000 },
      { slotID: 'PA02', zone: 'A', type: 'Regular', status: 'Occupied', vehiclePlate: 'L 2821 CC', distanceToLift: 18, covered: true, ratePerHour: 4000 }
    ]
  },
  {
    id: 'jalan_darmo',
    name: 'Parkir Raya Kupang (Pinggir Jalan Darmo)',
    city: 'Surabaya',
    region: 'Tegalsari',
    distance: '3.2 km away',
    availableCount: 15,
    totalCapacity: 35,
    ratePerHour: 3000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuEay4Qkbe-N_1rM7HpxYv-zT0POnR2lV05X7lH82T9S9508K_H40vO2S_T_A3vS28qCg-zS8w8c9X2N-fQ0V_lDkd7rQ0fS0_T-X_p6S8-e5rGv9H9D7V0b5k9M7',
    fastFill: true,
    occupancyRate: 57,
    latitude: -7.2810,
    longitude: 112.7375,
    category: 'off-street',
    slots: [
      { slotID: 'DR01', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 6, covered: false, ratePerHour: 3000 },
      { slotID: 'DR02', zone: 'A', type: 'Regular', status: 'Occupied', vehiclePlate: 'L 7751 YX', distanceToLift: 9, covered: false, ratePerHour: 3000 }
    ]
  },
  {
    id: 'jalan_manyar',
    name: 'Parkir Sepanjang Jalan Raya Manyar Kertajaya',
    city: 'Surabaya',
    region: 'Mulyorejo',
    distance: '5.2 km away',
    availableCount: 9,
    totalCapacity: 20,
    ratePerHour: 3000,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuEq_8J1y8C_84T-Pzx7kM_M9wS7F_A9P_Yv-N3H7ZpxZ0R_Z-uK0X_EpxC-V_A3o8vS_W9u6K5qW_T_uN9p3V9C4_D7V_p68_P9V_97rG_g9H9p7V_p',
    fastFill: false,
    occupancyRate: 55,
    latitude: -7.2845,
    longitude: 112.7660,
    category: 'off-street',
    slots: [
      { slotID: 'MY01', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 4, covered: false, ratePerHour: 3000 },
      { slotID: 'MY02', zone: 'A', type: 'Regular', status: 'Available', distanceToLift: 7, covered: false, ratePerHour: 3000 }
    ]
  }
];

export const INITIAL_LOGS: CheckInLog[] = [
  {
    id: 'log1',
    plateNumber: 'L 1234 AB',
    bookingID: 'BK-8892',
    type: 'Booking',
    slotID: 'A02',
    time: '14:32 WIB',
    direction: 'Check-In',
    locationName: 'Tunjungan Plaza Zone A'
  },
  {
    id: 'log2',
    plateNumber: 'W 5678 CD',
    type: 'Walk-in',
    slotID: 'B04',
    time: '14:15 WIB',
    direction: 'Check-In',
    locationName: 'Tunjungan Plaza Zone A'
  },
  {
    id: 'log3',
    plateNumber: 'L 9988 ZZ',
    bookingID: 'BK-8845',
    type: 'Booking',
    slotID: 'A04',
    time: '13:45 WIB',
    direction: 'Check-Out',
    locationName: 'Tunjungan Plaza Zone A'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    plateNumber: 'L 1234 AB',
    location: 'Tunjungan Plaza - Zone A',
    amount: 15000,
    timeAgo: 'Baru saja',
    vehicleType: 'car'
  },
  {
    id: 'tx2',
    plateNumber: 'W 5678 CD',
    location: 'Pakuwon Mall - Zone C',
    amount: 5000,
    timeAgo: '5 mnt lalu',
    vehicleType: 'motorcycle'
  },
  {
    id: 'tx3',
    plateNumber: 'L 9012 EF',
    location: 'Grand City - Premium',
    amount: 25000,
    timeAgo: '12 mnt lalu',
    vehicleType: 'car'
  },
  {
    id: 'tx4',
    plateNumber: 'L 3456 GH',
    location: 'Balai Kota - Public',
    amount: 3000,
    timeAgo: '18 mnt lalu',
    vehicleType: 'motorcycle'
  }
];
