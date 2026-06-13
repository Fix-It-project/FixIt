import { useMemo } from "react";
import { View } from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { EARNINGS_CHART_HEIGHT } from "../constants";

interface EarningsChartProps {
	/** Last 7 days, oldest first — from GET /api/technicians/me/stats. */
	daily: Array<{ date: string; amount: number }>;
}

function weekdayLetter(dateStr: string): string {
	const d = new Date(`${dateStr}T12:00:00`);
	return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()] ?? "";
}

/**
 * 7-day earnings bars. Victory-native (skia) renders the bars; weekday labels
 * are plain <Text> below so typography stays on app fonts. Isolated component:
 * if victory/skia misbehaves on this RN version, swap internals for plain
 * reanimated bars without touching callers.
 */
export function EarningsChart({ daily }: EarningsChartProps) {
	const colors = useThemeColors();

	const data = useMemo(
		() => daily.map((d, index) => ({ index, amount: d.amount })),
		[daily],
	);
	const allZero = daily.every((d) => d.amount === 0);
	const todayIndex = daily.length - 1;

	if (daily.length === 0) return null;

	return (
		<View>
			{allZero ? (
				<View
					className="items-center justify-center rounded-xl bg-surface-muted"
					style={{ height: EARNINGS_CHART_HEIGHT }}
				>
					<Text variant="caption" className="text-content-muted">
						Earnings from completed jobs will chart here
					</Text>
				</View>
			) : (
				<View style={{ height: EARNINGS_CHART_HEIGHT }}>
					<CartesianChart
						data={data}
						xKey="index"
						yKeys={["amount"]}
						domainPadding={{ left: 16, right: 16, top: 8 }}
					>
						{({ points, chartBounds }) => (
							<Bar
								points={points.amount}
								chartBounds={chartBounds}
								color={colors.primary}
								barWidth={22}
								roundedCorners={{ topLeft: 5, topRight: 5 }}
								animate={{ type: "timing", duration: 700 }}
							/>
						)}
					</CartesianChart>
				</View>
			)}

			{/* weekday labels — app fonts, today emphasized */}
			<View className="mt-1 flex-row">
				{daily.map((d, i) => (
					<View key={d.date} className="flex-1 items-center">
						<Text
							variant="caption"
							className={
								i === todayIndex
									? "font-bold text-content"
									: "text-content-muted"
							}
						>
							{weekdayLetter(d.date)}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}
