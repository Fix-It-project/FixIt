import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  CalendarContainer,
  CalendarHeader,
  CalendarBody,
  type CalendarKitHandle,
  type EventItem,
} from '@howljs/calendar-kit';
import ScheduleSetupModal, { type DaySchedule } from './schedule/ScheduleSetupModal';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/lib/colors';

const DAY_ISO: Record<string, number> = {
  // CalendarKit ISO: 1=Mon...6=Sat, 7=Sun
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
  Friday: 5, Saturday: 6, Sunday: 7,
};

function buildUnavailableHours(
  schedule: DaySchedule[]
): Record<string, { start: number; end: number }[]> {
  const result: Record<string, { start: number; end: number }[]> = {};
  schedule.forEach(({ day, enabled, from, to }) => {
    const iso = DAY_ISO[day];
    if (!iso) return;
    if (!enabled) {
      result[String(iso)] = [{ start: 0, end: 24 * 60 }];
    } else {
      const slots: { start: number; end: number }[] = [];
      if (from > 0) slots.push({ start: 0, end: from * 60 });
      if (to < 24) slots.push({ start: to * 60, end: 24 * 60 });
      result[String(iso)] = slots;
    }
  });
  return result;
}

function buildMarkedDates(schedule: DaySchedule[]) {
  const marked: Record<string, any> = {};
  const ALL_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const enabledSet = new Set(schedule.map(d => d.day));
  const disabledIndices = ALL_DAYS
    .map((d, i) => (!enabledSet.has(d) ? i : -1))
    .filter(i => i !== -1);

  const cursor = new Date();
  const end = new Date(cursor.getFullYear(), 11, 31);

  while (cursor <= end) {
    const str = cursor.toISOString().split('T')[0];
    if (disabledIndices.includes(cursor.getDay())) {
      marked[str] = { disabled: true, disableTouchEvent: true };
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return marked;
}

type ViewMode = 'month' | 'week';

export default function ScheduleScreen() {
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [scheduleSet, setScheduleSet] = useState(false);
  const router = useRouter(); // ✅ add this
  const [techSchedule, setTechSchedule] = useState<DaySchedule[]>([]);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [unavailableHours, setUnavailableHours] = useState<
    Record<string, { start: number; end: number }[]>
  >({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events] = useState<EventItem[]>([]);

  const today = new Date();
  const absoluteMinDate = today.toISOString().split('T')[0];
  const absoluteMaxDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];

  // Separate window anchor for the week calendar — only moves when user explicitly taps a day
  const [weekWindowAnchor, setWeekWindowAnchor] = useState(selectedDate);

  const calendarMinDate = useMemo(() => {
    const d = new Date(weekWindowAnchor);
    d.setMonth(d.getMonth() - 1);
    const min = new Date(absoluteMinDate);
    return (d < min ? min : d).toISOString().split('T')[0];
  }, [weekWindowAnchor]);

  const calendarMaxDate = useMemo(() => {
    const d = new Date(weekWindowAnchor);
    d.setMonth(d.getMonth() + 1);
    const max = new Date(absoluteMaxDate);
    return (d > max ? max : d).toISOString().split('T')[0];
  }, [weekWindowAnchor]);

  const handleScheduleConfirm = (schedule: DaySchedule[]) => {
    setTechSchedule(schedule);
    setMarkedDates(buildMarkedDates(schedule));
    setUnavailableHours(buildUnavailableHours(schedule));
    setScheduleSet(true);
  };

  const [currentWeekLabel, setCurrentWeekLabel] = useState('');
  const shouldNavigate = useRef(false); // ✅ flag — only true when coming from month press

  const onMonthDayPress = useCallback((day: { dateString: string }) => {
    const start = new Date(day.dateString);
    const end = new Date(day.dateString);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setCurrentWeekLabel(`${fmt(start)} – ${fmt(end)}`);
    setSelectedDate(day.dateString);
    setWeekWindowAnchor(day.dateString); // ✅ move the window anchor only on explicit tap
    shouldNavigate.current = true;
    setViewMode('week');
  }, []);

  // ✅ Only fires once when switching to week — ref flag prevents swipe-triggered goToDate
  useEffect(() => {
    if (viewMode === 'week' && shouldNavigate.current) {
      shouldNavigate.current = false; // ✅ reset immediately
      setTimeout(() => {
        calendarRef.current?.goToDate({ date: selectedDate, animatedDate: false });
      }, 50);
    }
  }, [viewMode]); // ✅ only depends on viewMode — NOT selectedDate

  // ✅ Swipe only updates selectedDate — never touches weekWindowAnchor or window dates
  const onDateChanged = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  return (
    <>
      <ScheduleSetupModal
        visible={!scheduleSet}
        onConfirm={handleScheduleConfirm}
        onDismiss={() => {
          if (techSchedule.length > 0) {
            // Already has a schedule (Edit flow) — just close modal
            setScheduleSet(true);
          } else {
            //  First time setup — go back to previous page
            router.back();
          }
        }}
      />

      <View className="flex-1" style={{ backgroundColor: Colors.white }}>

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold" style={{ color: Colors.textPrimary }}>
            My Schedule
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-row rounded-xl overflow-hidden" style={{ backgroundColor: Colors.surfaceGray }}>
              {(['month', 'week'] as ViewMode[]).map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  style={viewMode === mode ? { backgroundColor: Colors.brand } : {}}
                  className="px-3 py-1.5"
                >
                  <Text
                    className="text-xs font-semibold capitalize"
                    style={{ color: viewMode === mode ? Colors.white : Colors.textMuted }}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setScheduleSet(false)}
              className="px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: Colors.brandLight }}
            >
              <Text className="text-xs font-semibold" style={{ color: Colors.brand }}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Month View */}
        <View style={{ display: viewMode === 'month' ? 'flex' : 'none' }} className="px-2">
          <Calendar
            onDayPress={onMonthDayPress}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
                selectedColor: Colors.brand,
              },
            }}
            minDate={calendarMinDate}
            enableSwipeMonths
            firstDay={0}          // 0 = Sunday
            theme={{
              backgroundColor: Colors.white,
              calendarBackground: Colors.white,
              textSectionTitleColor: Colors.textMuted,
              selectedDayBackgroundColor: Colors.brand,
              selectedDayTextColor: Colors.white,
              todayTextColor: Colors.brand,         // ✅ blue
              todayBackgroundColor: Colors.brandLight,
              dayTextColor: Colors.textPrimary,
              textDisabledColor: Colors.borderLight,
              dotColor: Colors.brand,
              selectedDotColor: Colors.white,
              arrowColor: Colors.brand,             // ✅ blue
              monthTextColor: Colors.textPrimary,
              indicatorColor: Colors.brand,
              textDayFontWeight: '400',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
          />
          <View className="mt-4 px-2">
            <Text className="text-sm font-semibold mb-3" style={{ color: Colors.textSecondary }}>
              Legend
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <LegendItem color={Colors.brand} label="Selected" />
              <LegendItem color={Colors.borderLight} label="Day off" />
            </View>
          </View>
          <View className="mt-4 p-4 rounded-2xl mx-2" style={{ backgroundColor: Colors.surfaceGray }}>
            <Text className="text-sm text-center" style={{ color: Colors.textMuted }}>
              Tap any available day to see the week view
            </Text>
          </View>
        </View>

        {/* Week View */}
        <View style={{ display: viewMode === 'week' ? 'flex' : 'none' }} className="flex-1">

          {/* Label only */}
          <View
            className="items-center py-2"
            style={{ borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}
          >
            <Text className="text-sm font-semibold" style={{ color: Colors.textSecondary }}>
              {currentWeekLabel}
            </Text>
          </View>

          <CalendarContainer
            ref={calendarRef}
            numberOfDays={7}
            firstDay={7}
            initialDate={selectedDate}
            minDate={calendarMinDate}
            maxDate={calendarMaxDate}
            scrollByDay={true}
            allowDragToCreate={false}
            allowDragToEdit={false}
            onChange={onDateChanged}
            events={events}
            unavailableHours={unavailableHours}
            theme={{
              colors: {
                primary: Colors.brand,
                background: Colors.white,
                text: Colors.textPrimary,
                surface: Colors.white,
                border: Colors.borderLight,
              },
              unavailableHourBackgroundColor: Colors.surfaceGray,
            }}
          >
            <CalendarHeader />
            <View style={{ flex: 1 }}>
              <CalendarBody />
            </View>
          </CalendarContainer>
        </View>

      </View>
    </>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View style={{ backgroundColor: color }} className="w-3 h-3 rounded-full" />
      <Text className="text-xs" style={{ color: Colors.textMuted }}>{label}</Text>
    </View>
  );
}