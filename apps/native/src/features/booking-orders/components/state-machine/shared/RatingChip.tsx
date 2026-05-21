// Compact rating pill for a technician. Stable-size placeholder while the
// profile query resolves so the parent row never shifts.

import { Star } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useTechnicianProfileQuery } from "@/src/features/technicians/hooks/useTechnicianProfileQuery";
import { radius, space, spacing, useThemeColors } from "@/src/lib/theme";

const PLACEHOLDER_WIDTH = 78;
const PLACEHOLDER_HEIGHT = 22;

export default function RatingChip({ technicianId }: { technicianId: string }) {
	const themeColors = useThemeColors();
	const { data: profile, isLoading } = useTechnicianProfileQuery(technicianId);

	if (isLoading) {
		return (
			<View
				style={{
					width: PLACEHOLDER_WIDTH,
					height: PLACEHOLDER_HEIGHT,
					borderRadius: radius.pill,
					backgroundColor: themeColors.surfaceElevated,
					opacity: 0.6,
				}}
			/>
		);
	}

	if (!profile || profile.avg_rating == null) {
		return (
			<View style={{ width: PLACEHOLDER_WIDTH, height: PLACEHOLDER_HEIGHT }} />
		);
	}

	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: space[1],
				paddingHorizontal: space[2],
				paddingVertical: 2,
				borderRadius: radius.pill,
				backgroundColor: `${themeColors.ratingDefault}20`,
				minHeight: PLACEHOLDER_HEIGHT,
			}}
		>
			<Star
				size={spacing.icon.caption}
				color={themeColors.ratingDefault}
				fill={themeColors.ratingDefault}
				strokeWidth={0}
			/>
			<Text
				variant="caption"
				className="font-google-sans-bold"
				style={{ color: themeColors.textPrimary }}
			>
				{profile.avg_rating.toFixed(1)}
			</Text>
			<Text
				variant="caption"
				style={{ color: themeColors.textMuted, fontSize: 11 }}
			>
				({profile.review_count})
			</Text>
		</View>
	);
}
