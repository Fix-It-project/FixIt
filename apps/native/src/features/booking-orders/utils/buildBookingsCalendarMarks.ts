import { todayIso, toIso } from "@/src/features/booking-orders/utils/date-helpers";
import type { ThemePalette } from "@/src/lib/theme";

interface BookingCalendarMark {
  disabled?: boolean;
  disableTouchEvent?: boolean;
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
}

export function buildBookingsCalendarMarks(
  bookingDates: Set<string> | undefined,
  selectedIso: string,
  themeColors: ThemePalette,
): Record<string, BookingCalendarMark> {
  const marks: Record<string, BookingCalendarMark> = {};

  if (bookingDates) {
    for (const dateStr of bookingDates) {
      if (dateStr < todayIso) continue;
      marks[dateStr] = {
        marked: true,
        dotColor: themeColors.ratingDefault,
      };
    }
  }

  const startOfMonth = new Date(
    Number.parseInt(todayIso.slice(0, 4), 10),
    Number.parseInt(todayIso.slice(5, 7), 10) - 1,
    1,
  );
  const today = new Date(
    Number.parseInt(todayIso.slice(0, 4), 10),
    Number.parseInt(todayIso.slice(5, 7), 10) - 1,
    Number.parseInt(todayIso.slice(8, 10), 10),
  );

  for (
    const cursor = new Date(startOfMonth);
    cursor < today;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const iso = toIso(cursor);
    marks[iso] = {
      ...marks[iso],
      disabled: true,
      disableTouchEvent: true,
    };
  }

  marks[selectedIso] = {
    ...marks[selectedIso],
    selected: true,
    selectedColor: themeColors.primary,
  };

  return marks;
}
