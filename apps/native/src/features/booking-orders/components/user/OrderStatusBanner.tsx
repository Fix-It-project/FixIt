import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { getOrderStatusBadge } from "@/src/features/booking-orders/utils/order-status-ui";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
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
	const config = getOrderStatusBadge(status, themeColors, "user");

	return (
		<View
			className="mb-stack-lg flex-row items-center gap-stack-md rounded-card border p-card"
			style={{
				backgroundColor: config.bg,
				borderColor: `${config.color}20`,
			}}
		>
			<config.icon size={spacing.icon.sm} color={config.color} strokeWidth={1.8} />
			<View className="flex-1">
				<Text variant="buttonMd" style={{ color: config.color }}>
					{config.label}
				</Text>
				{cancellationReason ? (
					<Text
						variant="caption"
						className="mt-stack-xs"
						style={{ color: themeColors.textSecondary }}
					>
						{cancellationReason}
					</Text>
				) : null}
			</View>
		</View>
	);
}
