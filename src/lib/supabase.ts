import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Booking } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
const bucketName = import.meta.env.VITE_SUPABASE_BUCKET?.trim() || 'parking-tickets';
const storageFolder = import.meta.env.VITE_SUPABASE_FOLDER?.trim() || 'tickets';

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function isSupabaseConfigured() {
  return Boolean(client);
}

export function getSupabaseClient() {
  return client;
}

export async function uploadBookingTicket(
  booking: Booking,
  qrDataUrl: string,
): Promise<{ ok: boolean; path?: string; message: string; reason?: string }> {
  if (!client) {
    return {
      ok: false,
      message: 'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY terlebih dahulu.',
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
