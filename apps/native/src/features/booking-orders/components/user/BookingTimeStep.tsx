import { useEffect, useMemo } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useTechnicianPublicSchedule } from "@/src/features/booking-orders/hooks/usePublicSchedule";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { BOOKING_SLOT_OPTIONS } from "@/src/features/booking-orders/utils/fixed-slots";
import { useThemeColors } from "@/src/constants/design-tokens";

interface BookingTimeStepProps {
	readonly technicianId: string;
	readonly technicianName: string;
	readonly selectedDate: string;
	readonly selectedTime: string | null;
	readonly onTimeSelect: (time: string | null) => void;
	readonly onNext: () => void;
}

export default function BookingTimeStep({
	technicianId,
	technicianName,
	selectedDate,
	selectedTime,
	onTimeSelect,
	onNext,
}: BookingTimeStepProps) {
	const themeColors = useThemeColors();
	const { templates, exceptions, isLoading } =
		useTechnicianPublicSchedule(technicianId);

	const exceptionDateSet = useMemo(
		() => new Set(exceptions.map((exception) => exception.date)),
		[exceptions],
	);

	const selectedDayOfWeek = useMemo(
		() => new Date(`${selectedDate}T00:00:00`).getDay(),
		[selectedDate],
	);

	const dayTemplates = useMemo(
		() => templates.filter((template) => template.day_of_week === selectedDayOfWeek),
		[selectedDayOfWeek, templates],
	);

	const isDayUnavailable =
		exceptionDateSet.has(selectedDate) || !dayTemplates.some((t) => t.active);

	const isSlotAvailable = (slotHour: number): boolean => {
		if (isDayUnavailable) return false;
		const slotTemplates = dayTemplates.filter((t) => t.slot_hour === slotHour);
		if (slotTemplates.length > 0) {
			return slotTemplates.some((template) => template.active);
		}
		const dayLevelTemplates = dayTemplates.filter(
			(template) => template.slot_hour == null,
		);
		if (dayLevelTemplates.length > 0) {
			return dayLevelTemplates.some((template) => template.active);
		}
		return false;
	};

	const selectedOption = selectedTime
		? BOOKING_SLOT_OPTIONS.find((slot) => slot.value === selectedTime)
		: null;
	const isSelectedTimeAvailable = selectedOption
		? isSlotAvailable(selectedOption.hour)
		: false;

	useEffect(() => {
		if (!selectedTime) return;
		if (!isSelectedTimeAvailable) {
			onTimeSelect(null);
		}
	}, [isSelectedTimeAvailable, onTimeSelect, selectedTime]);

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
					Select a Time
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-content-muted">
					Choose a booking slot for {selectedDate}
				</Text>
			</View>

			{isDayUnavailable ? (
				<View className="mb-stack-md rounded-input bg-app-primary-light px-card py-stack-md">
					<Text variant="buttonMd" className="text-center text-app-primary">
						{`${technicianName} is unavailable on this date. Please pick another date.`}
					</Text>
				</View>
			) : null}

			<View className="gap-stack-sm">
				{BOOKING_SLOT_OPTIONS.map((slot) => {
					const isSelected = selectedTime === slot.value;
					const isAvailable = isSlotAvailable(slot.hour);
					const isDisabled = !isAvailable;
					return (
						<TouchableOpacity
							key={slot.value}
							onPress={() => onTimeSelect(slot.value)}
							disabled={isDisabled}
							activeOpacity={0.8}
							className={`rounded-card border px-card py-stack-md ${
								isSelected ? "bg-app-primary-light" : "bg-surface"
							}`}
							style={{
								borderColor: isSelected
									? themeColors.primary
									: themeColors.borderDefault,
								opacity: isDisabled ? 0.45 : 1,
							}}
						>
							<Text
								variant="buttonLg"
								className={isSelected ? "text-app-primary" : "text-content"}
							>
								{slot.label}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			<View className="flex-1 justify-end pb-stack-xl">
				<Button
					disabled={!selectedTime || isDayUnavailable || !isSelectedTimeAvailable}
					onPress={onNext}
					className="w-full"
				>
					<Text variant="buttonLg" className="text-surface-on-primary">
						Next
					</Text>
				</Button>
			</View>
		</View>
	);
}
