import { View, ActivityIndicator } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { Text } from "@/src/components/ui/text";
import { Button } from "@/src/components/ui/button";
import { Colors } from "@/src/lib/colors";
import { useTechnicianPublicSchedule } from "@/src/hooks/tech/usePublicSchedule";
import { useAvailabilityMarks } from "@/src/hooks/user/useAvailabilityMarks";

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
  const { templates, exceptions, isLoading } = useTechnicianPublicSchedule(technicianId);
  const markedDates = useAvailabilityMarks(templates, exceptions, selectedDate);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-4">
      <View className="mb-4">
        <Text
          className="text-[18px] font-bold text-content"
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
          theme={{
            todayTextColor: Colors.primary,
            arrowColor: Colors.primary,
            textDisabledColor: Colors.borderDefault,
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: Colors.surfaceBase,
            dayTextColor: Colors.textPrimary,
            calendarBackground: Colors.surfaceBase,
            // @ts-expect-error: undocumented but supported calendar theme override
            "stylesheet.day.basic": {
              base: {
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
              },
            },
          }}
        />
      </View>

      {selectedDate && (
        <View className="mt-3 rounded-xl bg-app-primary-light px-4 py-2.5">
          <Text
            className="text-center text-[13px] font-semibold text-app-primary"
            style={{ fontFamily: "GoogleSans_600SemiBold" }}
          >
            Selected: {selectedDate}
          </Text>
        </View>
      )}

      <View className="flex-1 justify-end pb-6">
        <Button
          disabled={!selectedDate}
          onPress={onNext}
          className="w-full"
        >
          <Text className="text-[15px] font-semibold text-white">Next</Text>
        </Button>
      </View>
    </View>
  );
}
