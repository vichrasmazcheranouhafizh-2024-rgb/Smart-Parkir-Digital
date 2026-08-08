/**
 * IndexedDB Database Layer — Dexie.js
 * Persistent local database for Parkir Digital Surabaya.
 * Tables: bookings, checkInLogs, transactions
 */

import Dexie, { type EntityTable } from 'dexie';
import { Booking, CheckInLog, Transaction } from './types';

// Extend Dexie with typed tables
const db = new Dexie('ParkirDigitalSurabayaDB') as Dexie & {
  bookings: EntityTable<Booking, 'bookingID'>;
  checkInLogs: EntityTable<CheckInLog, 'id'>;
  transactions: EntityTable<Transaction, 'id'>;
};

// Schema definition
db.version(1).stores({
  bookings: 'bookingID, locationID, slotID, status, bookingTime',
  checkInLogs: 'id, plateNumber, bookingID, direction, time',
  transactions: 'id, plateNumber, location, amount',
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
}
