import type { ColorValue } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

/**
 * Custom tab glyphs that mirror their Lucide counterparts (House, CalendarDays,
 * ClipboardList) but split each path set into OUTER outline vs INTERIOR detail.
 *
 * Lucide renders one `<Svg>` with a single shared `stroke`, so a filled active
 * icon turns into a solid blob — the interior detail (house door entrance,
 * calendar day dots, clipboard rows) vanishes into the fill. These components
 * keep the outer outline/body on `color` (the active blue) while flipping ONLY
 * the interior detail to `detailColor` when focused, so the detail reads as a
 * cut-out. Callers pass the tab-bar background (`surfaceBase`) as `detailColor`
 * so the cut-out matches the bar in BOTH light and dark themes; it defaults to
 * `color` (no visible cut-out) when omitted.
 *
 * Path data copied verbatim from lucide-react-native@0.575.0 so the glyphs stay
 * pixel-identical to the rest of the icon set.
 */

type TabGlyphProps = {
	readonly size?: number | string;
	readonly color?: ColorValue;
	readonly focused?: boolean;
	readonly detailColor?: ColorValue;
	readonly strokeWidth?: number;
};

const SIZE_FALLBACK = 24;
const STROKE_FALLBACK = 1.8;
// Tabs always supply a tint; "currentColor" is a never-hit type guard for the
// optional `color` prop (mirrors lucide-react-native's optional color typing).
const COLOR_FALLBACK = "currentColor";

function resolveColors(
	color: ColorValue,
	focused?: boolean,
	detailColor?: ColorValue,
) {
	// Cut-out colour defaults to the outline tint, so an omitted detailColor is a no-op.
	const detailTint = detailColor ?? color;
	return {
		// Outer outline/body fills with the active tint when focused, else stays open.
		fill: focused ? color : "none",
		// Interior detail flips to the cut-out colour on the fill; matches outline when idle.
		detail: focused ? detailTint : color,
	};
}

export function HouseTabIcon({
	size = SIZE_FALLBACK,
	color = COLOR_FALLBACK,
	focused,
	detailColor,
	strokeWidth = STROKE_FALLBACK,
}: TabGlyphProps) {
	const { fill, detail } = resolveColors(color, focused, detailColor);
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{/* Outer house body */}
			<Path
				d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
				fill={fill}
			/>
			{/* Interior: door entrance — thin stroked cut-out (never a wide fill, so the
			    focused glyph reads the same width as the idle one). Mirrors the
			    stroke-only interior detail of the calendar/clipboard glyphs. */}
			<Path
				d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
				fill="none"
				stroke={detail}
			/>
		</Svg>
	);
}

export function CalendarDaysTabIcon({
	size = SIZE_FALLBACK,
	color = COLOR_FALLBACK,
	focused,
	detailColor,
	strokeWidth = STROKE_FALLBACK,
}: TabGlyphProps) {
	const { fill, detail } = resolveColors(color, focused, detailColor);
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{/* Outer frame + top binding ticks + header divider */}
			<Path d="M8 2v4" />
			<Path d="M16 2v4" />
			<Rect width="18" height="18" x="3" y="4" rx="2" fill={fill} />
			<Path d="M3 10h18" />
			{/* Interior: day dots */}
			<Path d="M8 14h.01" stroke={detail} />
			<Path d="M12 14h.01" stroke={detail} />
			<Path d="M16 14h.01" stroke={detail} />
			<Path d="M8 18h.01" stroke={detail} />
			<Path d="M12 18h.01" stroke={detail} />
			<Path d="M16 18h.01" stroke={detail} />
		</Svg>
	);
}

export function ClipboardListTabIcon({
	size = SIZE_FALLBACK,
	color = COLOR_FALLBACK,
	focused,
	detailColor,
	strokeWidth = STROKE_FALLBACK,
}: TabGlyphProps) {
	const { fill, detail } = resolveColors(color, focused, detailColor);
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{/* Outer clipboard body + clip */}
			<Path
				d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
				fill={fill}
			/>
			<Rect width="8" height="4" x="8" y="2" rx="1" ry="1" fill={fill} />
			{/* Interior: list rows + bullet dots */}
			<Path d="M12 11h4" stroke={detail} />
			<Path d="M12 16h4" stroke={detail} />
			<Path d="M8 11h.01" stroke={detail} />
			<Path d="M8 16h.01" stroke={detail} />
		</Svg>
	);
}
