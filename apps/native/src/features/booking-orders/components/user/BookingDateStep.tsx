import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useAvailabilityMarks } from "@/src/features/booking-orders/hooks/useAvailabilityMarks";
import { useTechnicianPublicSchedule } from "@/src/features/booking-orders/hooks/usePublicSchedule";
import {
	elevation,
	getCalendarTheme,
	shadowStyle,
	useThemeColors,
	useThemeTokens,
} from "@/src/lib/theme";

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
		<View className="flex-1 px-card pt-card">
			<View className="mb-stack-lg">
				<Text variant="h3" className="text-content">
					Select a Date
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-content-muted">
					Choose an available date for your booking with {technicianName}
				</Text>
			</View>

			<View
				className="overflow-hidden rounded-card bg-surface"
				style={shadowStyle(elevation.raised, {
					shadowColor: themeColors.shadow,
				})}
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
				<View className="mt-stack-md rounded-input bg-app-primary-light px-card py-stack-md">
					<Text variant="buttonMd" className="text-center text-app-primary">
						Selected: {selectedDate}
					</Text>
				</View>
			)}

			<View className="flex-1 justify-end pb-stack-xl">
				<Button disabled={!selectedDate} onPress={onNext} className="w-full">
					<Text variant="buttonLg" className="text-surface-on-primary">
						Next
					</Text>
				</Button>
			</View>
		</View>
	);
}
