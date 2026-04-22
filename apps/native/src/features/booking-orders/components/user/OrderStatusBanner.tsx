import {
	AlertTriangle,
	CheckCircle,
	Clock,
	XCircle,
} from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";
import type { OrderStatus } from "@/src/schemas/shared.schema";

interface Props {
	readonly status: OrderStatus;
	readonly cancellationReason?: string | null;
}

export default function OrderStatusBanner({
	status,
	cancellationReason,
}: Props) {
	const themeColors = useThemeColors();
	const bannerConfig: Record<
		OrderStatus,
		{ label: string; color: string; bg: string; icon: typeof Clock }
	> = {
		pending: {
			label: "Waiting for technician to accept",
			color: themeColors.warning,
			bg: themeColors.warningLight,
			icon: Clock,
		},
		accepted: {
			label: "Accepted by technician",
			color: themeColors.success,
			bg: themeColors.orderBg,
			icon: CheckCircle,
		},
		rejected: {
			label: "Rejected by technician",
			color: themeColors.danger,
			bg: themeColors.dangerLight,
			icon: XCircle,
		},
		cancelled_by_user: {
			label: "Cancelled by you",
			color: themeColors.danger,
			bg: themeColors.dangerLight,
			icon: XCircle,
		},
		cancelled_by_technician: {
			label: "Cancelled by technician",
			color: themeColors.danger,
			bg: themeColors.dangerLight,
			icon: AlertTriangle,
		},
		completed: {
			label: "Completed",
			color: themeColors.success,
			bg: themeColors.orderBg,
			icon: CheckCircle,
		},
	};
	const config = bannerConfig[status];

	return (
		<View
			className="mb-4 flex-row items-center gap-3 rounded-2xl p-4"
			style={{
				backgroundColor: config.bg,
				borderWidth: 1,
				borderColor: `${config.color}20`,
			}}
		>
			<config.icon size={22} color={config.color} strokeWidth={1.8} />
			<View className="flex-1">
				<Text variant="buttonMd" style={{ color: config.color }}>
					{config.label}
				</Text>
				{cancellationReason ? (
					<Text
						variant="caption"
						className="mt-0.5"
						style={{ color: themeColors.textSecondary }}
					>
						{cancellationReason}
					</Text>
				) : null}
			</View>
		</View>
	);
}
