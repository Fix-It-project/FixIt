import { create } from "zustand";

/**
 * Selected-date state for the technician bookings page.
 *
 * Keeps the currently viewed date and the week-strip's Monday anchor
 * in sync so the WeekStrip and BookingsScreen can stay decoupled.
 */

/** Returns the Monday of the week containing `d`. */
export function getMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

interface BookingsDateState {
  /** The date whose bookings are being displayed (midnight). */
  selectedDate: Date;
  /** Monday of the currently visible week strip. */
  weekStart: Date;
  /** First day of the month currently shown in the bookings calendar sheet. */
  visibleMonth: Date;
  /** Select a specific date and jump the strip to its week. */
  setSelectedDate: (d: Date) => void;
  /** Keep the bookings month picker anchored to a specific visible month. */
  setVisibleMonth: (d: Date) => void;
  /** Move the week strip back by 7 days. */
  goToPrevWeek: () => void;
  /** Move the week strip forward by 7 days. */
  goToNextWeek: () => void;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

export const useBookingsDateStore = create<BookingsDateState>((set) => ({
  selectedDate: today,
  weekStart: getMonday(today),
  visibleMonth: new Date(today.getFullYear(), today.getMonth(), 1),

  setSelectedDate: (d: Date) => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    set({
      selectedDate: normalized,
      weekStart: getMonday(normalized),
      visibleMonth: new Date(normalized.getFullYear(), normalized.getMonth(), 1),
    });
  },

  setVisibleMonth: (d: Date) => {
    const normalized = new Date(d.getFullYear(), d.getMonth(), 1);
    normalized.setHours(0, 0, 0, 0);
    set({ visibleMonth: normalized });
  },

  goToPrevWeek: () =>
    set((s) => {
      const prev = new Date(s.weekStart);
      prev.setDate(prev.getDate() - 7);
      const todayMonday = getMonday(new Date());
      if (prev < todayMonday) return s;
      return { weekStart: prev, visibleMonth: new Date(prev.getFullYear(), prev.getMonth(), 1) };
    }),

  goToNextWeek: () =>
    set((s) => {
      const next = new Date(s.weekStart);
      next.setDate(next.getDate() + 7);
      return { weekStart: next, visibleMonth: new Date(next.getFullYear(), next.getMonth(), 1) };
    }),
}));
