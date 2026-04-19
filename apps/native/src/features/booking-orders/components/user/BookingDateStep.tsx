import { ActivityIndicator, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useTechnicianPublicSchedule } from "@/src/features/booking-orders/hooks/usePublicSchedule";
import { useAvailabilityMarks } from "@/src/features/booking-orders/hooks/useAvailabilityMarks";
import {
  getCalendarTheme,
  useThemeColors,
  useThemeTokens,
} from "@/src/lib/theme";
import { useMemo } from "react";

interface BookingDateStepProps {
  readonly technicianId: string;
  readonly technicianName: string;
  readonly selectedDate: string | null;
  readonly onDateSelect: (date: string) => void;
  readonly onNext: () => void;
}

export default function BookingDateStep({
  technicianId,
  technicianName,
  selectedDate,
  onDateSelect,
  onNext,
}: BookingDateStepProps) {
  const themeColors = useThemeColors();
  const themeTokens = useThemeTokens();
  const { templates, exceptions, isLoading } =
    useTechnicianPublicSchedule(technicianId);
  const markedDates = useAvailabilityMarks(templates, exceptions, selectedDate);
  const calendarTheme = useMemo(
    () => getCalendarTheme(themeTokens),
    [themeTokens.id],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-4">
      <View className="mb-4">
        <Text
          className="font-bold text-[18px] text-content"
          style={{ fontFamily: "GoogleSans_700Bold" }}
        >
          Select a Date
        </Text>
        <Text className="mt-1 text-[13px] text-content-muted">
          Choose an available date for your booking with {technicianName}
        </Text>
      </View>

      <View
        className="overflow-hidden rounded-2xl bg-surface"
        style={{ elevation: 2 }}
      >
        <Calendar
          minDate={new Date().toISOString().split("T")[0]}
          onDayPress={(day: DateData) => onDateSelect(day.dateString)}
          markedDates={markedDates}
          markingType="custom"
          theme={calendarTheme}
        />
      </View>

      {selectedDate && (
        <View className="mt-3 rounded-xl bg-app-primary-light px-4 py-2.5">
          <Text
            className="text-center font-semibold text-[13px] text-app-primary"
            style={{ fontFamily: "GoogleSans_600SemiBold" }}
          >
            Selected: {selectedDate}
          </Text>
        </View>
      )}

      <View className="flex-1 justify-end pb-6">
        <Button disabled={!selectedDate} onPress={onNext} className="w-full">
          <Text className="font-semibold text-[15px] text-white">Next</Text>
        </Button>
      </View>
    </View>
  );
}
