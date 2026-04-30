import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { WALLET } from "@/src/lib/mock-data/tech";
import { elevation, shadowStyle, useThemeColors } from "@/src/lib/theme";

export default function EarningsWallet() {
	const themeColors = useThemeColors();
	return (
		<Animated.View
			entering={FadeInUp.delay(300).duration(400)}
			className="mt-stack-xl px-card"
		>
			{/* Wallet card */}
			<View
				className="rounded-card border border-edge bg-surface p-card"
				style={{
					...shadowStyle(elevation.flat, { shadowColor: themeColors.shadow }),
				}}
			>
				<Text
					variant="caption"
					className="mb-stack-xs font-bold text-content-muted uppercase tracking-wider"
				>
					Wallet Balance
				</Text>
				<Text variant="h3" className="text-content">
					{WALLET.balance}
				</Text>

				<TouchableOpacity
					className="mt-stack-lg items-center rounded-button border px-control-compact-cta-x py-control-compact-cta-y"
					style={{
						backgroundColor: `${themeColors.primary}10`,
						borderColor: `${themeColors.primary}30`,
					}}
					activeOpacity={0.7}
				>
					<Text
						variant="caption"
						className="font-bold uppercase"
						style={{ color: themeColors.primary }}
					>
						Withdraw
					</Text>
				</TouchableOpacity>
			</View>
		</Animated.View>
	);
}
