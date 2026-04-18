import type { ThemePalette } from "@/src/lib/theme";
import type { DaySchedule } from '../types/calendar';
import type { ScheduledEvent } from '../schemas/response.schema';

export function buildMarkedDates(
  schedule: DaySchedule[],
  exceptions: { id: string; date: string }[],
  ordersByDate: Record<string, ScheduledEvent[]>,
  selectedDate: string,
  themeColors: ThemePalette,
) {
  const selectedDayColor = themeColors.primary;
  const selectedDayTextColor = themeColors.surfaceBase;
  const dotOrder = {
    key: "order",
    color: themeColors.successAlt,
    selectedDotColor: selectedDayTextColor,
  };
  const dotException = {
    key: "exception",
    color: themeColors.statusUnavailable,
    selectedDotColor: selectedDayTextColor,
  };
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

    if (hasOrders) dots.push(dotOrder);
    if (hasException) dots.push(dotException);

    let selectedColor = selectedDayColor;
    if (hasException) {
      selectedColor = themeColors.statusUnavailable;
    } else if (hasOrders) {
      selectedColor = themeColors.successAlt;
    }

    if (hasException) {
      marked[str] = {
        disabled: false, // keep tappable so user can remove it
        dots,
        selected: isSelected,
        selectedColor,
        selectedTextColor: selectedDayTextColor,
      };
    } else if (isWorkingDay) {
      marked[str] = {
        dots,
        selected: isSelected,
        selectedColor,
        selectedTextColor: selectedDayTextColor,
      };
    } else {
      marked[str] = {
        disabled: true,
        disableTouchEvent: false, // still tappable to show "day off" info
        dots,
        selected: isSelected,
        selectedColor,
        selectedTextColor: selectedDayTextColor,
      };
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return marked;
}
