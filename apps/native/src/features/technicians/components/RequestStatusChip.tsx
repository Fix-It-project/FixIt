import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import type { ServiceRequestStatus } from "../schemas/custom-service.schema";

interface RequestStatusChipProps {
	status: ServiceRequestStatus;
	label: string;
}

/** Status pill for a custom-service request. Follows the app's status law:
 *  light semantic background + the matching semantic text/dot (never a solid
 *  fill — those are reserved for primary actions). */
export function RequestStatusChip({ status, label }: RequestStatusChipProps) {
	const c = useThemeColors();
	const tone =
		status === "approved"
			? { bg: c.statusAvailable, fg: c.success }
			: status === "rejected"
				? { bg: c.dangerLight, fg: c.danger }
				: { bg: c.warningLight, fg: c.warning };

	return (
		<View
			className="flex-row items-center gap-1.5 self-start rounded-pill px-2.5 py-1"
			style={{ backgroundColor: tone.bg }}
		>
			<View
				className="h-1.5 w-1.5 rounded-full"
				style={{ backgroundColor: tone.fg }}
			/>
			<Text
				variant="caption"
				className="font-semibold"
				style={{ color: tone.fg }}
			>
				{label}
			</Text>
		</View>
	);
}
