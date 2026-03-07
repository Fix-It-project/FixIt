import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  BackHandler,
} from 'react-native';
import {
  CalendarContainer,
  CalendarHeader,
  CalendarBody,
  type CalendarKitHandle,
} from '@howljs/calendar-kit';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/lib/colors';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ISO: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
  Friday: 5, Saturday: 6, Sunday: 7,
};

export interface DaySchedule {
  day: string;
  enabled: boolean;
  from: number;
  to: number;
}

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((day, i) => ({
  day,
  enabled: i <= 4,
  from: 9,
  to: 17,
}));

interface Props {
  visible: boolean;
  onConfirm: (schedule: DaySchedule[]) => void;
  onDismiss?: () => void;
  existingSchedule?: DaySchedule[]; // pass in current schedule when editing
}

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

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const period = i < 12 ? 'AM' : 'PM';
  const h = i % 12 === 0 ? 12 : i % 12;
  return { label: `${h}${period}`, value: i };
});

function HourChips({
  value,
  onChange,
  minHour = 0,
  maxHour = 23,
}: {
  value: number;
  onChange: (h: number) => void;
  minHour?: number;
  maxHour?: number;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
      <View className="flex-row gap-2 px-1">
        {HOURS.filter(h => h.value >= minHour && h.value <= maxHour).map(h => (
          <TouchableOpacity
            key={h.value}
            onPress={() => onChange(h.value)}
            className="px-3 py-1.5 rounded-xl border"
            style={{
              backgroundColor: h.value === value ? Colors.brand : Colors.white,
              borderColor: h.value === value ? Colors.brand : Colors.borderLight,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: h.value === value ? Colors.white : Colors.textSecondary }}
            >
              {h.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

export default function ScheduleSetupModal({ visible, onConfirm, onDismiss, existingSchedule }: Props) {
  const [step, setStep] = useState<'choose' | 'custom'>('choose');
  // ✅ seed from existingSchedule if present, otherwise DEFAULT_SCHEDULE
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    existingSchedule ?? DEFAULT_SCHEDULE
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedField, setExpandedField] = useState<'from' | 'to' | null>(null);
  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);
  const previewRef = useRef<CalendarKitHandle>(null);
  const router = useRouter();

  const unavailableHours = useMemo(() => buildUnavailableHours(schedule), [schedule]);

  // Handle Android hardware back button
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      if (step === 'custom') {
        // custom → go back to choose
        setStep('choose');
        return true; // consumed
      }
      // choose step → go back to previous screen
      if (onDismiss) {
        onDismiss();
      } else {
        router.back();
      }
      return true; // consumed
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [visible, step, onDismiss, router]);

  const toggleDay = (index: number) => {
    setSchedule(prev =>
      prev.map((d, i) => (i === index ? { ...d, enabled: !d.enabled } : d))
    );
    setExpandedDay(null);
  };

  const updateTime = (index: number, field: 'from' | 'to', value: number) => {
    setSchedule(prev =>
      prev.map((d, i) => {
        if (i !== index) return d;
        const updated = { ...d, [field]: value };
        if (field === 'from' && value >= d.to) updated.to = Math.min(value + 1, 23);
        if (field === 'to' && value <= d.from) updated.from = Math.max(value - 1, 0);
        return updated;
      })
    );
  };

  const togglePicker = (index: number, field: 'from' | 'to') => {
    if (expandedDay === index && expandedField === field) {
      setExpandedDay(null);
      setExpandedField(null);
    } else {
      setExpandedDay(index);
      setExpandedField(field);
    }
  };

  const fmtHour = (h: number) => HOURS[h].label;

  const PreviewCalendar = useCallback(
    () => (
      <View
        style={{ height: 420 }}
        onTouchStart={() => setOuterScrollEnabled(false)}
        onTouchEnd={() => setOuterScrollEnabled(true)}
        onTouchCancel={() => setOuterScrollEnabled(true)}
      >
        <CalendarContainer
          ref={previewRef}
          numberOfDays={7}
          firstDay={1}
          scrollByDay={false}
          unavailableHours={unavailableHours}
          initialTimeIntervalHeight={56}
          theme={{
            colors: {
              primary: Colors.brand,
              background: Colors.white,
              text: Colors.textPrimary,
              surface: Colors.surfaceGray,
              border: Colors.borderLight,
            },
            unavailableHourBackgroundColor: Colors.surfaceGray,
          }}
          initialDate={new Date().toISOString().split('T')[0]}
        >
          <CalendarHeader />
          <CalendarBody />
        </CalendarContainer>
      </View>
    ),
    [unavailableHours]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (step === 'custom') {
          setStep('choose');
        } else {
          if (onDismiss) onDismiss();
          else router.back();
        }
      }}
    >
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: Colors.white }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={outerScrollEnabled}
        nestedScrollEnabled
      >
        <View className="p-6">
          <Text className="text-2xl font-bold mb-1" style={{ color: Colors.textPrimary }}>
            Set Your Schedule
          </Text>
          <Text className="text-sm mb-6" style={{ color: Colors.textMuted }}>
            Define your weekly availability. It repeats every week.
          </Text>

          {step === 'choose' ? (
            <View className="gap-4">
              {/* Default Schedule Option */}
              <TouchableOpacity
                onPress={() => onConfirm(DEFAULT_SCHEDULE)}
                className="p-5 rounded-2xl border-2"
                style={{ borderColor: Colors.brand, backgroundColor: Colors.brandLight }}
              >
                <Text className="text-base font-bold mb-1" style={{ color: Colors.brand }}>
                  ⚡ Default Schedule
                </Text>
                <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                  Monday – Friday, 9:00 AM to 5:00 PM.{'\n'}
                  Applied automatically every week.
                </Text>
              </TouchableOpacity>

              {/* Custom Schedule Option */}
              <TouchableOpacity
                onPress={() => setStep('custom')}
                className="p-5 rounded-2xl border-2"
                style={{ borderColor: Colors.borderLight, backgroundColor: Colors.surfaceGray }}
              >
                <Text className="text-base font-bold mb-1" style={{ color: Colors.textPrimary }}>
                  🛠 Custom Schedule
                </Text>
                <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                  Pick your own days & hours.{'\n'}
                  Repeats weekly throughout the year.
                </Text>
              </TouchableOpacity>
            </View>

          ) : (
            <View>
              {/* Live Preview */}
              <View
                className="mb-5 rounded-2xl overflow-hidden"
                style={{ borderWidth: 1, borderColor: Colors.borderLight }}
              >
                <View
                  className="px-4 pt-3 pb-1 flex-row items-center justify-between"
                  style={{ backgroundColor: Colors.surfaceGray }}
                >
                  <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: Colors.textMuted }}>
                    Live Preview — this week
                  </Text>
                  <Text className="text-xs" style={{ color: Colors.borderLight }}>scroll inside ↕</Text>
                </View>
                <PreviewCalendar />
              </View>

              <Text className="text-base font-semibold mb-3" style={{ color: Colors.textSecondary }}>
                Working hours per day
              </Text>

              {schedule.map((item, index) => (
                <View
                  key={item.day}
                  className="mb-3 rounded-2xl overflow-hidden"
                  style={{
                    borderWidth: 1,
                    borderColor: item.enabled ? Colors.brand : Colors.borderLight,
                  }}
                >
                  {/* Day row */}
                  <View
                    className="flex-row items-center justify-between px-4 py-3"
                    style={{ backgroundColor: item.enabled ? Colors.brandLight : Colors.surfaceGray }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: item.enabled ? Colors.textPrimary : Colors.textMuted }}
                    >
                      {item.day}
                    </Text>
                    <Switch
                      value={item.enabled}
                      onValueChange={() => toggleDay(index)}
                      trackColor={{ true: Colors.brand, false: Colors.borderLight }}
                      thumbColor={Colors.white}
                    />
                  </View>

                  {item.enabled && (
                    <View className="px-4 pb-3" style={{ backgroundColor: Colors.white }}>
                      <View className="flex-row gap-3 pt-3">
                        {/* From button */}
                        <TouchableOpacity
                          onPress={() => togglePicker(index, 'from')}
                          className="flex-1 rounded-xl py-2 items-center"
                          style={{
                            backgroundColor:
                              expandedDay === index && expandedField === 'from'
                                ? Colors.brand
                                : Colors.white,
                            borderWidth: 1,
                            borderColor:
                              expandedDay === index && expandedField === 'from'
                                ? Colors.brand
                                : Colors.borderLight,
                          }}
                        >
                          <Text
                            className="text-xs mb-0.5"
                            style={{
                              color:
                                expandedDay === index && expandedField === 'from'
                                  ? Colors.brandLight
                                  : Colors.textMuted,
                            }}
                          >
                            From
                          </Text>
                          <Text
                            className="text-sm font-bold"
                            style={{
                              color:
                                expandedDay === index && expandedField === 'from'
                                  ? Colors.white
                                  : Colors.brand,
                            }}
                          >
                            {fmtHour(item.from)}
                          </Text>
                        </TouchableOpacity>

                        <View className="justify-center">
                          <Text style={{ color: Colors.borderLight, fontWeight: 'bold' }}>→</Text>
                        </View>

                        {/* To button */}
                        <TouchableOpacity
                          onPress={() => togglePicker(index, 'to')}
                          className="flex-1 rounded-xl py-2 items-center"
                          style={{
                            backgroundColor:
                              expandedDay === index && expandedField === 'to'
                                ? Colors.brand
                                : Colors.white,
                            borderWidth: 1,
                            borderColor:
                              expandedDay === index && expandedField === 'to'
                                ? Colors.brand
                                : Colors.borderLight,
                          }}
                        >
                          <Text
                            className="text-xs mb-0.5"
                            style={{
                              color:
                                expandedDay === index && expandedField === 'to'
                                  ? Colors.brandLight
                                  : Colors.textMuted,
                            }}
                          >
                            To
                          </Text>
                          <Text
                            className="text-sm font-bold"
                            style={{
                              color:
                                expandedDay === index && expandedField === 'to'
                                  ? Colors.white
                                  : Colors.brand,
                            }}
                          >
                            {fmtHour(item.to)}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {expandedDay === index && expandedField === 'from' && (
                        <View className="mt-2">
                          <Text className="text-xs mb-1" style={{ color: Colors.textMuted }}>
                            Select start time
                          </Text>
                          <HourChips
                            value={item.from}
                            onChange={v => updateTime(index, 'from', v)}
                            maxHour={item.to - 1}
                          />
                        </View>
                      )}
                      {expandedDay === index && expandedField === 'to' && (
                        <View className="mt-2">
                          <Text className="text-xs mb-1" style={{ color: Colors.textMuted }}>
                            Select end time
                          </Text>
                          <HourChips
                            value={item.to}
                            onChange={v => updateTime(index, 'to', v)}
                            minHour={item.from + 1}
                          />
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}

              {/* Save button */}
              <TouchableOpacity
                onPress={() => onConfirm(schedule.filter(d => d.enabled))}
                className="mt-4 py-4 rounded-2xl items-center"
                style={{ backgroundColor: Colors.brand }}
              >
                <Text className="font-bold text-base" style={{ color: Colors.white }}>
                  Save My Schedule
                </Text>
              </TouchableOpacity>

              {/* Back link */}
              <TouchableOpacity onPress={() => setStep('choose')} className="mt-3 mb-8 items-center">
                <Text className="text-sm" style={{ color: Colors.textMuted }}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}