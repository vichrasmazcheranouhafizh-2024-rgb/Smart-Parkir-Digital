/**
 * IndexedDB Database Layer — Dexie.js
 * Persistent local database for Parkir Digital Surabaya.
 */

import Dexie, { type EntityTable } from 'dexie';
import {
  Booking,
  CheckInLog,
  Transaction,
  UserProfile,
  AuthAccount,
  JukirProfile,
  PungliReport,
  PetugasNotification,
  UserTransactionRecord,
  createDefaultAccounts,
  createDefaultJukirProfile,
  createDefaultPetugasNotifications,
} from './types';

const db = new Dexie('ParkirDigitalSurabayaDB') as Dexie & {
  bookings: EntityTable<Booking, 'bookingID'>;
  checkInLogs: EntityTable<CheckInLog, 'id'>;
  transactions: EntityTable<Transaction, 'id'>;
  userProfiles: EntityTable<UserProfile, 'id'>;
  accounts: EntityTable<AuthAccount, 'id'>;
  jukirProfiles: EntityTable<JukirProfile, 'id'>;
  pungliReports: EntityTable<PungliReport, 'id'>;
  petugasNotifications: EntityTable<PetugasNotification, 'id'>;
  userTransactions: EntityTable<UserTransactionRecord, 'id'>;
};

db.version(1).stores({
  bookings: 'bookingID, locationID, slotID, status, bookingTime',
  checkInLogs: 'id, plateNumber, bookingID, direction, time',
  transactions: 'id, plateNumber, location, amount',
  userProfiles: 'id, username, email, phone, vehiclePlate',
});

db.version(2).stores({
  bookings: 'bookingID, locationID, slotID, status, bookingTime',
  checkInLogs: 'id, plateNumber, bookingID, direction, time',
  transactions: 'id, plateNumber, location, amount',
  userProfiles: 'id, username, email, phone, vehiclePlate',
  accounts: 'id, email, role, createdAt',
  jukirProfiles: 'id, accountId, ktaNumber, verificationStatus',
  pungliReports: 'id, status, submittedAt, region',
  petugasNotifications: 'id, read, createdAt',
  userTransactions: 'id, userId, createdAt, bookingID',
});

export { db };

// ========================
// Booking Helpers
// ========================

export async function addBooking(booking: Booking): Promise<string> {
  return await db.bookings.add(booking);
}

export async function getBookings(): Promise<Booking[]> {
  return await db.bookings.toArray();
}

export async function getActiveBookings(): Promise<Booking[]> {
  return await db.bookings.where('status').anyOf('Active', 'CheckedIn').toArray();
}

export async function getBookingByID(bookingID: string): Promise<Booking | undefined> {
  return await db.bookings.get(bookingID);
}

export async function updateBookingStatus(bookingID: string, status: Booking['status']): Promise<void> {
  await db.bookings.update(bookingID, { status });
}

// ========================
// CheckInLog Helpers
// ========================

export async function addCheckInLog(log: CheckInLog): Promise<string> {
  return await db.checkInLogs.add(log);
}

export async function getCheckInLogs(): Promise<CheckInLog[]> {
  return await db.checkInLogs.toArray();
}

export async function updateLogDirection(logID: string, direction: CheckInLog['direction']): Promise<void> {
  await db.checkInLogs.update(logID, { direction });
}

// ========================
// Transaction Helpers
// ========================

export async function addTransaction(tx: Transaction): Promise<string> {
  return await db.transactions.add(tx);
}

export async function getTransactions(): Promise<Transaction[]> {
  return await db.transactions.toArray();
}

// ========================
// User Profile Helpers
// ========================

export async function putUserProfile(profile: UserProfile): Promise<string> {
  return await db.userProfiles.put(profile);
}

export async function getUserProfile(): Promise<UserProfile | undefined> {
  return await db.userProfiles.get('user-profile');
}

// ========================
// Auth Account Helpers
// ========================

export async function getAccounts(): Promise<AuthAccount[]> {
  return await db.accounts.toArray();
}

export async function getAccountByEmail(email: string): Promise<AuthAccount | undefined> {
  const lower = email.trim().toLowerCase();
  return await db.accounts.where('email').equals(lower).first();
}

