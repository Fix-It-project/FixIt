import { CalendarOff, CalendarX2, CheckCircle2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation("technician");
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
			) : null}
			{!hasOrders && isException ? (
				<EmptyState
					icon={CalendarOff}
					tint={themeColors.statusUnavailable}
					title={t("schedule.day.markedUnavailableTitle")}
					subtitle={t("schedule.day.markedUnavailableBody")}
					action={
						<Button
							variant="secondary"
							size="md"
							loading={isMutating}
							onPress={onRemoveException}
						>
							<Text variant="buttonMd" className="text-foreground">
								{t("schedule.day.makeAvailable")}
							</Text>
						</Button>
					}
				/>
			) : null}
			{!hasOrders && !isException && isPast ? (
				<EmptyState
					icon={CalendarX2}
					tint={themeColors.textMuted}
					title={t("schedule.day.pastTitle")}
					subtitle={t("schedule.day.pastBody")}
				/>
			) : null}
			{!hasOrders && !isException && !isPast && !isWorkingDay ? (
				<EmptyState
					icon={CalendarOff}
					tint={themeColors.textMuted}
					title={t("schedule.day.notWorkingTitle")}
					subtitle={t("schedule.day.notWorkingBody")}
				/>
			) : null}
			{!hasOrders && !isException && !isPast && isWorkingDay ? (
				<EmptyState
					icon={CheckCircle2}
					tint={themeColors.success}
					title={t("schedule.day.noBookingsTitle")}
					subtitle={t("schedule.day.noBookingsBody")}
					action={
						<Button
							variant="secondary"
							size="md"
							loading={isMutating}
							onPress={onMarkUnavailable}
						>
							<Text variant="buttonMd" className="text-foreground">
								{t("schedule.day.markUnavailable")}
							</Text>
						</Button>
					}
				/>
			) : null}
		</View>
	);
}
