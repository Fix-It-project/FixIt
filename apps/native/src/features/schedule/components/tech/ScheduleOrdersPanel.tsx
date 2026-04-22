import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { ScheduledEvent } from "@/src/features/schedule/schemas/response.schema";
import { useThemeColors } from "@/src/lib/theme";
import ScheduleOrderCard from "./ScheduleOrderCard";

interface ScheduleOrdersPanelProps {
	readonly orders: ScheduledEvent[];
}

// Keyed by selectedDate from parent so expanded state resets automatically on day change.
export default function ScheduleOrdersPanel({
	orders,
}: ScheduleOrdersPanelProps) {
	const themeColors = useThemeColors();
	const [expanded, setExpanded] = useState(false);
	const ChevronIcon = expanded ? ChevronUp : ChevronDown;

	if (orders.length === 0) return null;

	return (
		<View className="mt-2.5 overflow-hidden rounded-button border border-success-alt/25 bg-order-bg">
			<TouchableOpacity
				onPress={() => setExpanded((prev) => !prev)}
				className="flex-row items-center justify-between px-card-compact py-3"
				activeOpacity={0.7}
			>
				<View className="flex-row items-center gap-2">
					<View className="h-2 w-2 rounded-full bg-success-alt" />
					<Text variant="bodySm" className="font-semibold text-order-text">
						{orders.length} order{orders.length > 1 ? "s" : ""} this day
					</Text>
				</View>
				<ChevronIcon size={18} color={themeColors.orderText} strokeWidth={2} />
			</TouchableOpacity>

			{expanded && (
				<View className="px-card-compact pb-3">
					{orders.map((o) => (
						<ScheduleOrderCard key={o.id} order={o} />
					))}
				</View>
			)}
		</View>
	);
}
