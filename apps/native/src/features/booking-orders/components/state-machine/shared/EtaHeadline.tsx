// Phase 4b Plan 04 — EtaHeadline (D17).
//
// Server-derived ETA banner consumed by TrackingView (and any future
// arrived/inspecting variants that want a live countdown). Reads the 4a
// `useOrderDistance` hook which polls every 30s while the order is in
// tracking / arrived_inspection.
//
// Visual mirrors `OrderStatusBanner` (themed banner: icon + label) so it
// reads as part of the same state-machine surface language.

import { Truck } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useOrderDistance } from "@/src/features/booking-orders/hooks";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

interface Props {
	readonly orderId: string;
}

function buildHeadline(etaMinutes: number | null | undefined): string {
	if (etaMinutes == null) return "Locating technician…";
	if (etaMinutes < 1) return "Arriving now";
	return `Arrives in ~${etaMinutes} min`;
}

export default function EtaHeadline({ orderId }: Props) {
	const themeColors = useThemeColors();
	const { data: distance } = useOrderDistance(orderId);
	const headline = buildHeadline(distance?.eta_minutes);

	return (
		<View
			className="mb-stack-lg flex-row items-center gap-stack-md rounded-card border p-card"
			style={{
				backgroundColor: themeColors.primaryLight,
				borderColor: `${themeColors.primary}20`,
			}}
		>
			<Truck size={spacing.icon.sm} color={themeColors.primary} strokeWidth={1.8} />
			<View className="flex-1">
				<Text variant="buttonMd" style={{ color: themeColors.primary }}>
					{headline}
				</Text>
			</View>
		</View>
	);
}
