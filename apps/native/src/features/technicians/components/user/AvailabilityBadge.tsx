import { CircleCheck, Clock } from "lucide-react-native";
import { Badge } from "@/src/components/ui/badge";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";

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
				style={{ backgroundColor: Colors.statusAvailable }}
			>
				<CircleCheck
					size={spacing.icon.xs}
					color={Colors.success}
					strokeWidth={2.25}
				/>
				<Text variant="caption" className="font-semibold text-success">
					Available Now
				</Text>
			</Badge>
		);
	}

	return (
		<Badge
			className="flex-row items-center gap-control-badge self-start rounded-chip px-control-badge-x py-control-badge-y"
			style={{ backgroundColor: themeColors.surfaceElevated }}
		>
			<Clock
				size={spacing.icon.xs}
				color={themeColors.surfaceMuted}
				strokeWidth={2.25}
			/>
			<Text variant="caption" className="font-semibold text-surface-muted">
				Unavailable
			</Text>
		</Badge>
	);
}
