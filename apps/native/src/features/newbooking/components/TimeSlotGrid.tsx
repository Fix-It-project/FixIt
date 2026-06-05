import { useMemo } from "react";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Text } from "@/src/components/ui/text";
import {
	DUR_SLOT_REVEAL,
	EASE_OUT_QUART,
	ENTRANCE_STAGGER,
} from "@/src/constants/animation";
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
	readonly index: number;
	readonly reducedMotion: boolean;
	readonly onSelect: (hour: number) => void;
}

function SlotChip({
	option,
	isSelected,
	isBooked,
	isAvailable,
	index,
	reducedMotion,
	onSelect,
}: SlotChipProps) {
	const themeColors = useThemeColors();
	const disabled = !isAvailable || isBooked;

	return (
		<Animated.View
			className="min-w-[30%] grow basis-[30%]"
			entering={
				reducedMotion
					? undefined
					: FadeInDown.delay(index * ENTRANCE_STAGGER)
							.duration(DUR_SLOT_REVEAL)
							.easing(EASE_OUT_QUART)
			}
		>
			<PressableScale
				onPress={() => onSelect(option.hour)}
				disabled={disabled}
				pressedScale={0.965}
				testID={disabled ? undefined : "time-slot"}
				className={`items-center rounded-card border px-card py-stack-md ${
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
			</PressableScale>
		</Animated.View>
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
	const reducedMotion = useReducedMotion();
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
			<Animated.View
				entering={
					reducedMotion
						? undefined
						: FadeInDown.duration(DUR_SLOT_REVEAL).easing(EASE_OUT_QUART)
				}
				className="items-center rounded-card bg-surface-elevated px-card py-card"
			>
				<Text variant="bodySm" className="text-content-muted">
					Pick a date to see available times.
				</Text>
			</Animated.View>
		);
	}

	const dayBlocked = isDayUnavailable(
		selectedDate,
		dayTemplates,
		exceptionDates,
	);

	if (dayBlocked) {
		return (
			<Animated.View
				entering={
					reducedMotion
						? undefined
						: FadeInDown.duration(DUR_SLOT_REVEAL).easing(EASE_OUT_QUART)
				}
				className="rounded-card bg-app-primary-light px-card py-stack-md"
			>
				<Text variant="buttonMd" className="text-center text-app-primary">
					No available times on this day. Please pick another date.
				</Text>
			</Animated.View>
		);
	}

	const renderRow = (options: readonly BookingSlotOption[], offset: number) => (
		<View className="flex-row flex-wrap gap-stack-sm">
			{options.map((option, index) => (
				<SlotChip
					key={option.hour}
					option={option}
					isSelected={selectedHour === option.hour}
					isBooked={bookedHours.has(option.hour)}
					isAvailable={isSlotAvailable(dayTemplates, option.hour)}
					index={offset + index}
					reducedMotion={reducedMotion}
					onSelect={onSelect}
				/>
			))}
		</View>
	);

	return (
		<View className="gap-stack-md">
			{MORNING.length > 0 ? (
				<View key={`morning-${selectedDate}`} className="gap-stack-sm">
					<Text variant="label" className="text-content-secondary">
						Morning
					</Text>
					{renderRow(MORNING, 0)}
				</View>
			) : null}
			{EVENING.length > 0 ? (
				<View key={`evening-${selectedDate}`} className="gap-stack-sm">
					<Text variant="label" className="text-content-secondary">
						Afternoon
					</Text>
					{renderRow(EVENING, MORNING.length)}
				</View>
			) : null}
		</View>
	);
}
