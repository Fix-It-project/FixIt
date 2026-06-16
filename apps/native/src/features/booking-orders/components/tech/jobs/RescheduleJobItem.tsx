import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import type { RescheduleDirection } from "../../../hooks/useTechnicianJobs";
import type { TechnicianBooking } from "../../../schemas/response.schema";
import RescheduleRequestPanel from "../../state-machine/shared/RescheduleRequestPanel";

interface RescheduleJobItemProps {
	readonly booking: TechnicianBooking;
	readonly direction: RescheduleDirection;
}

/**
 * One reschedule row. The accept/deny (incoming) or withdraw (sent) controls
 * live inside the shared `RescheduleRequestPanel`, which fetches the proposal
 * lazily — and only when this row is mounted by the windowed list (bounds N+1).
 */
export function RescheduleJobItem({
	booking,
	direction,
}: RescheduleJobItemProps) {
	const themeColors = useThemeColors();
	const initials = getPfpInitialsFallback(booking.user_name);
	const avatarColor = getAvatarColor(booking.user_name);
	const incoming = direction === "incoming";

	return (
		<View className="gap-stack-sm rounded-card bg-card p-card">
			<View className="flex-row items-center gap-stack-md">
				<View
					className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill"
					style={{ backgroundColor: avatarColor }}
				>
					<Text
						variant="buttonMd"
						className="font-bold"
						style={{ color: themeColors.surfaceOnPrimary }}
					>
						{initials}
					</Text>
				</View>
				<View className="flex-1">
					<Text
						variant="label"
						className="font-bold text-content"
						numberOfLines={1}
					>
						{booking.user_name ?? "Customer"}
					</Text>
					<Text
						variant="caption"
						className="text-content-muted"
						numberOfLines={1}
					>
						{booking.service_name ?? "Service"}
					</Text>
				</View>
				<View
					className={`rounded-pill px-stack-sm py-0.5 ${
						incoming ? "bg-warning/15" : "bg-app-primary/10"
					}`}
				>
					<Text
						variant="caption"
						className={`font-semibold ${
							incoming ? "text-warning" : "text-app-primary"
						}`}
					>
						{incoming ? "Needs response" : "Awaiting customer"}
					</Text>
				</View>
			</View>

			<RescheduleRequestPanel orderId={booking.id} viewer="technician" />
		</View>
	);
}
