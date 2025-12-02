/**
 * Get current UTC timestamp
 */
export function getCurrentUTC(): Date {
  return new Date(Date.now());
}

/**
 * Convert any date to UTC
 */
export function toUTC(date: Date | string | number): Date {
  if (typeof date === 'string' || typeof date === 'number') {
    return new Date(date);
  }
  return new Date(date.toISOString());
}

/**
 * Get UTC date from now with offset
 */
export function getUTCWithOffset(offsetMs: number): Date {
  return new Date(Date.now() + offsetMs);
}

/**
 * Common date offsets in milliseconds
 */
export const DateOffsets = {
  MINUTE: 60 * 1000,
  MINUTES_15: 15 * 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Check if date is expired
 */
export function isExpired(expiresAt: Date): boolean {
  return toUTC(expiresAt) < getCurrentUTC();
}

/**
 * Format date to ISO string (UTC)
 */
export function formatToISO(date: Date): string {
  return toUTC(date).toISOString();
}

/**
 * Parse ISO string to UTC Date
 */
export function parseISO(isoString: string): Date {
  return toUTC(isoString);
}
