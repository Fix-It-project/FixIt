import { Navigation, Receipt } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { formatDistanceKm } from "../utils/distance";
import { formatEgp } from "../utils/money";

/**
 * Compact meta row surfacing the order's inspection fee and the distance it was
 * priced from (the "new inspection fee handling"). Renders nothing when neither
 * value is present, so it's safe to drop into any job card.
 */
export function JobInspectionMeta({
	inspectionFee,
	inspectionDistanceKm,
	className,
}: {
	inspectionFee?: number | null;
	inspectionDistanceKm?: number | null;
	className?: string;
}) {
	const { t } = useTranslation("technician");
	const distance = formatDistanceKm(inspectionDistanceKm);
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
						{t("home.inspection.fee", {
							amount: formatEgp(inspectionFee as number),
						})}
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
