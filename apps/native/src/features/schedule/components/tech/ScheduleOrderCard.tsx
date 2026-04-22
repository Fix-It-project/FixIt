import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { ScheduledEvent } from "@/src/features/schedule/schemas/response.schema";
import { useThemeColors } from "@/src/lib/theme";

export const STATUS_LABEL: Record<ScheduledEvent["status"], string> = {
	pending: "Pending",
	accepted: "Accepted",
	rejected: "Rejected",
	cancelled_by_user: "Cancelled by user",
	cancelled_by_technician: "Cancelled by you",
	completed: "Completed",
};

interface ScheduleOrderCardProps {
	readonly order: ScheduledEvent;
}

export default function ScheduleOrderCard({ order }: ScheduleOrderCardProps) {
	const themeColors = useThemeColors();

	const STATUS_COLOR: Record<ScheduledEvent["status"], string> = {
		pending: themeColors.warning,
		accepted: themeColors.successAlt,
		rejected: themeColors.danger,
		cancelled_by_user: themeColors.textMuted,
		cancelled_by_technician: themeColors.textMuted,
		completed: themeColors.primary,
	};

	const color = STATUS_COLOR[order.status];
	const label = STATUS_LABEL[order.status];

	return (
		<View
			className="mb-2.5 rounded-button bg-surface p-card-compact"
			style={{
				borderWidth: 1,
				borderColor: themeColors.borderDefault,
			}}
		>
			{/* Status badge */}
			<View className="mb-2 flex-row items-center justify-start">
				<View
					className="rounded-lg px-2 py-1"
					style={{ backgroundColor: color + "1A" }}
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
				<View className="mt-2.5 flex-row items-center gap-1">
					<View
						className="h-2 w-2 rounded-full"
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
