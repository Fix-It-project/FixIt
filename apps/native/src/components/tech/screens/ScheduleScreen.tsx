import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import ScheduleSetupModal, { type DaySchedule } from './schedule/ScheduleSetupModal';
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
import type { TechnicianOrder } from '@/src/services/tech-calendar/types/calendar';

const ALL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TODAY = new Date().toISOString().split('T')[0];

// ─── Constants ────────────────────────────────────────────────────────────────

const DOT_ORDER   = { key: 'order',     color: '#22C55E', selectedDotColor: '#fff' };
const DOT_EXCEPTION = { key: 'exception', color: '#E65100', selectedDotColor: '#fff' };

const STATUS_LABEL: Record<TechnicianOrder['status'], string> = {
  pending:                 'Pending',
  accepted:                'Accepted',
  rejected:                'Rejected',
  cancelled_by_user:       'Cancelled by user',
  cancelled_by_technician: 'Cancelled by you',
  completed:               'Completed',
};

const STATUS_COLOR: Record<TechnicianOrder['status'], string> = {
  pending:                 '#F59E0B',
  accepted:                '#22C55E',
  rejected:                '#EF4444',
  cancelled_by_user:       '#9CA3AF',
  cancelled_by_technician: '#9CA3AF',
  completed:               '#3B82F6',
};

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error';

function useToast() {
  const opacity = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string, toastType: ToastType = 'success') => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      setType(toastType);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(() => setMessage(''), 3100);
    },
    [opacity],
  );

  const ToastComponent = message ? (
    <Animated.View
      style={{
        opacity,
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 100,
        backgroundColor: type === 'success' ? Colors.brand : '#D9534F',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>{message}</Text>
    </Animated.View>
  ) : null;

  return { show, ToastComponent };
}

// ─── Marked dates builder ─────────────────────────────────────────────────────

function buildMarkedDates(
  schedule: DaySchedule[],
  exceptions: { id: string; date: string }[],
  ordersByDate: Record<string, TechnicianOrder[]>,
  selectedDate: string,
) {
  const marked: Record<string, any> = {};
  const enabledSet   = new Set(schedule.filter((d) => d.enabled).map((d) => d.day_of_week));
  const exceptionSet = new Set(exceptions.map((e) => e.date));

  const cursor = new Date();
  const end    = new Date(cursor.getFullYear() + 1, 11, 31);

  while (cursor <= end) {
    const str = cursor.toISOString().split('T')[0];
    const dow = cursor.getDay();
    const dots: object[] = [];

    const hasException  = exceptionSet.has(str);
    const hasOrders     = (ordersByDate[str]?.length ?? 0) > 0;
    const isWorkingDay  = enabledSet.has(dow);
    const isSelected    = str === selectedDate;

    if (hasOrders)    dots.push(DOT_ORDER);
    if (hasException) dots.push(DOT_EXCEPTION);

    // Dynamic highlight color for selected dates to match the legend
    let highlightColor: string = Colors.brand;
    if (hasException) {
      highlightColor = '#E65100'; // Orange (Exception override)
    } else if (!isWorkingDay) {
      highlightColor = '#9CA3AF'; // Gray (Day off)
    } else if (hasOrders) {
      highlightColor = '#22C55E'; // Green (Has orders)
    }

    if (hasException) {
      marked[str] = {
        disabled: false,       // keep tappable so user can remove it
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

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: TechnicianOrder }) {
  const color = STATUS_COLOR[order.status];
  const label = STATUS_LABEL[order.status];

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        backgroundColor: Colors.white,
      }}
    >
      {/* Status badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 }}>
        <View style={{ backgroundColor: color + '1A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{label}</Text>
        </View>
      </View>

      {/* Primary Description */}
      {order.problem_description ? (
        <Text
          style={{ color: Colors.textPrimary, fontSize: 13, fontWeight: '500', lineHeight: 18 }}
          numberOfLines={3}
        >
          {order.problem_description}
        </Text>
      ) : (
        <Text style={{ color: Colors.textMuted, fontSize: 13, fontStyle: 'italic' }}>
          No description provided.
        </Text>
      )}

      {/* Active indicator */}
      {order.active && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
          <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '600' }}>Active booking</Text>
        </View>
      )}
    </View>
  );
}

// ─── Orders panel ─────────────────────────────────────────────────────────────

function OrdersPanel({ orders }: { orders: TechnicianOrder[] }) {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  // Reset expansion when the order list changes (i.e. day changed)
  useEffect(() => {
    setExpanded(false);
    anim.setValue(0);
  }, [orders]);

  if (orders.length === 0) return null;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(anim, { toValue, useNativeDriver: false, tension: 60, friction: 10 }).start();
    setExpanded(!expanded);
  };

  return (
    <View
      style={{
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#22C55E40',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#F0FDF4',
      }}
    >
      {/* Header / toggle */}
      <TouchableOpacity
        onPress={toggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
          <Text style={{ color: '#15803D', fontWeight: '600', fontSize: 13 }}>
            {orders.length} order{orders.length > 1 ? 's' : ''} this day
          </Text>
        </View>
        <Text style={{ color: '#15803D', fontSize: 18, lineHeight: 20 }}>
          {expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Expandable cards */}
      {expanded && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const router = useRouter();

  const { data: serverTemplates, isLoading: isLoadingTemplates } = useTemplatesQuery();
  const { data: exceptions = [], isLoading: isLoadingExceptions }  = useExceptionsQuery();
  const ordersByDate = useOrdersByDate();
  const saveMutation    = useSaveTemplatesMutation();
  const addException    = useAddExceptionMutation();
  const deleteException = useDeleteExceptionMutation();

  const { show: showToast, ToastComponent } = useToast();

  const [scheduleSet, setScheduleSet]   = useState<boolean | null>(null);
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

  const selectedDayOfWeek     = new Date(selectedDate + 'T00:00:00').getDay();
  const isSelectedDayWorking  = techSchedule.find((d) => d.day_of_week === selectedDayOfWeek)?.enabled ?? false;
  const selectedExceptionEntry = exceptions.find((e) => e.date === selectedDate);
  const isSelectedDateException = !!selectedExceptionEntry;
  const isSelectedDatePast    = selectedDate < TODAY;
  const ordersForSelectedDay  = ordersByDate[selectedDate] ?? [];

  // Hide "Mark as unavailable" if there are active bookings that day
  const canMarkUnavailable = 
    !isSelectedDatePast && 
    isSelectedDayWorking && 
    !isSelectedDateException && 
    ordersForSelectedDay.length === 0;
    
  const canRemoveOverride  = !isSelectedDatePast && isSelectedDateException;

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
      {/* Toast */}
      {ToastComponent}

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
              // Rounded day cells
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

          {/* Orders for this day — shown regardless of availability status */}
          <OrdersPanel orders={ordersForSelectedDay} />
        </View>

        {/* Legend */}
        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 10, color: Colors.textSecondary }}>
            Legend
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <LegendItem color={Colors.brand}    label="Selected date" />
            <LegendItem color={Colors.borderLight} label="Day off" />
            <LegendItem color="#22C55E"         label="Has orders" />
            <LegendItem color="#E65100"         label="Overridden (unavailable)" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: Colors.textMuted }}>{label}</Text>
    </View>
  );
}