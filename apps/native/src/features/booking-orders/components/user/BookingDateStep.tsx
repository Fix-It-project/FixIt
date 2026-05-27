import { ActivityIndicator, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { CalendarPicker } from "@/src/components/ui/calendar-picker";
import { Text } from "@/src/components/ui/text";
import { useAvailabilityMarks } from "@/src/features/booking-orders/hooks/useAvailabilityMarks";
import { useTechnicianPublicSchedule } from "@/src/features/booking-orders/hooks/usePublicSchedule";
import {
	elevation,
	shadowStyle,
	useThemeColors,
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
	const { templates, exceptions, isLoading } =
		useTechnicianPublicSchedule(technicianId);
	const markedDates = useAvailabilityMarks(templates, exceptions, selectedDate);
	// Cap the calendar at the same 3-month window useAvailabilityMarks evaluates,
	// so days the availability logic never marked can't be tapped.
	const maxDate = new Date();
	maxDate.setMonth(maxDate.getMonth() + 3);
	const maxDateIso = maxDate.toISOString().split("T")[0];

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color={themeColors.primary} />
			</View>
		);
	}

	// A technician with no availability templates hasn't set a schedule yet —
	// block booking entirely instead of leaving every calendar day selectable.
	if (templates.length === 0) {
		return (
			<View className="flex-1 items-center justify-center px-card">
				<Text variant="h3" className="text-center text-content">
					No availability yet
				</Text>
				<Text
					variant="bodySm"
					className="mt-stack-xs text-center text-content-muted"
				>
					{technicianName} hasn't set up a schedule yet, so there are no dates
					to book. Please check back later or pick another technician.
				</Text>
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
				<CalendarPicker
					minDate={new Date().toISOString().split("T")[0]}
					maxDate={maxDateIso}
					onDateSelect={onDateSelect}
					markedDates={markedDates}
					markingType="custom"
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
