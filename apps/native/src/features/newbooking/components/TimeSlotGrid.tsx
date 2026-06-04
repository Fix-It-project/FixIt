import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	BOOKING_SLOT_OPTIONS,
	type BookingSlotOption,
} from "@/src/features/booking-orders/utils/fixed-slots";
import {
	type DayTemplate,
	getDayOfWeek,
	getDayTemplates,
	isDayUnavailable,
	isSlotAvailable,
} from "@/src/features/booking-orders/utils/slot-availability";

const MORNING = BOOKING_SLOT_OPTIONS.filter((s) => s.hour < 12);
const EVENING = BOOKING_SLOT_OPTIONS.filter((s) => s.hour >= 12);

interface TimeSlotGridProps {
	readonly selectedDate: string | null;
	readonly templates: readonly DayTemplate[];
	readonly exceptions: readonly { date: string }[];
	readonly bookedSlots: readonly { date: string; slot_hour: number }[];
	readonly selectedHour: number | null;
	readonly onSelect: (hour: number) => void;
}

interface SlotChipProps {
	readonly option: BookingSlotOption;
	readonly isSelected: boolean;
	readonly isBooked: boolean;
	readonly isAvailable: boolean;
	readonly onSelect: (hour: number) => void;
}

function SlotChip({
	option,
	isSelected,
	isBooked,
	isAvailable,
	onSelect,
}: SlotChipProps) {
	const themeColors = useThemeColors();
	const disabled = !isAvailable || isBooked;

	return (
		<TouchableOpacity
			onPress={() => onSelect(option.hour)}
			disabled={disabled}
			activeOpacity={0.8}
			className={`min-w-[30%] grow basis-[30%] items-center rounded-card border px-card py-stack-md ${
				isSelected ? "bg-app-primary-light" : "bg-card"
			}`}
			style={{
				borderColor: isSelected
					? themeColors.primary
					: themeColors.borderDefault,
				opacity: disabled ? 0.4 : 1,
			}}
		>
			<Text
				variant="buttonMd"
				className={isSelected ? "text-app-primary" : "text-content"}
			>
				{option.label}
			</Text>
			{isBooked ? (
				<Text variant="caption" className="text-content-muted">
					Booked
				</Text>
			) : null}
		</TouchableOpacity>
	);
}

export function TimeSlotGrid({
	selectedDate,
	templates,
	exceptions,
	bookedSlots,
	selectedHour,
	onSelect,
}: TimeSlotGridProps) {
	const dayTemplates = useMemo(() => {
		if (!selectedDate) return [];
		return getDayTemplates(templates, getDayOfWeek(selectedDate));
	}, [templates, selectedDate]);

	const exceptionDates = useMemo(
		() => new Set(exceptions.map((e) => e.date)),
		[exceptions],
	);

	const bookedHours = useMemo(() => {
		if (!selectedDate) return new Set<number>();
		const set = new Set<number>();
		for (const slot of bookedSlots) {
			if (slot.date === selectedDate) set.add(slot.slot_hour);
		}
		return set;
	}, [bookedSlots, selectedDate]);

	if (!selectedDate) {
		return (
			<View className="items-center rounded-card bg-surface-elevated px-card py-card">
				<Text variant="bodySm" className="text-content-muted">
					Pick a date to see available times.
				</Text>
			</View>
		);
	}

	const dayBlocked = isDayUnavailable(
		selectedDate,
		dayTemplates,
		exceptionDates,
	);

	if (dayBlocked) {
		return (
			<View className="rounded-card bg-app-primary-light px-card py-stack-md">
				<Text variant="buttonMd" className="text-center text-app-primary">
					No available times on this day. Please pick another date.
				</Text>
			</View>
		);
	}

	const renderRow = (options: readonly BookingSlotOption[]) => (
		<View className="flex-row flex-wrap gap-stack-sm">
			{options.map((option) => (
				<SlotChip
					key={option.hour}
					option={option}
					isSelected={selectedHour === option.hour}
					isBooked={bookedHours.has(option.hour)}
					isAvailable={isSlotAvailable(dayTemplates, option.hour)}
					onSelect={onSelect}
				/>
			))}
		</View>
	);

	return (
		<View className="gap-stack-md">
			{MORNING.length > 0 ? (
				<View className="gap-stack-sm">
					<Text variant="label" className="text-content-secondary">
						Morning
					</Text>
					{renderRow(MORNING)}
				</View>
			) : null}
			{EVENING.length > 0 ? (
				<View className="gap-stack-sm">
					<Text variant="label" className="text-content-secondary">
						Afternoon
					</Text>
					{renderRow(EVENING)}
				</View>
			) : null}
		</View>
	);
}
