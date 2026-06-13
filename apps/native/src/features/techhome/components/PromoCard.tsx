import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp } from "lucide-react-native";
import { View } from "react-native";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

interface PromoCardProps {
	badgeLabel: string;
	title: string;
	body: string;
}

/**
 * Presentational promo/reward teaser. Content is hardcoded at the call site
 * until the rewards system ships — then feed it server-driven props.
 */
export function PromoCard({ badgeLabel, title, body }: PromoCardProps) {
	const colors = useThemeColors();

	return (
		<View className="px-screen-x pt-stack-lg">
			<LinearGradient
				colors={[colors.tint.heroMid, colors.tint.heroEnd]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={{ borderRadius: 20, overflow: "hidden" }}
			>
				<View className="p-card">
					<View className="flex-row items-center gap-stack-xs">
						<Icon as={TrendingUp} size={14} color={colors.accentSky} />
						<Text
							variant="caption"
							className="text-tint-on-hero opacity-85"
						>
							{badgeLabel}
						</Text>
					</View>
					<Text
						variant="h3"
						className="mt-stack-sm max-w-[85%] font-bold text-tint-on-hero"
					>
						{title}
					</Text>
					<Text
						variant="caption"
						className="mt-1 max-w-[90%] text-tint-on-hero opacity-80"
					>
						{body}
					</Text>
				</View>
			</LinearGradient>
		</View>
	);
}
