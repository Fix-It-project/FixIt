import { router } from "expo-router";
import { Clock3 } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { formatTime } from "@/src/features/booking-orders/utils/booking-helpers";
import { getOrderStatusBadge } from "@/src/features/booking-orders/utils/order-status-ui";
import type { ScheduledEvent } from "@/src/features/schedule/schemas/response.schema";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";
import { useThemeColors } from "@/src/constants/design-tokens";

interface ScheduleOrderCardProps {
	readonly order: ScheduledEvent;
}

export default function ScheduleOrderCard({ order }: ScheduleOrderCardProps) {
	const themeColors = useThemeColors();
	const goToBooking = useDebounce(() =>
		router.push(ROUTES.technician.bookingDetail(order.id)),
	);
	const scheduledTime = formatTime(order.scheduled_start_at);
	const { color, label } = getOrderStatusBadge(
		order.status,
		themeColors,
		"technician",
	);

	return (
		<View className="mb-stack-md rounded-button border border-edge bg-surface p-card-compact">
			{/* Status badge */}
			<View className="mb-stack-sm flex-row items-center justify-start">
				<View
					className="rounded-compact px-stack-sm py-stack-xs"
					style={{ backgroundColor: `${color}1A` }}
				>
					<Text variant="caption" className="font-bold" style={{ color }}>
						{label}
					</Text>
				</View>
			</View>

			{/* Primary Description */}
			{order.problem_description ? (
				<Text
					variant="bodySm"
					className="font-medium"
					style={{ color: themeColors.textPrimary }}
					numberOfLines={3}
				>
					{order.problem_description}
				</Text>
			) : (
				<Text
					variant="bodySm"
					className="italic"
					style={{ color: themeColors.textMuted }}
				>
					No description provided.
				</Text>
			)}

			{scheduledTime ? (
				<View className="mt-stack-sm flex-row items-center gap-stack-xs">
					<Clock3 size={14} color={themeColors.textMuted} strokeWidth={2} />
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{scheduledTime}
					</Text>
				</View>
			) : null}

			{/* Active indicator */}
			{order.active && (
				<View className="mt-stack-md flex-row items-center justify-between gap-stack-md">
					<View className="flex-row items-center gap-stack-xs">
						<View
							className="h-status-dot-sm w-status-dot-sm rounded-pill"
							style={{ backgroundColor: themeColors.successAlt }}
						/>
						<Text
							variant="caption"
							className="font-semibold"
							style={{ color: themeColors.successAlt }}
						>
							Active booking
						</Text>
					</View>

					<Button variant="outline" size="sm" onPress={goToBooking}>
						View details
					</Button>
				</View>
			)}
		</View>
	);
}
