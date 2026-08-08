/**
 * Utility functions for formatting values in Parkir Digital Surabaya
 */

/**
 * Format a numeric amount to Indonesian Rupiah currency string (e.g. Rp 15.000)
 */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Format an ISO date string or Date object to readable time format (e.g. 14:30 WIB)
 */
export function formatWIBTime(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '14:00 WIB';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
}

/**
 * Calculate distance display helper
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}
