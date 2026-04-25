import { BadgeCheck, CalendarDays, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
	Colors,
	elevation,
	shadowStyle,
	spacing,
	useThemeColors,
} from "@/src/lib/theme";

interface StatsCardProps {
	readonly icon: LucideIcon;
	readonly iconBg: string;
	readonly count: number;
	readonly label: string;
}

function StatsCard({ icon: Icon, iconBg, count, label }: StatsCardProps) {
	const themeColors = useThemeColors();

	return (
		<View
			className="flex-1 items-center rounded-card bg-surface py-card-roomy"
			style={shadowStyle(elevation.raised, { shadowColor: themeColors.shadow })}
		>
			<View
				className="mb-stack-md h-avatar-md w-avatar-md items-center justify-center rounded-card"
				style={{ backgroundColor: iconBg }}
			>
				<Icon size={24} color={themeColors.surfaceBase} strokeWidth={2} />
			</View>
			<Text variant="h2" className="font-bold text-2xl text-content">{count}</Text>
			<Text variant="caption" className="mt-stack-xs text-content-muted text-xs">{label}</Text>
		</View>
	);
}

interface ProfileStatsSectionProps {
	readonly bookings: number;
	readonly completed: number;
}

export default function ProfileStatsSection({
	bookings,
	completed,
}: ProfileStatsSectionProps) {
	return (
		<View
			className="flex-row gap-stack-md px-screen-x"
			style={{ marginTop: -spacing.card.padding }}
		>
			<StatsCard
				icon={CalendarDays}
				iconBg={Colors.accentCyan}
				count={bookings}
				label="Bookings"
			/>
			<StatsCard
				icon={BadgeCheck}
				iconBg={Colors.accentPurple}
				count={completed}
				label="Completed"
			/>
		</View>
	);
}
