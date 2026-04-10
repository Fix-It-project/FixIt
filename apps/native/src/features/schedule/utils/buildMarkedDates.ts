import { Colors } from '@/src/lib/colors';
import type { DaySchedule } from '../types/calendar';
import type { TechnicianOrder } from '../schemas/response.schema';

const DOT_ORDER = { key: 'order', color: Colors.successAlt, selectedDotColor: Colors.surfaceBase };
const DOT_EXCEPTION = { key: 'exception', color: Colors.statusUnavailable, selectedDotColor: Colors.surfaceBase };

export function buildMarkedDates(
  schedule: DaySchedule[],
  exceptions: { id: string; date: string }[],
  ordersByDate: Record<string, TechnicianOrder[]>,
  selectedDate: string,
) {
  const marked: Record<string, any> = {};
  const enabledSet = new Set(schedule.filter((d) => d.enabled).map((d) => d.day_of_week));
  const exceptionSet = new Set(exceptions.map((e) => e.date));

  const cursor = new Date();
  const end = new Date(cursor.getFullYear() + 1, 11, 31);

  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const str = `${y}-${m}-${d}`;
    const dow = cursor.getDay();
    const dots: object[] = [];

    const hasException = exceptionSet.has(str);
    const hasOrders = (ordersByDate[str]?.length ?? 0) > 0;
    const isWorkingDay = enabledSet.has(dow);
    const isSelected = str === selectedDate;

    if (hasOrders) dots.push(DOT_ORDER);
    if (hasException) dots.push(DOT_EXCEPTION);

    // Dynamic highlight color for selected dates to match the legend
    let highlightColor: string = Colors.primary;
    if (hasException) {
      highlightColor = Colors.statusUnavailable;
    } else if (!isWorkingDay) {
      highlightColor = '#9CA3AF'; // Gray (Day off)
    } else if (hasOrders) {
      highlightColor = Colors.successAlt;
    }

    if (hasException) {
      marked[str] = {
        disabled: false, // keep tappable so user can remove it
        dots,
        selected: isSelected,
        selectedColor: highlightColor,
      };
    } else if (!isWorkingDay) {
      marked[str] = {
        disabled: true,
        disableTouchEvent: false, // still tappable to show "day off" info
        dots,
        selected: isSelected,
        selectedColor: highlightColor,
      };
    } else {
      marked[str] = {
        dots,
        selected: isSelected,
        selectedColor: highlightColor,
      };
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return marked;
}
