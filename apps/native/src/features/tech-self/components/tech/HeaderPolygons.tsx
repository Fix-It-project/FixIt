import { Dimensions } from "react-native";
import Svg, { Defs, LinearGradient, Polygon, Stop } from "react-native-svg";
import { spacing, type ThemeId, type ThemePalette } from "@/src/lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEIGHT = spacing.header.homePolygonHeight;

interface HeaderPolygonPalette {
	gradientStart: string;
	gradientEnd: string;
	glowStart: string;
	glowEnd: string;
	topRight: string;
	accent: string;
	bottomRight: string;
	sliver: string;
	bottomCenter: string;
}

export function getHeaderPolygonPalette(
	themeColors: ThemePalette,
	_themeId: ThemeId,
): HeaderPolygonPalette {
	return {
		gradientStart: themeColors.primary,
		gradientEnd: themeColors.primaryDark,
		glowStart: themeColors.accentSky,
		glowEnd: themeColors.primary,
		topRight: themeColors.primary,
		accent: themeColors.accentSky,
		bottomRight: themeColors.primaryDark,
		sliver: themeColors.accentSky,
		bottomCenter: themeColors.overlayBright,
	};
}

interface HeaderPolygonsProps {
	readonly palette: HeaderPolygonPalette;
}

/**
 * Decorative polygon background rendered behind the home header area.
 * Dark mode intentionally keeps the original blue faceted treatment; other
 * themes derive the shard colors from the active theme palette.
 */
export default function HeaderPolygons({ palette }: HeaderPolygonsProps) {
	return (
		<Svg
			width={SCREEN_WIDTH}
			height={HEIGHT}
			style={{ position: "absolute", top: 0, left: 0 }}
		>
			<Defs>
				<LinearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
					<Stop
						offset="0"
						stopColor={palette.gradientStart}
						stopOpacity="0.35"
					/>
					<Stop offset="1" stopColor={palette.gradientEnd} stopOpacity="0.2" />
				</LinearGradient>
				<LinearGradient id="grad2" x1="1" y1="0" x2="0" y2="1">
					<Stop offset="0" stopColor={palette.glowStart} stopOpacity="0.18" />
					<Stop offset="1" stopColor={palette.glowEnd} stopOpacity="0.12" />
				</LinearGradient>
			</Defs>

			{/* Large bottom-left shard */}
			<Polygon
				points={`0,${HEIGHT * 0.35} ${SCREEN_WIDTH * 0.45},${HEIGHT * 0.1} ${SCREEN_WIDTH * 0.38},${HEIGHT} 0,${HEIGHT}`}
				fill="url(#grad1)"
			/>

			{/* Top-right triangle */}
			<Polygon
				points={`${SCREEN_WIDTH * 0.55},0 ${SCREEN_WIDTH},0 ${SCREEN_WIDTH},${HEIGHT * 0.55} ${SCREEN_WIDTH * 0.7},${HEIGHT * 0.3}`}
				fill={palette.topRight}
				opacity={0.15}
			/>

			{/* Center diamond */}
			<Polygon
				points={`${SCREEN_WIDTH * 0.3},${HEIGHT * 0.05} ${SCREEN_WIDTH * 0.65},${HEIGHT * 0.2} ${SCREEN_WIDTH * 0.5},${HEIGHT * 0.7} ${SCREEN_WIDTH * 0.15},${HEIGHT * 0.45}`}
				fill="url(#grad2)"
			/>

			{/* Small top-left accent */}
			<Polygon
				points={`0,0 ${SCREEN_WIDTH * 0.28},0 ${SCREEN_WIDTH * 0.15},${HEIGHT * 0.35} 0,${HEIGHT * 0.2}`}
				fill={palette.accent}
				opacity={0.1}
			/>

			{/* Bottom-right wedge */}
			<Polygon
				points={`${SCREEN_WIDTH * 0.6},${HEIGHT * 0.5} ${SCREEN_WIDTH},${HEIGHT * 0.35} ${SCREEN_WIDTH},${HEIGHT} ${SCREEN_WIDTH * 0.5},${HEIGHT}`}
				fill={palette.bottomRight}
				opacity={0.18}
			/>

			{/* Thin mid-right sliver */}
			<Polygon
				points={`${SCREEN_WIDTH * 0.7},0 ${SCREEN_WIDTH * 0.85},0 ${SCREEN_WIDTH * 0.95},${HEIGHT * 0.45} ${SCREEN_WIDTH * 0.75},${HEIGHT * 0.25}`}
				fill={palette.sliver}
				opacity={0.12}
			/>

			{/* Small bottom-center triangle */}
			<Polygon
				points={`${SCREEN_WIDTH * 0.35},${HEIGHT * 0.65} ${SCREEN_WIDTH * 0.55},${HEIGHT * 0.55} ${SCREEN_WIDTH * 0.48},${HEIGHT}`}
				fill={palette.bottomCenter}
				opacity={0.1}
			/>
		</Svg>
	);
}
