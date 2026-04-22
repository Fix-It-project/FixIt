import { BadgeCheck, CalendarDays, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle, useThemeColors } from "@/src/lib/theme";

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
			className="flex-1 items-center rounded-card bg-surface py-5"
			style={shadowStyle(elevation.raised, { shadowColor: themeColors.shadow })}
		>
			<View
				className="mb-3 h-12 w-12 items-center justify-center rounded-2xl"
				style={{ backgroundColor: iconBg }}
			>
				<Icon size={24} color={themeColors.surfaceBase} strokeWidth={2} />
			</View>
			<Text className="font-bold text-2xl text-content">{count}</Text>
			<Text className="mt-0.5 text-content-muted text-xs">{label}</Text>
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
		<View className="flex-row gap-3 px-5" style={{ marginTop: -16 }}>
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
