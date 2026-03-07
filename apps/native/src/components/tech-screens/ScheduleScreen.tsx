import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  CalendarContainer,
  CalendarHeader,
  CalendarBody,
  type CalendarKitHandle,
  type EventItem,
} from '@howljs/calendar-kit';
import ScheduleSetupModal, {
  type DaySchedule,
} from './schedule/ScheduleSetupModal';
import { useRouter } from 'expo-router';

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
  cursor.setDate(cursor.getDate() + 1);
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

  // ✅ goToDate is now reliable because CalendarContainer is always mounted
  useEffect(() => {
    if (viewMode === 'week' && selectedDate) {
      calendarRef.current?.goToDate({ date: selectedDate, animatedDate: true });
    }
  }, [viewMode, selectedDate]);

  const handleScheduleConfirm = (schedule: DaySchedule[]) => {
    setTechSchedule(schedule);
    setMarkedDates(buildMarkedDates(schedule));
    setUnavailableHours(buildUnavailableHours(schedule));
    setScheduleSet(true);
  };

  const onMonthDayPress = useCallback((day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setViewMode('week');
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

      <View className="flex-1 bg-white">

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-800">My Schedule</Text>
          <View className="flex-row gap-2">
            <View className="flex-row bg-gray-100 rounded-xl overflow-hidden">
              {(['month', 'week'] as ViewMode[]).map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  className={`px-3 py-1.5 ${viewMode === mode ? 'bg-orange-500' : ''}`}
                >
                  <Text
                    className={`text-xs font-semibold capitalize ${
                      viewMode === mode ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setScheduleSet(false)}
              className="bg-orange-100 px-3 py-1.5 rounded-xl"
            >
              <Text className="text-xs font-semibold text-orange-500">Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ Month View — hidden via display:none, NOT unmounted */}
        <View style={{ display: viewMode === 'month' ? 'flex' : 'none' }} className="px-2">
          <Calendar
            onDayPress={onMonthDayPress}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
                selectedColor: '#F97316',
              },
            }}
            minDate={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            enableSwipeMonths
            firstDay={0}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#64748B',
              selectedDayBackgroundColor: '#F97316',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#F97316',
              dayTextColor: '#1E293B',
              textDisabledColor: '#CBD5E1',
              dotColor: '#F97316',
              selectedDotColor: '#ffffff',
              arrowColor: '#F97316',
              monthTextColor: '#1E293B',
              textDayFontWeight: '400',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
          />
          <View className="mt-4 px-2">
            <Text className="text-sm font-semibold text-gray-600 mb-3">Legend</Text>
            <View className="flex-row flex-wrap gap-3">
              <LegendItem color="#F97316" label="Selected" />
              <LegendItem color="#CBD5E1" label="Day off" />
            </View>
          </View>
          <View className="mt-4 p-4 bg-gray-50 rounded-2xl mx-2">
            <Text className="text-sm text-gray-400 text-center">
              Tap any available day to see the week view
            </Text>
          </View>
        </View>

        {/* ✅ Week View — hidden via display:none, NOT unmounted */}
        <View style={{ display: viewMode === 'week' ? 'flex' : 'none' }} className="flex-1">
          <CalendarContainer
            ref={calendarRef}
            numberOfDays={7}
            firstDay={7}
            initialDate={selectedDate}
            events={events}
            unavailableHours={unavailableHours}
            onPressEvent={event => console.log('Event pressed:', event)}
            theme={{
              colors: {
                primary: '#F97316',
                background: '#ffffff',
                text: '#1E293B',
                surface: '#F8FAFC',
                border: '#E2E8F0',
              },
              unavailableHourBackgroundColor: '#F1F5F9',
            }}
          >
            <CalendarHeader />
            <CalendarBody />
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
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}
