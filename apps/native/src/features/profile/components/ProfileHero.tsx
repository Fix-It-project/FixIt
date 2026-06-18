import { LinearGradient } from "expo-linear-gradient";
import { Settings } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import ProfileAvatar from "./ProfileAvatar";

interface ProfileHeroProps {
	readonly name: string | null;
	readonly subtitle?: string | null;
	readonly isLoading: boolean;
	readonly imageUrl?: string | null;
	readonly onChangePhoto?: () => void;
	readonly onOpenSettings: () => void;
	readonly settingsLabel: string;
	/**
	 * Top gradient color — MUST equal the color the tab layout paints behind the
	 * status bar for this side's `blue` chrome variant, so the inset blends with
	 * no seam. User side = `tint.heroStart`; technician side = `primaryDark`.
	 */
	readonly topColor: string;
	/** Optional extra content under the name (e.g. technician bio). */
	readonly children?: ReactNode;
	/**
	 * Full-width content rendered below the avatar row, still on the gradient
	 * (e.g. the metrics row). Kept separate from `children` so it spans the hero
	 * rather than squeezing into the name column.
	 */
	readonly metrics?: ReactNode;
}

/**
 * Profile hero with a {topColor}→surface vertical gradient. The top of the
 * gradient matches the status-bar band so the painted top inset blends
 * seamlessly into the hero, then fades to `surfaceBase` so the page surface
 * continues below with no seam. Avatar sits on the left (name + subtitle beside
 * it); the settings cog is top-right.
 */
export default function ProfileHero({
	name,
	subtitle,
	isLoading,
	imageUrl,
	onChangePhoto,
	onOpenSettings,
	settingsLabel,
	topColor,
	children,
	metrics,
}: ProfileHeroProps) {
	const themeColors = useThemeColors();

	return (
		<LinearGradient
			// A solid blue hero block (no fade into the surface) — starts at the
			// status-bar band color (topColor) so the painted inset blends at the
			// top, then deepens to heroEnd and ends with a hard edge against the
			// page. All stops are theme tokens, so the hero adapts per theme.
			colors={[topColor, themeColors.tint.heroMid, themeColors.tint.heroEnd]}
			start={{ x: 0.5, y: 0 }}
			end={{ x: 0.5, y: 1 }}
		>
			<View className="px-screen-x pt-stack-sm pb-stack-2xl">
				<View className="h-control-icon-box-sm flex-row items-center justify-end">
					<Pressable
						onPress={onOpenSettings}
						accessibilityRole="button"
						accessibilityLabel={settingsLabel}
						hitSlop={12}
						className="active:opacity-70"
					>
						<Settings
							size={24}
							color={themeColors.surfaceOnPrimary}
							strokeWidth={1.8}
						/>
					</Pressable>
				</View>

				<View className="mt-stack-md flex-row items-center gap-stack-lg">
					<ProfileAvatar
						name={name}
						imageUrl={imageUrl}
						onChangePhoto={onChangePhoto}
					/>
					<View className="flex-1">
						{isLoading ? (
							<ActivityIndicator color={themeColors.surfaceOnPrimary} />
						) : (
							<Text
								variant="h2"
								className="font-bold"
								style={{ color: themeColors.surfaceOnPrimary }}
								numberOfLines={1}
							>
								{name ?? ""}
							</Text>
						)}
						{subtitle ? (
							<Text
								variant="bodySm"
								className="mt-stack-xs"
								style={{ color: themeColors.overlayBright }}
								numberOfLines={1}
							>
								{subtitle}
							</Text>
						) : null}
						{children}
					</View>
				</View>

				{metrics ? <View className="mt-stack-xl">{metrics}</View> : null}
			</View>
		</LinearGradient>
	);
}
