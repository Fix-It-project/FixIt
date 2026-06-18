import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Svg, {
	Defs,
	Path,
	Stop,
	LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

interface EarningsAreaChartProps {
	/** Last 30 days, oldest first — from GET /api/technicians/me/wallet. */
	last30: ReadonlyArray<{ date: string; amount: number }>;
}

const CHART_HEIGHT = 140;
const TOP_PAD = 12;
const BOTTOM_PAD = 8;

/**
 * Builds a smooth (Catmull-Rom → cubic Bézier) path through the points so the
 * 30-day earnings read as a flowing curve rather than the home page's bars.
 */
function smoothLine(pts: ReadonlyArray<{ x: number; y: number }>): string {
	if (pts.length === 0) return "";
	if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
	let d = `M ${pts[0].x} ${pts[0].y}`;
	for (let i = 0; i < pts.length - 1; i += 1) {
		const p0 = pts[i - 1] ?? pts[i];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2] ?? p2;
		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
	}
	return d;
}

export default function EarningsAreaChart({ last30 }: EarningsAreaChartProps) {
	const { t } = useTranslation("technician");
	const themeColors = useThemeColors();
	const [width, setWidth] = useState(0);

	const allZero = last30.every((d) => d.amount === 0);
	const max = Math.max(1, ...last30.map((d) => d.amount));

	const usableH = CHART_HEIGHT - TOP_PAD - BOTTOM_PAD;
	const stepX = last30.length > 1 ? width / (last30.length - 1) : 0;
	const points = last30.map((d, i) => ({
		x: i * stepX,
		y: TOP_PAD + (1 - d.amount / max) * usableH,
	}));

	const line = smoothLine(points);
	const area =
		width > 0 && points.length > 0
			? `${line} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`
			: "";

	return (
		<View className="px-screen-x">
			<View
				onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
				style={{ height: CHART_HEIGHT }}
			>
				{width > 0 && !allZero ? (
					<Svg width={width} height={CHART_HEIGHT}>
						<Defs>
							<SvgLinearGradient id="earningsArea" x1="0" y1="0" x2="0" y2="1">
								<Stop
									offset="0"
									stopColor={themeColors.primary}
									stopOpacity={0.28}
								/>
								<Stop
									offset="1"
									stopColor={themeColors.primary}
									stopOpacity={0}
								/>
							</SvgLinearGradient>
						</Defs>
						<Path d={area} fill="url(#earningsArea)" />
						<Path
							d={line}
							fill="none"
							stroke={themeColors.primary}
							strokeWidth={2.5}
							strokeLinejoin="round"
							strokeLinecap="round"
						/>
					</Svg>
				) : (
					<View className="flex-1 items-center justify-center rounded-card bg-surface-muted">
						<Text variant="caption" className="text-content-muted">
							{t("home.earnings.emptyChart")}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}
