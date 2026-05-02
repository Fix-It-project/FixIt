import { AppError } from '../errors/index.js';

const CAIRO_TZ = 'Africa/Cairo';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Returns the current instant. Use as the time origin for arithmetic involving
 * Cairo wall-clock dates (use cairoMidnightUtc + hoursBetween for the comparison).
 */
export function nowInCairo(): Date {
  return new Date();
}

/**
 * Returns the UTC Date instant corresponding to 00:00:00 Africa/Cairo on the
 * provided YYYY-MM-DD date string. Handles DST automatically via Intl.
 */
export function cairoMidnightUtc(dateStr: string): Date {
  if (!ISO_DATE.test(dateStr)) {
    throw AppError.badRequest('Invalid date format. Use YYYY-MM-DD.');
  }
  const [yStr, mStr, dStr] = dateStr.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);

  const guess = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  const cairoParts = new Intl.DateTimeFormat('en-US', {
    timeZone: CAIRO_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(guess));
  const get = (t: string) => Number(cairoParts.find(p => p.type === t)?.value ?? 0);
  const cairoH = get('hour') === 24 ? 0 : get('hour');
  const cairoM = get('minute');
  const cairoS = get('second');
  const offsetMs = ((cairoH * 60 + cairoM) * 60 + cairoS) * 1000;
  return new Date(guess - offsetMs);
}

/**
 * Returns the signed number of hours from `a` to `b` (positive when b is after a).
 */
export function hoursBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 3_600_000;
}

/**
 * Returns the YYYY-MM-DD string for the Cairo calendar day of `instant`.
 */
export function cairoDateString(instant: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAIRO_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(instant);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
