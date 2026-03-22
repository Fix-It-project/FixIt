import { useMemo } from 'react';
import type { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { Colors } from '@/src/lib/colors';

type MarkedDates = Record<string, MarkingProps>;

interface Template {
  active: boolean;
  day_of_week: number;
}

interface Exception {
  date: string;
}

/**
 * Builds a marked-dates map for `react-native-calendars` from
 * technician availability templates, exception overrides, and
 * the currently-selected date.
 */
export function useAvailabilityMarks(
  templates: Template[],
  exceptions: Exception[],
  selectedDate: string | null,
): MarkedDates {
  return useMemo(() => {
    const marks: MarkedDates = {};
    if (!templates.length) return marks;

    const activeDays = new Set(templates.filter((t) => t.active).map((t) => t.day_of_week));
    const exceptionDates = new Set(exceptions.map((e) => e.date));

    const today = new Date();
    const end = new Date();
    end.setMonth(today.getMonth() + 3);

    const cursor = new Date(today);
    while (cursor <= end) {
      const dateStr = cursor.toISOString().split('T')[0];
      const dayOfWeek = cursor.getDay();

      const isUnavailable = !activeDays.has(dayOfWeek) || exceptionDates.has(dateStr);
      const isSelected = dateStr === selectedDate;

      if (isSelected && !isUnavailable) {
        marks[dateStr] = {
          selected: true,
          selectedColor: Colors.brand,
          customStyles: {
            container: {
              backgroundColor: Colors.brand,
              borderRadius: 20,
            },
            text: { color: Colors.white, fontWeight: '700' },
          },
        };
      } else if (isUnavailable) {
        marks[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          customStyles: {
            container: { backgroundColor: 'transparent' },
            text: { color: Colors.borderLight },
          },
        };
      }

      cursor.setDate(cursor.getDate() + 1);
    }
    return marks;
  }, [templates, exceptions, selectedDate]);
}
