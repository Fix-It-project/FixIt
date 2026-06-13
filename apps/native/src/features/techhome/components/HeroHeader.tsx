import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bell, Star } from "lucide-react-native";
import { View } from "react-native";
import Svg, {
	Defs,
	Path,
	Pattern,
	RadialGradient,
	Rect,
	Stop,
} from "react-native-svg";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";
import { useTechSelfQuery } from "../hooks/useTechSelfQuery";
import { useUnreadCountQuery } from "../hooks/useUnreadCountQuery";
import { greetingForHour } from "../utils/greeting";
import { AvailabilityCard } from "./AvailabilityCard";
import { HeaderStatStrip } from "./HeaderStatStrip";

/** Decorative blueprint grid + glow over the hero gradient. */
function HeroBackdrop() {
	const colors = useThemeColors();
	return (
		<Svg
			width="100%"
			height="100%"
			style={{ position: "absolute", inset: 0 }}
			pointerEvents="none"
		>
			<Defs>
				<Pattern
					id="techhome-grid"
					width={24}
					height={24}
					patternUnits="userSpaceOnUse"
				>
					<Path
						d="M24 0H0V24"
						stroke={colors.accentSky}
						strokeOpacity={0.14}
						strokeWidth={0.5}
						fill="none"
					/>
				</Pattern>
				<RadialGradient id="techhome-glow" cx="85%" cy="18%" r="45%">
					<Stop offset="0%" stopColor={colors.accentSky} stopOpacity={0.35} />
					<Stop offset="100%" stopColor={colors.accentSky} stopOpacity={0} />
				</RadialGradient>
			</Defs>
			<Rect width="100%" height="100%" fill="url(#techhome-grid)" />
			<Rect width="100%" height="100%" fill="url(#techhome-glow)" />
		</Svg>
	);
}

interface HeroHeaderProps {
	/** Extra bottom padding so the earnings card can overlap the gradient. */
	overlapPadding: number;
	topInset: number;
}

export function HeroHeader({ overlapPadding, topInset }: HeroHeaderProps) {
	const colors = useThemeColors();
	const router = useRouter();
	const { data: profile } = useTechSelfQuery();
	const { data: unreadCount = 0 } = useUnreadCountQuery();

	const fullName = profile
		? `${profile.first_name} ${profile.last_name}`.trim()
		: "";
	const initials = getPfpInitialsFallback(fullName);
	const online = profile?.is_available ?? false;

	return (
		<LinearGradient
			colors={[colors.tint.heroStart, colors.tint.heroMid, colors.tint.heroEnd]}
			start={{ x: 0, y: 0 }}
			end={{ x: 0.3, y: 1 }}
			style={{ paddingTop: topInset, paddingBottom: overlapPadding }}
		>
			<HeroBackdrop />

			{/* Greeting row */}
			<View className="flex-row items-center justify-between px-screen-x pt-stack-sm">
				<View className="flex-row items-center gap-stack-sm">
					<View>
						<Avatar alt={fullName || "Technician"} className="h-12 w-12">
							{profile?.profile_image ? (
								<AvatarImage source={{ uri: profile.profile_image }} />
							) : null}
							<AvatarFallback className="bg-tint-surface-strong">
								<Text variant="body" className="font-bold text-tint-on-strong">
									{initials}
								</Text>
							</AvatarFallback>
						</Avatar>
						{/* online status dot */}
						<View
							className="absolute right-0 bottom-0 h-3 w-3 rounded-full"
							style={{
								backgroundColor: online
									? colors.statusOnline
									: colors.disabledText,
								borderWidth: 2,
								borderColor: colors.tint.heroStart,
							}}
						/>
					</View>
					<View>
						<Text
							variant="caption"
							className="text-tint-on-hero opacity-70"
							numberOfLines={1}
						>
							{greetingForHour()}
						</Text>
						<Text
							variant="h4"
							className="font-bold text-tint-on-hero"
							numberOfLines={1}
						>
							{fullName || " "}
						</Text>
					</View>
				</View>

				<View className="flex-row items-center gap-stack-xs">
					{/* rating chip */}
					{profile?.avg_rating == undefined ? null : (
						<View className="flex-row items-center gap-1 rounded-xl bg-overlay-white px-2.5 py-1.5">
							<Icon
								as={Star}
								size={13}
								color={colors.ratingDefault}
								fill={colors.ratingDefault}
							/>
							<Text variant="label" className="font-semibold text-tint-on-hero">
								{profile.avg_rating.toFixed(2)}
							</Text>
						</View>
					)}

					{/* notification bell */}
					<PressableScale
						accessibilityRole="button"
						accessibilityLabel="Notifications"
						onPress={() => router.push(ROUTES.technician.notifications)}
						className="h-10 w-10 items-center justify-center rounded-xl bg-overlay-white"
					>
						<Icon as={Bell} size={20} color={colors.tint.onHero} />
						{unreadCount > 0 ? (
							<View
								className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
								style={{
									backgroundColor: colors.warning,
									borderWidth: 1.5,
									borderColor: colors.tint.heroStart,
								}}
							/>
						) : null}
					</PressableScale>
				</View>
			</View>

			{/* Availability toggle card */}
			<View className="px-screen-x pt-stack-md">
				<AvailabilityCard online={online} />
			</View>

			{/* Stat strip */}
			<View className="px-screen-x pt-stack-md">
				<HeaderStatStrip />
			</View>
		</LinearGradient>
	);
}
