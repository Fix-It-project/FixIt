import { CalendarOff, CalendarX2, CheckCircle2 } from "lucide-react-native";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "@/src/components/ui/button";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import {
	DUR_SLOT_REVEAL,
	EASE_OUT_QUART,
	ENTRANCE_STAGGER,
} from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import type { TechnicianBooking } from "@/src/schemas/technician-order.schema";
import { formatLongDate } from "../utils/format";
import { ScheduleOrderCard } from "./ScheduleOrderCard";

interface ScheduleDayPanelProps {
	readonly selectedDate: string;
	readonly today: string;
	readonly orders: readonly TechnicianBooking[];
	readonly isWorkingDay: boolean;
	readonly exceptionId: string | null;
	readonly onMarkUnavailable: () => void;
	readonly onRemoveException: () => void;
	readonly isMutating: boolean;
}

function EmptyState({
	icon,
	tint,
	title,
	subtitle,
	action,
}: {
	readonly icon: typeof CalendarOff;
	readonly tint: string;
	readonly title: string;
	readonly subtitle: string;
	readonly action?: React.ReactNode;
}) {
	return (
		<View className="items-center gap-stack-sm rounded-card bg-card px-card py-card-roomy">
			<Icon as={icon} size={28} color={tint} strokeWidth={1.8} />
			<Text variant="label" className="font-bold text-content">
				{title}
			</Text>
			<Text variant="caption" className="text-center text-content-muted">
				{subtitle}
			</Text>
			{action}
		</View>
	);
}

/** Selected-day detail: bookings list, or mark/un-mark unavailable. */
export function ScheduleDayPanel({
	selectedDate,
	today,
	orders,
	isWorkingDay,
	exceptionId,
	onMarkUnavailable,
	onRemoveException,
	isMutating,
}: ScheduleDayPanelProps) {
	const themeColors = useThemeColors();
	const isPast = selectedDate < today;
	const isException = exceptionId != null;
	const hasOrders = orders.length > 0;

	return (
		<View className="gap-stack-sm px-screen-x pt-stack-md">
			<Text variant="label" className="font-bold text-content">
				{formatLongDate(selectedDate)}
			</Text>

			{hasOrders ? (
				<View className="gap-stack-sm">
					{orders.map((order, i) => (
						<Animated.View
							key={order.id}
							entering={FadeInDown.delay(i * ENTRANCE_STAGGER)
								.duration(DUR_SLOT_REVEAL)
								.easing(EASE_OUT_QUART)}
						>
							<ScheduleOrderCard booking={order} />
						</Animated.View>
					))}
				</View>
			) : isException ? (
				<EmptyState
					icon={CalendarOff}
					tint={themeColors.statusUnavailable}
					title="Marked unavailable"
					subtitle="You won't receive bookings on this day."
					action={
						<Button
							variant="secondary"
							size="md"
							loading={isMutating}
							onPress={onRemoveException}
						>
							<Text variant="buttonMd" className="text-foreground">
								Make available
							</Text>
						</Button>
					}
				/>
			) : isPast ? (
				<EmptyState
					icon={CalendarX2}
					tint={themeColors.textMuted}
					title="Past day"
					subtitle="No bookings were scheduled."
				/>
			) : !isWorkingDay ? (
				<EmptyState
					icon={CalendarOff}
					tint={themeColors.textMuted}
					title="Not a working day"
					subtitle="Add this weekday from Edit schedule to take bookings."
				/>
			) : (
				<EmptyState
					icon={CheckCircle2}
					tint={themeColors.success}
					title="No bookings"
					subtitle="This day is open. Mark it unavailable if you're off."
					action={
						<Button
							variant="secondary"
							size="md"
							loading={isMutating}
							onPress={onMarkUnavailable}
						>
							<Text variant="buttonMd" className="text-foreground">
								Mark as unavailable
							</Text>
						</Button>
					}
				/>
			)}
		</View>
	);
}
