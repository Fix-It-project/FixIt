import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { getOrderStatusBadge } from "@/src/lib/order-status";
import type { ScheduledEvent } from "@/src/features/schedule/schemas/response.schema";
import { useThemeColors } from "@/src/lib/theme";

interface ScheduleOrderCardProps {
	readonly order: ScheduledEvent;
}

export default function ScheduleOrderCard({ order }: ScheduleOrderCardProps) {
	const themeColors = useThemeColors();
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

			{/* Active indicator */}
			{order.active && (
				<View className="mt-stack-md flex-row items-center gap-stack-xs">
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
			)}
		</View>
	);
}
