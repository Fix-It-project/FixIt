import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/lib/colors';
import type { DaySchedule } from '@/src/services/tech-calendar/types/calendar';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((dayName, i) => ({
  day_of_week: i,
  dayName,
  enabled: i >= 0 && i <= 4, // Sun-Thu default
}));

interface Props {
  visible: boolean;
  onConfirm: (schedule: DaySchedule[]) => void;
  onDismiss?: () => void;
  existingSchedule?: DaySchedule[];
  isLoading?: boolean;
}

export default function ScheduleSetupModal({
  visible,
  onConfirm,
  onDismiss,
  existingSchedule,
  isLoading,
}: Props) {
  // If the technician already has a schedule, skip straight to the day-picker.
  // The "choose" step (Default vs Custom) is only for first-time setup.
  const isEditing = !!existingSchedule;
  const [step, setStep] = useState<'choose' | 'custom'>(isEditing ? 'custom' : 'choose');
  const [schedule, setSchedule] = useState<DaySchedule[]>(existingSchedule ?? DEFAULT_SCHEDULE);
  const router = useRouter();

  // Sync state whenever the modal opens or existingSchedule changes.
  useEffect(() => {
    if (visible) {
      const editing = !!existingSchedule;
      setStep(editing ? 'custom' : 'choose');
      setSchedule(existingSchedule ?? DEFAULT_SCHEDULE);
    }
  }, [visible, existingSchedule]);

  // Android hardware back button
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      // Only allow going back to "choose" during first-time setup, not while editing.
      if (step === 'custom' && !isEditing) {
        setStep('choose');
        return true;
      }
      if (onDismiss) onDismiss();
      else router.back();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [visible, step, isEditing, onDismiss, router]);

  const toggleDay = (index: number) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, enabled: !d.enabled } : d))
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (step === 'custom' && !isEditing) setStep('choose');
        else if (onDismiss) onDismiss();
        else router.back();
      }}
    >
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: Colors.white }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-6">
          <Text className="text-2xl font-bold mb-1" style={{ color: Colors.textPrimary }}>
            {isEditing ? 'Edit Schedule' : 'Set Your Schedule'}
          </Text>
          <Text className="text-sm mb-6" style={{ color: Colors.textMuted }}>
            Define your weekly availability. It repeats every week.
          </Text>

          {step === 'choose' ? (
            <View className="gap-4">
              {/* Default Schedule */}
              <TouchableOpacity
                onPress={() => onConfirm(DEFAULT_SCHEDULE)}
                className="p-5 rounded-2xl border-2"
                style={{ borderColor: Colors.brand, backgroundColor: Colors.brandLight }}
              >
                <Text className="text-base font-bold mb-1" style={{ color: Colors.brand }}>
                  ⚡ Default Schedule
                </Text>
                <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                  Sunday – Thursday.{'\n'}
                  Applied automatically every week.
                </Text>
              </TouchableOpacity>

              {/* Custom Schedule */}
              <TouchableOpacity
                onPress={() => setStep('custom')}
                className="p-5 rounded-2xl border-2"
                style={{ borderColor: Colors.borderLight, backgroundColor: Colors.surfaceGray }}
              >
                <Text className="text-base font-bold mb-1" style={{ color: Colors.textPrimary }}>
                  🛠 Custom Schedule
                </Text>
                <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                  Pick your working days.{'\n'}
                  Repeats weekly throughout the year.
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text
                className="text-base font-semibold mb-3 mt-2"
                style={{ color: Colors.textSecondary }}
              >
                Working days
              </Text>

              {schedule.map((item, index) => (
                <View
                  key={item.day_of_week}
                  className="mb-3 rounded-2xl overflow-hidden"
                  style={{
                    borderWidth: 1,
                    borderColor: item.enabled ? Colors.brand : Colors.borderLight,
                  }}
                >
                  <View
                    className="flex-row items-center justify-between px-4 py-3"
                    style={{
                      backgroundColor: item.enabled ? Colors.brandLight : Colors.surfaceGray,
                    }}
                  >
                    <Text
                      className="text-base font-semibold"
                      style={{ color: item.enabled ? Colors.textPrimary : Colors.textMuted }}
                    >
                      {item.dayName}
                    </Text>
                    <Switch
                      value={item.enabled}
                      onValueChange={() => toggleDay(index)}
                      trackColor={{ true: Colors.brand, false: Colors.borderLight }}
                      thumbColor={Colors.white}
                    />
                  </View>
                </View>
              ))}

              {/* Save */}
              <TouchableOpacity
                onPress={() => onConfirm(schedule)}
                disabled={isLoading}
                className="mt-6 py-4 rounded-2xl items-center"
                style={{ backgroundColor: isLoading ? Colors.borderLight : Colors.brand }}
              >
                <Text
                  className="font-bold text-base"
                  style={{ color: isLoading ? Colors.textMuted : Colors.white }}
                >
                  {isLoading ? 'Saving...' : 'Save My Schedule'}
                </Text>
              </TouchableOpacity>

              {/* Back — only shown during first-time setup, not while editing */}
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setStep('choose')}
                  className="mt-4 mb-8 items-center"
                >
                  <Text className="text-sm" style={{ color: Colors.textMuted }}>
                    ← Back
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}