export async function addAccount(account: AuthAccount): Promise<string> {
  return await db.accounts.add({ ...account, email: account.email.toLowerCase() });
}

export async function updateAccountPassword(email: string, password: string): Promise<void> {
  const acc = await getAccountByEmail(email);
  if (acc) await db.accounts.update(acc.id, { password });
}

export async function authenticateAccount(
  email: string,
  password: string,
  expectedRole?: AuthAccount['role']
): Promise<AuthAccount | null> {
  const acc = await getAccountByEmail(email);
  if (!acc || acc.password !== password) return null;
  if (expectedRole && acc.role !== expectedRole) return null;
  return acc;
}

// ========================
// Jukir Profile Helpers
// ========================

export async function getJukirProfile(accountId?: string): Promise<JukirProfile | undefined> {
  if (accountId) {
    return await db.jukirProfiles.where('accountId').equals(accountId).first();
  }
  return await db.jukirProfiles.get('jukir-profile-1');
}

export async function getJukirByKTA(ktaNumber: string): Promise<JukirProfile | undefined> {
  return await db.jukirProfiles.where('ktaNumber').equals(ktaNumber).first();
}

export async function putJukirProfile(profile: JukirProfile): Promise<string> {
  return await db.jukirProfiles.put(profile);
}

export async function getAllJukirProfiles(): Promise<JukirProfile[]> {
  return await db.jukirProfiles.toArray();
}

export async function updateJukirVerification(
  jukirId: string,
  status: JukirProfile['verificationStatus']
): Promise<void> {
  await db.jukirProfiles.update(jukirId, {
    verificationStatus: status,
    verifiedAt: status === 'verified' ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined,
  });
}

// ========================
// Pungli Report Helpers
// ========================

export async function addPungliReport(report: PungliReport): Promise<string> {
  return await db.pungliReports.add(report);
}

export async function getPungliReports(): Promise<PungliReport[]> {
  return await db.pungliReports.orderBy('submittedAt').reverse().toArray();
}

export async function updatePungliStatus(id: string, status: PungliReport['status']): Promise<void> {
  await db.pungliReports.update(id, { status });
}

// ========================
// Petugas Notification Helpers
// ========================

export async function getPetugasNotifications(): Promise<PetugasNotification[]> {
  return await db.petugasNotifications.orderBy('createdAt').reverse().toArray();
}

export async function addPetugasNotification(notif: PetugasNotification): Promise<string> {
  return await db.petugasNotifications.add(notif);
}

export async function putPetugasNotification(notif: PetugasNotification): Promise<string> {
  return await db.petugasNotifications.put(notif);
}

export async function markNotificationRead(id: string): Promise<void> {
  await db.petugasNotifications.update(id, { read: true });
}

// ========================
// User Transaction History
// ========================

export async function addUserTransaction(record: UserTransactionRecord): Promise<string> {
  return await db.userTransactions.add(record);
}

export async function getUserTransactions(userId: string): Promise<UserTransactionRecord[]> {
  const records = await db.userTransactions.where('userId').equals(userId).toArray();
  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ========================
// Seed / Init
// ========================

export async function seedIfEmpty(
  initialLogs: CheckInLog[],
  initialTransactions: Transaction[]
): Promise<void> {
  const logCount = await db.checkInLogs.count();
  if (logCount === 0 && initialLogs.length > 0) {
    await db.checkInLogs.bulkAdd(initialLogs);
  }

  const txCount = await db.transactions.count();
  if (txCount === 0 && initialTransactions.length > 0) {
    await db.transactions.bulkAdd(initialTransactions);
  }

  const accCount = await db.accounts.count();
  if (accCount === 0) {
    await db.accounts.bulkAdd(createDefaultAccounts());
  }

  const jukirCount = await db.jukirProfiles.count();
  if (jukirCount === 0) {
    await db.jukirProfiles.add(createDefaultJukirProfile());
  }

  const notifCount = await db.petugasNotifications.count();
  if (notifCount === 0) {
    await db.petugasNotifications.bulkAdd(createDefaultPetugasNotifications());
  }
}
