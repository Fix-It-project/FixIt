import { Navigation, Receipt } from "lucide-react-native";
import { View } from "react-native";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";
import { formatJobDistanceKm } from "./job-format";

/**
 * Compact inspection-fee + priced-distance row for Jobs cards. Renders nothing
 * when neither value is present, so it's safe to drop into any card.
 */
export function JobMetaRow({
	inspectionFee,
	inspectionDistanceKm,
	className,
}: {
	readonly inspectionFee?: number | null;
	readonly inspectionDistanceKm?: number | null;
	readonly className?: string;
}) {
	const distance = formatJobDistanceKm(inspectionDistanceKm);
	const hasFee = inspectionFee != null && inspectionFee > 0;

	if (!hasFee && !distance) return null;

	return (
		<View
			className={`flex-row items-center gap-stack-md ${className ?? ""}`.trim()}
		>
			{hasFee ? (
				<View className="flex-row items-center gap-1">
					<Icon as={Receipt} size={13} className="text-content-secondary" />
					<Text variant="caption" className="text-content-secondary">
						Inspection {formatCurrency(inspectionFee as number)}
					</Text>
				</View>
			) : null}
			{distance ? (
				<View className="flex-row items-center gap-1">
					<Icon as={Navigation} size={13} className="text-content-secondary" />
					<Text variant="caption" className="text-content-secondary">
						{distance}
					</Text>
				</View>
			) : null}
		</View>
	);
}
