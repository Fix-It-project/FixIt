import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Switch,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/lib/theme';
import { useThemeColors } from '@/src/lib/theme';
import type { DaySchedule } from '@/src/features/schedule/types/calendar';

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const themeColors = useThemeColors();

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
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (step === 'custom' && !isEditing) setStep('choose');
        else if (onDismiss) onDismiss();
        else router.back();
      }}
    >
      <View
        className="flex-1 items-center justify-center px-4 py-6"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
      >
        <Pressable
          className="absolute inset-0"
          onPress={() => {
            if (step === 'custom' && !isEditing) setStep('choose');
            else if (onDismiss) onDismiss();
            else router.back();
          }}
        />

        <View
          className="w-full overflow-hidden rounded-3xl"
          style={{
            backgroundColor: themeColors.surfaceBase,
            maxWidth: 520,
            maxHeight: Math.min(screenHeight * 0.88, 720),
            width: Math.min(screenWidth - 32, 520),
            shadowColor: Colors.shadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 18,
            elevation: 16,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 24, paddingBottom: 28 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="mb-1 font-bold text-2xl text-content">
              {isEditing ? 'Edit Schedule' : 'Set Your Schedule'}
            </Text>
            <Text className="mb-6 text-sm text-content-muted">
              Define your weekly availability. It repeats every week.
            </Text>

            {step === 'choose' ? (
              <View className="gap-4">
                <TouchableOpacity
                  onPress={() => onConfirm(DEFAULT_SCHEDULE)}
                  className="rounded-2xl border-2 p-5"
                  style={{ borderColor: Colors.primary, backgroundColor: themeColors.primaryLight }}
                >
                  <Text className="mb-1 text-base font-bold" style={{ color: Colors.primary }}>
                    Default Schedule
                  </Text>
                  <Text className="text-sm text-content-secondary">
                    Sunday – Thursday.{'\n'}
                    Applied automatically every week.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep('custom')}
                  className="rounded-2xl border-2 p-5"
                  style={{ borderColor: themeColors.borderDefault, backgroundColor: themeColors.surfaceElevated }}
                >
                  <Text className="mb-1 text-base font-bold text-content">
                    Custom Schedule
                  </Text>
                  <Text className="text-sm text-content-secondary">
                    Pick your working days.{'\n'}
                    Repeats weekly throughout the year.
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text
                  className="mb-3 mt-2 text-base font-semibold text-content-secondary"
                >
                  Working days
                </Text>

                {schedule.map((item, index) => (
                  <View
                    key={item.day_of_week}
                    className="mb-3 overflow-hidden rounded-2xl"
                    style={{
                      borderWidth: 1,
                      borderColor: item.enabled ? Colors.primary : themeColors.borderDefault,
                    }}
                  >
                    <View
                      className="flex-row items-center justify-between px-4 py-3"
                      style={{
                        backgroundColor: item.enabled ? themeColors.primaryLight : themeColors.surfaceElevated,
                      }}
                    >
                      <Text
                        className="text-base font-semibold"
                        style={{ color: item.enabled ? themeColors.textPrimary : themeColors.textMuted }}
                      >
                        {item.dayName}
                      </Text>
                      <Switch
                        value={item.enabled}
                        onValueChange={() => toggleDay(index)}
                        trackColor={{ true: Colors.primary, false: themeColors.borderDefault }}
                        thumbColor={themeColors.surfaceBase}
                      />
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => onConfirm(schedule)}
                  disabled={isLoading}
                  className="mt-6 items-center rounded-2xl py-4"
                  style={{ backgroundColor: isLoading ? themeColors.borderDefault : Colors.primary }}
                >
                  <Text
                    className="text-base font-bold"
                    style={{ color: isLoading ? themeColors.textMuted : themeColors.surfaceBase }}
                  >
                    {isLoading ? 'Saving...' : 'Save My Schedule'}
                  </Text>
                </TouchableOpacity>

                {!isEditing && (
                  <TouchableOpacity
                    onPress={() => setStep('choose')}
                    className="mb-2 mt-4 items-center"
                  >
                    <Text className="text-sm text-content-muted">
                      Back
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
