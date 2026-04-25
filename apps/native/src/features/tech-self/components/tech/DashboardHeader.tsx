import { Bell, ClipboardList, Star } from "lucide-react-native";
import {
	Image,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Polygon, Stop } from "react-native-svg";
import { Text } from "@/src/components/ui/text";
import { getHeaderPolygonPalette } from "@/src/features/tech-self/components/tech/HeaderPolygons";
import { useTechSelfProfileQuery } from "@/src/features/tech-self/hooks/useTechSelfProfileQuery";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import {
	elevation,
	shadowStyle,
	spacing,
	useThemeColors,
	useThemeMeta,
} from "@/src/lib/theme";

const HEADER_HEIGHT = spacing.header.dashboardHeight;

interface DashboardHeaderPolygonsProps {
	readonly screenWidth: number;
	readonly gradientStart: string;
	readonly gradientEnd: string;
	readonly glowStart: string;
	readonly glowEnd: string;
	readonly topRight: string;
	readonly accent: string;
	readonly bottomRight: string;
	readonly sliver: string;
}

/** Decorative polygon background — same faceted style as the user home page */
function DashboardHeaderPolygons({
	screenWidth,
	gradientStart,
	gradientEnd,
	glowStart,
	glowEnd,
	topRight,
	accent,
	bottomRight,
	sliver,
}: DashboardHeaderPolygonsProps) {
	return (
		<Svg
			width={screenWidth}
			height={HEADER_HEIGHT}
			style={{ position: "absolute", top: 0, left: 0 }}
		>
			<Defs>
				<LinearGradient id="tg1" x1="0" y1="0" x2="1" y2="1">
					<Stop offset="0" stopColor={gradientStart} stopOpacity="0.35" />
					<Stop offset="1" stopColor={gradientEnd} stopOpacity="0.2" />
				</LinearGradient>
				<LinearGradient id="tg2" x1="1" y1="0" x2="0" y2="1">
					<Stop offset="0" stopColor={glowStart} stopOpacity="0.18" />
					<Stop offset="1" stopColor={glowEnd} stopOpacity="0.12" />
				</LinearGradient>
			</Defs>

			<Polygon
				points={`0,${HEADER_HEIGHT * 0.35} ${screenWidth * 0.45},${HEADER_HEIGHT * 0.1} ${screenWidth * 0.38},${HEADER_HEIGHT} 0,${HEADER_HEIGHT}`}
				fill="url(#tg1)"
			/>
			<Polygon
				points={`${screenWidth * 0.55},0 ${screenWidth},0 ${screenWidth},${HEADER_HEIGHT * 0.55} ${screenWidth * 0.7},${HEADER_HEIGHT * 0.3}`}
				fill={topRight}
				opacity={0.15}
			/>
			<Polygon
				points={`${screenWidth * 0.3},${HEADER_HEIGHT * 0.05} ${screenWidth * 0.65},${HEADER_HEIGHT * 0.2} ${screenWidth * 0.5},${HEADER_HEIGHT * 0.7} ${screenWidth * 0.15},${HEADER_HEIGHT * 0.45}`}
				fill="url(#tg2)"
			/>
			<Polygon
				points={`0,0 ${screenWidth * 0.28},0 ${screenWidth * 0.15},${HEADER_HEIGHT * 0.35} 0,${HEADER_HEIGHT * 0.2}`}
				fill={accent}
				opacity={0.1}
			/>
			<Polygon
				points={`${screenWidth * 0.6},${HEADER_HEIGHT * 0.5} ${screenWidth},${HEADER_HEIGHT * 0.35} ${screenWidth},${HEADER_HEIGHT} ${screenWidth * 0.5},${HEADER_HEIGHT}`}
				fill={bottomRight}
				opacity={0.18}
			/>
			<Polygon
				points={`${screenWidth * 0.7},0 ${screenWidth * 0.85},0 ${screenWidth * 0.95},${HEADER_HEIGHT * 0.45} ${screenWidth * 0.75},${HEADER_HEIGHT * 0.25}`}
				fill={sliver}
				opacity={0.12}
			/>
		</Svg>
	);
}

