import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/lib/colors';
import {
  useTemplatesQuery,
  useSaveTemplatesMutation,
  useExceptionsQuery,
  useAddExceptionMutation,
  useDeleteExceptionMutation,
  useOrdersByDate,
} from '@/src/hooks/tech/useCalendar';
import type { DaySchedule } from '@/src/services/tech-calendar/types/calendar';
import ScheduleSetupModal from '../schedule/ScheduleSetupModal';
import { buildMarkedDates } from '@/src/services/tech-calendar/utils/buildMarkedDates';
import { useScheduleToast } from '@/src/hooks/tech/useScheduleToast';
import ScheduleToast from '../schedule/ScheduleToast';
import ScheduleOrdersPanel from '../schedule/ScheduleOrdersPanel';
import ScheduleLegend from '../schedule/ScheduleLegend';

const ALL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TODAY = new Date().toISOString().split('T')[0];

export default function ScheduleScreen() {
  const router = useRouter();

  const { data: serverTemplates, isLoading: isLoadingTemplates } = useTemplatesQuery();
  const { data: exceptions = [], isLoading: isLoadingExceptions } = useExceptionsQuery();
  const ordersByDate = useOrdersByDate();
  const saveMutation = useSaveTemplatesMutation();
  const addException = useAddExceptionMutation();
  const deleteException = useDeleteExceptionMutation();

  const { show: showToast, message: toastMessage, type: toastType, opacity: toastOpacity } = useScheduleToast();

  const [scheduleSet, setScheduleSet] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState(TODAY);

  // Map server templates → local DaySchedule[]
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

  // Decide once after initial load whether to show the setup modal
  useEffect(() => {
    if (!isLoadingTemplates && serverTemplates !== undefined && scheduleSet === null) {
      setScheduleSet(serverTemplates.length > 0);
    }
  }, [isLoadingTemplates, serverTemplates, scheduleSet]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleScheduleConfirm = async (newSchedule: DaySchedule[]) => {
    try {
      await saveMutation.mutateAsync({
        newSchedule: newSchedule.map((s) => ({ day_of_week: s.day_of_week, active: s.enabled })),
      });
      setScheduleSet(true);
      setTimeout(() => showToast('Schedule updated successfully ✓', 'success'), 350);
    } catch {
      showToast('Failed to update schedule. Try again.', 'error');
    }
  };

  const handleMarkUnavailable = async () => {
    try {
      await addException.mutateAsync(selectedDate);
      showToast('Day marked as unavailable ✓', 'success');
    } catch {
      showToast('Failed to mark day. Try again.', 'error');
    }
  };

  const handleRemoveOverride = async () => {
    const entry = exceptions.find((e) => e.date === selectedDate);
    if (!entry) return;
    try {
      await deleteException.mutateAsync(entry.id);
      showToast('Override removed ✓', 'success');
    } catch {
      showToast('Failed to remove override. Try again.', 'error');
    }
  };

  const onMonthDayPress = useCallback((day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  }, []);

  // ─── Selected-day derived state ──────────────────────────────────────────────

  const selectedDayOfWeek = new Date(selectedDate + 'T00:00:00').getDay();
  const isSelectedDayWorking = techSchedule.find((d) => d.day_of_week === selectedDayOfWeek)?.enabled ?? false;
  const isSelectedDateException = !!exceptions.find((e) => e.date === selectedDate);
  const isSelectedDatePast = selectedDate < TODAY;
  const ordersForSelectedDay = ordersByDate[selectedDate] ?? [];

  const canMarkUnavailable =
    !isSelectedDatePast &&
    isSelectedDayWorking &&
    !isSelectedDateException &&
    ordersForSelectedDay.length === 0;

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (isLoadingTemplates || isLoadingExceptions || scheduleSet === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }

  const selectedDayName = ALL_DAYS[selectedDayOfWeek];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <ScheduleToast message={toastMessage} type={toastType} opacity={toastOpacity} />

      {/* Setup modal */}
      <ScheduleSetupModal
        visible={!scheduleSet}
        onConfirm={handleScheduleConfirm}
        existingSchedule={techSchedule.length ? techSchedule : undefined}
        isLoading={saveMutation.isPending}
        onDismiss={() => {
          if (serverTemplates && serverTemplates.length > 0) setScheduleSet(true);
          else router.back();
        }}
      />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>My Schedule</Text>
        <TouchableOpacity
          onPress={() => setScheduleSet(false)}
          style={{ backgroundColor: Colors.brandLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.brand }}>Edit Schedule</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Calendar */}
        <View style={{ paddingHorizontal: 8, marginTop: 8 }}>
          <Calendar
            onDayPress={onMonthDayPress}
            markingType="multi-dot"
            markedDates={markedDates}
            minDate={TODAY}
            enableSwipeMonths
            firstDay={0}
            theme={{
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
              textDayFontWeight: '400',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              'stylesheet.day.basic': {
                base: {
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 16,
                },
              },
            } as any}
          />
        </View>

        {/* Selected-day panel */}
        <View
          style={{
            marginHorizontal: 12,
            marginTop: 12,
            padding: 14,
            borderRadius: 16,
            backgroundColor: Colors.surfaceGray,
            borderWidth: 1,
            borderColor: Colors.borderLight,
          }}
        >
          {/* Date label */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 2 }}>
            {selectedDate === TODAY ? 'Today' : selectedDayName}{' '}
            <Text style={{ color: Colors.textMuted, fontWeight: '400' }}>{selectedDate}</Text>
          </Text>

          {/* Availability status */}
          {isSelectedDatePast ? (
            <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 4 }}>
              Past dates cannot be modified.
            </Text>
          ) : isSelectedDateException ? (
            <>
              <Text style={{ fontSize: 13, color: '#E65100', marginTop: 4 }}>
                🚫 Marked as unavailable (override)
              </Text>
              <TouchableOpacity
                onPress={handleRemoveOverride}
                disabled={deleteException.isPending}
                style={{
                  marginTop: 10,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: deleteException.isPending ? Colors.borderLight : '#FFF3E0',
                  borderWidth: 1,
                  borderColor: '#E65100',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: deleteException.isPending ? Colors.textMuted : '#E65100' }}>
                  {deleteException.isPending ? 'Removing...' : 'Remove Override'}
                </Text>
              </TouchableOpacity>
            </>
          ) : isSelectedDayWorking ? (
            <>
              <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 4 }}>
                ✅ Working day — you are available
              </Text>
              {canMarkUnavailable ? (
                <TouchableOpacity
                  onPress={handleMarkUnavailable}
                  disabled={addException.isPending}
                  style={{
                    marginTop: 10,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: addException.isPending ? Colors.borderLight : Colors.white,
                    borderWidth: 1,
                    borderColor: Colors.borderLight,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: addException.isPending ? Colors.textMuted : Colors.textPrimary }}>
                    {addException.isPending ? 'Saving...' : '🚫 Mark as Unavailable'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 4 }}>
              Day off — not a working day in your schedule.
            </Text>
          )}

          {/* Orders for this day */}
          <ScheduleOrdersPanel orders={ordersForSelectedDay} />
        </View>

        <ScheduleLegend />
      </ScrollView>
    </View>
  );
}
