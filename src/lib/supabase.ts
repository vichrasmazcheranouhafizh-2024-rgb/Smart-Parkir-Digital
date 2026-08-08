import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Booking, UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? '')
    .trim();
const bucketName = import.meta.env.VITE_SUPABASE_BUCKET?.trim() || 'parking-tickets';
const storageFolder = import.meta.env.VITE_SUPABASE_FOLDER?.trim() || 'tickets';

let client: SupabaseClient | null = null;

if (supabaseUrl && supabasePublishableKey) {
  client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabase = client;

export function isSupabaseConfigured() {
  return Boolean(client);
}

export function getSupabaseClient() {
  return client;
}

export async function syncProfileToSupabase(profile: UserProfile) {
  if (!client) {
    return {
      ok: false,
      message: 'Supabase belum dikonfigurasi. Profil disimpan di lokal saja.',
      reason: 'not-configured',
    };
  }

  try {
    const payload = {
      id: profile.id || 'user-profile',
      username: profile.username,
      full_name: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      vehicle_plate: profile.vehiclePlate,
      profile_photo_url: profile.profilePhotoUrl,
      joined_at: profile.joinedAt,
      address: profile.address,
      notification_enabled: profile.notificationEnabled,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from('profiles').upsert(payload, { onConflict: 'id' });

    if (error) {
      return {
        ok: false,
        message: `Gagal menyinkronkan profil ke Supabase: ${error.message}`,
        reason: 'upsert-failed',
      };
    }

    return {
      ok: true,
      message: 'Profil berhasil disinkronkan ke Supabase.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      ok: false,
      message: `Kesalahan saat sinkronisasi profil: ${message}`,
      reason: 'sync-error',
    };
  }
}

export async function syncBookingToSupabase(booking: Booking) {
  if (!client) {
    return {
      ok: false,
      message: 'Supabase belum dikonfigurasi. Booking tetap tersimpan di lokal.',
      reason: 'not-configured',
    };
  }

  try {
    const payload = {
      id: booking.bookingID,
      booking_id: booking.bookingID,
      location_id: booking.locationID,
      location_name: booking.locationName,
      location_region: booking.locationRegion,
      floor: booking.floor,
      slot_id: booking.slotID,
      rate: booking.rate,
      duration: booking.duration,
      total_amount: booking.totalAmount,
      estimated_arrival: booking.estimatedArrival,
      payment_method: booking.paymentMethod,
      booking_time: booking.bookingTime,
      status: booking.status,
      batas_tiba: booking.batasTiba,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from('bookings').upsert(payload, { onConflict: 'id' });

    if (error) {
      return {
        ok: false,
        message: `Gagal menyinkronkan booking ke Supabase: ${error.message}`,
        reason: 'upsert-failed',
      };
    }

    return {
      ok: true,
      message: 'Booking berhasil disinkronkan ke Supabase.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      ok: false,
      message: `Kesalahan saat sinkronisasi booking: ${message}`,
      reason: 'sync-error',
    };
  }
}

export async function uploadBookingTicket(
  booking: Booking,
  qrDataUrl: string,
): Promise<{ ok: boolean; path?: string; message: string; reason?: string }> {
  if (!client) {
    return {
      ok: false,
      message: 'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY terlebih dahulu.',
      reason: 'not-configured',
    };
  }

  try {
    const safeFileName = `${booking.bookingID.toLowerCase()}-${Date.now()}.png`;
    const filePath = `${storageFolder}/${safeFileName}`;
    const fileBuffer = await fetch(qrDataUrl).then((res) => res.arrayBuffer());

    const { error } = await client.storage.from(bucketName).upload(filePath, fileBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      return {
        ok: false,
        message: `Gagal mengunggah tiket ke storage Supabase: ${error.message}`,
        reason: 'upload-failed',
      };
    }

    return {
      ok: true,
      path: filePath,
      message: `Tiket berhasil disimpan di Supabase: ${filePath}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      ok: false,
      message: `Kesalahan saat mengunggah tiket: ${message}`,
      reason: 'upload-error',
    };
  }
}

export async function syncSnapshotToSupabase(payload: Record<string, unknown>) {
  if (!client) {
    return { ok: false, message: 'Supabase belum dikonfigurasi.', reason: 'not-configured' };
  }

  try {
    const fileName = `snapshots/${Date.now()}.json`;
    const body = JSON.stringify(payload, null, 2);
    const { error } = await client.storage.from(bucketName).upload(fileName, body, {
      contentType: 'application/json',
      cacheControl: '60',
      upsert: false,
    });

    if (error) {
      return { ok: false, message: error.message, reason: 'upload-failed' };
    }

    return { ok: true, message: `Snapshot tersimpan di ${fileName}`, path: fileName };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, message, reason: 'upload-error' };
  }
}