export default function DashboardHeader() {
	const { width: screenWidth } = useWindowDimensions();
	const themeColors = useThemeColors();
	const { themeId } = useThemeMeta();
	const { data: profile } = useTechSelfProfileQuery();
	const polygonPalette = getHeaderPolygonPalette(themeColors, themeId);

	const fullName = profile
		? `${profile.first_name} ${profile.last_name}`
		: "...";
	const initials = getPfpInitialsFallback(fullName);
	const isOnline = false;
	const specialty = profile?.category_name ?? "Technician";

	return (
		<View
			style={{
				backgroundColor: themeColors.primaryDark,
				paddingHorizontal: spacing.header.shellPaddingX,
				paddingBottom: spacing.header.shellPaddingBottom,
				paddingTop: spacing.header.shellPaddingTop,
				overflow: "hidden",
				...shadowStyle(elevation.header, {
					shadowColor: themeColors.shadow,
					opacity: 0.18,
				}),
			}}
		>
			<DashboardHeaderPolygons
				screenWidth={screenWidth}
				gradientStart={polygonPalette.gradientStart}
				gradientEnd={polygonPalette.gradientEnd}
				glowStart={polygonPalette.glowStart}
				glowEnd={polygonPalette.glowEnd}
				topRight={polygonPalette.topRight}
				accent={polygonPalette.accent}
				bottomRight={polygonPalette.bottomRight}
				sliver={polygonPalette.sliver}
			/>

			{/* Title row */}
			<Animated.View
				entering={FadeInDown.duration(400)}
				className="mb-stack-lg flex-row items-center justify-between"
			>
				<Text variant="h2" style={{ color: themeColors.onPrimaryHeader }}>
					Fix
					<Text variant="h2" style={{ color: themeColors.accentSky }}>
						IT
					</Text>
					{"  "}
					<Text variant="h2" style={{ color: themeColors.onPrimaryHeader }}>
						Technicians
					</Text>
				</Text>

				<View className="flex-row items-center gap-stack-md">
					<View className="flex-row items-center gap-stack-xs">
						<Text
							variant="caption"
							className="font-bold uppercase"
							style={{
								color: isOnline
									? themeColors.statusOnline
									: themeColors.overlaySub,
							}}
						>
							{isOnline ? "Online" : "Offline"}
						</Text>
						<View
							className="h-status-dot-sm w-status-dot-sm rounded-pill"
							style={{
								backgroundColor: isOnline
									? themeColors.statusOnline
									: themeColors.overlayDim,
							}}
						/>
					</View>

					<TouchableOpacity
						className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill"
						style={{ backgroundColor: themeColors.overlayMd }}
						activeOpacity={0.7}
					>
						<Bell
							size={20}
							color={themeColors.onPrimaryHeader}
							strokeWidth={1.8}
						/>
					</TouchableOpacity>
				</View>
			</Animated.View>

			{/* Profile card */}
			<Animated.View
				entering={FadeInDown.delay(100).duration(400)}
				className="flex-row items-center justify-between rounded-card p-card"
				style={{ backgroundColor: themeColors.overlaySm }}
			>
				<View className="flex-1 flex-row items-center gap-stack-md">
					<View className="relative">
						{profile?.profile_image ? (
							<Image
								source={{ uri: profile.profile_image }}
								className="h-avatar-md w-avatar-md rounded-pill"
								style={{ backgroundColor: themeColors.overlayMd }}
							/>
						) : (
							<View
								className="h-avatar-md w-avatar-md items-center justify-center rounded-pill"
								style={{ backgroundColor: themeColors.ratingDefault }}
							>
								<Text
									variant="buttonLg"
									className="font-bold"
									style={{ color: themeColors.onPrimaryHeader }}
								>
									{initials}
								</Text>
							</View>
						)}
						<View
							className="absolute right-0 bottom-0 h-status-dot-md w-status-dot-md rounded-pill border-selected"
							style={{
								borderColor: themeColors.primaryDark,
								backgroundColor: isOnline
									? themeColors.statusOnline
									: themeColors.overlayDim,
							}}
						/>
					</View>

					<View style={{ flex: 1 }}>
						<Text
							variant="buttonLg"
							className="font-bold"
							style={{
								color: themeColors.onPrimaryHeader,
							}}
							numberOfLines={1}
						>
							{fullName}
						</Text>
						<Text
							variant="caption"
							style={{ color: themeColors.overlayBright }}
							numberOfLines={1}
						>
							{specialty}
						</Text>
					</View>
				</View>

				{/* Stats */}
				<View className="items-end gap-stack-sm" style={{ flexShrink: 0 }}>
					<View className="flex-row items-center gap-stack-xs">
						<ClipboardList size={14} color={themeColors.overlayBright} />
						<Text
							variant="bodySm"
							className="font-bold"
							style={{ color: themeColors.surfaceBase }}
						>
							{profile?.total_orders ?? 0}
						</Text>
					</View>
					<View className="flex-row items-center gap-stack-xs">
						<Star
							size={14}
							color={themeColors.ratingDefault}
							fill={themeColors.ratingDefault}
						/>
						<Text
							variant="bodySm"
							className="font-bold"
							style={{ color: themeColors.surfaceBase }}
						>
							4.8
						</Text>
					</View>
				</View>
			</Animated.View>
		</View>
	);
}
