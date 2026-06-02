import { CircleCheck, Clock } from "lucide-react-native";
import { Badge } from "@/src/components/ui/badge";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

interface AvailabilityBadgeProps {
	readonly isAvailable: boolean;
}

export default function AvailabilityBadge({
	isAvailable,
}: AvailabilityBadgeProps) {
	const themeColors = useThemeColors();
	if (isAvailable) {
		return (
			<Badge
				className="flex-row items-center gap-control-badge self-start rounded-chip px-control-badge-x py-control-badge-y"
				style={{ backgroundColor: themeColors.statusAvailable }}
			>
				<CircleCheck
					size={spacing.icon.xs}
					color={themeColors.success}
					strokeWidth={2.25}
				/>
				<Text
					variant="caption"
					className="font-semibold"
					style={{ color: themeColors.success }}
				>
					Available Now
				</Text>
			</Badge>
		);
	}

	return (
		<Badge
			className="flex-row items-center gap-control-badge self-start rounded-chip px-control-badge-x py-control-badge-y"
			style={{ backgroundColor: themeColors.statusUnavailableBg }}
		>
			<Clock
				size={spacing.icon.xs}
				color={themeColors.statusUnavailable}
				strokeWidth={2.25}
			/>
			<Text
				variant="caption"
				className="font-semibold"
				style={{ color: themeColors.statusUnavailable }}
			>
				Unavailable
			</Text>
		</Badge>
	);
}
