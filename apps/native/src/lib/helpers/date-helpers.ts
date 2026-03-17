/** Shared date formatting utilities for the technician bookings feature. */

/** Format a Date to "YYYY-MM-DD". */
export function toIso(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Today at midnight, computed once at module load. */
export const todayIso: string = toIso(
  (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })(),
);

/** Format a Date for the bookings heading, e.g. "Today's Bookings" or "Tuesday, Mar 18". */
export function formatHeading(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(d);
  compare.setHours(0, 0, 0, 0);

  if (compare.getTime() === today.getTime()) return "Today's Bookings";

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

/** Format a Date to "Mar 17, 2026". */
export function formatDateLabel(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
