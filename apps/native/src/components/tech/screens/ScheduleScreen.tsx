import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Text } from '@/src/components/ui/text';
import { Toast } from '@/src/components/ui/toast';
import {
  useAddExceptionMutation,
  useDeleteExceptionMutation,
  useExceptionsQuery,
  useOrdersByDate,
  useSaveTemplatesMutation,
  useTemplatesQuery,
} from '@/src/hooks/tech/useCalendar';
import { Colors } from '@/src/lib/colors';
import type { DaySchedule } from '@/src/services/tech-calendar/types/calendar';
import { buildMarkedDates } from '@/src/services/tech-calendar/utils/buildMarkedDates';
import ScheduleDayPanel from '../schedule/ScheduleDayPanel';
import ScheduleLegend from '../schedule/ScheduleLegend';
import ScheduleSetupModal from '../schedule/ScheduleSetupModal';

const ALL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TODAY = new Date().toISOString().split('T')[0];

const CALENDAR_THEME = {
  backgroundColor: Colors.white,
  calendarBackground: Colors.white,
  textSectionTitleColor: Colors.textMuted,
  selectedDayBackgroundColor: Colors.brand,
  selectedDayTextColor: Colors.white,
  todayTextColor: Colors.brand,
  todayBackgroundColor: Colors.brandLight,
  dayTextColor: Colors.textPrimary,
  textDisabledColor: Colors.borderLight,
  dotColor: Colors.brand,
  selectedDotColor: Colors.white,
  arrowColor: Colors.brand,
  monthTextColor: Colors.textPrimary,
  indicatorColor: Colors.brand,
  textDayFontWeight: '400' as const,
  textMonthFontWeight: '700' as const,
  textDayHeaderFontWeight: '600' as const,
  'stylesheet.day.basic': {
    base: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  },
} as Record<string, unknown>;

interface Props {
  onDismissSetup: () => void;
}

export default function ScheduleScreen({ onDismissSetup }: Props) {
  const { data: serverTemplates, isLoading: isLoadingTemplates } = useTemplatesQuery();
  const { data: exceptions = [], isLoading: isLoadingExceptions } = useExceptionsQuery();
  const ordersByDate = useOrdersByDate();
  const saveMutation = useSaveTemplatesMutation();
  const addException = useAddExceptionMutation();
  const deleteException = useDeleteExceptionMutation();

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TODAY);

  const hasSchedule = !isLoadingTemplates && (serverTemplates?.length ?? 0) > 0;
  const showSetupModal = !isLoadingTemplates && !isLoadingExceptions && (!hasSchedule || isEditingSchedule);

  const techSchedule = useMemo<DaySchedule[]>(() => {
    if (!serverTemplates) return [];
    return ALL_DAYS.map((dayName, index) => {
      const dbEntry = serverTemplates.find((t) => t.day_of_week === index);
      return { day_of_week: index, dayName, enabled: dbEntry ? dbEntry.active : false };
    });
  }, [serverTemplates]);

  const markedDates = useMemo(
    () => buildMarkedDates(techSchedule, exceptions, ordersByDate, selectedDate),
    [techSchedule, exceptions, ordersByDate, selectedDate],
  );

  const handleScheduleConfirm = async (newSchedule: DaySchedule[]) => {
    try {
      await saveMutation.mutateAsync({
        newSchedule: newSchedule.map((s) => ({ day_of_week: s.day_of_week, active: s.enabled })),
      });
      setIsEditingSchedule(false);
      setTimeout(() => Toast.show({ type: 'success', text1: 'Schedule updated successfully ✓' }), 350);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update schedule. Try again.' });
    }
  };

  const handleMarkUnavailable = async () => {
    try {
      await addException.mutateAsync(selectedDate);
      Toast.show({ type: 'success', text1: 'Day marked as unavailable ✓' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to mark day. Try again.' });
    }
  };

  const handleRemoveOverride = async () => {
    const entry = exceptions.find((e) => e.date === selectedDate);
    if (!entry) return;
    try {
      await deleteException.mutateAsync(entry.id);
      Toast.show({ type: 'success', text1: 'Override removed ✓' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to remove override. Try again.' });
    }
  };

  const onMonthDayPress = useCallback((day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  }, []);

  if (isLoadingTemplates || isLoadingExceptions) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }

  const selectedDayOfWeek = new Date(`${selectedDate}T00:00:00`).getDay();
  const selectedDayName = ALL_DAYS[selectedDayOfWeek];
  const isSelectedDayWorking = techSchedule.find((d) => d.day_of_week === selectedDayOfWeek)?.enabled ?? false;
  const isSelectedDateException = !!exceptions.find((e) => e.date === selectedDate);
  const isSelectedDatePast = selectedDate < TODAY;
  const ordersForSelectedDay = ordersByDate[selectedDate] ?? [];
  const canMarkUnavailable =
    !isSelectedDatePast && isSelectedDayWorking && !isSelectedDateException && ordersForSelectedDay.length === 0;

  return (
    <View className="flex-1 bg-white">
      <ScheduleSetupModal
        visible={showSetupModal}
        onConfirm={handleScheduleConfirm}
        existingSchedule={techSchedule.length ? techSchedule : undefined}
        isLoading={saveMutation.isPending}
        onDismiss={() => {
          if (hasSchedule) {
            setIsEditingSchedule(false);
          } else {
            onDismissSetup();
          }
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {hasSchedule && (
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text style={{ fontFamily: 'GoogleSans_700Bold', fontSize: 18 }} className="text-content">
              My Schedule
            </Text>
            <TouchableOpacity
              onPress={() => setIsEditingSchedule(true)}
              className="rounded-xl bg-brand-light px-3 py-1.5"
            >
              <Text style={{ fontFamily: 'GoogleSans_600SemiBold', fontSize: 12 }} className="text-brand">
                Edit Schedule
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="mt-2 px-2">
          <Calendar
            onDayPress={onMonthDayPress}
            markingType="multi-dot"
            markedDates={markedDates}
            minDate={TODAY}
            enableSwipeMonths
            firstDay={0}
            theme={CALENDAR_THEME}
          />
        </View>

        <ScheduleDayPanel
          key={selectedDate}
          selectedDate={selectedDate}
          today={TODAY}
          selectedDayName={selectedDayName}
          isSelectedDatePast={isSelectedDatePast}
          isSelectedDateException={isSelectedDateException}
          isSelectedDayWorking={isSelectedDayWorking}
          canMarkUnavailable={canMarkUnavailable}
          orders={ordersForSelectedDay}
          onMarkUnavailable={handleMarkUnavailable}
          onRemoveOverride={handleRemoveOverride}
          isAddingException={addException.isPending}
          isDeletingException={deleteException.isPending}
        />

        <ScheduleLegend />
      </ScrollView>
    </View>
  );
}
