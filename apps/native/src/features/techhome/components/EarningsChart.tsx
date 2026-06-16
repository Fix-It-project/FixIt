import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { EARNINGS_CHART_HEIGHT } from "../constants";

interface EarningsChartProps {
	/** Last 7 days, oldest first — from GET /api/technicians/me/stats. */
	daily: Array<{ date: string; amount: number }>;
}

function weekdayLetter(dateStr: string, labels: readonly string[]): string {
	const d = new Date(`${dateStr}T12:00:00`);
	return labels[d.getDay()] ?? "";
}

const BAR_WIDTH = 22;

/**
 * One animated bar. Bars live in the SAME 7-column flex-row as the weekday
 * labels below, each column `flex-1 items-center`, so every bar is centered
 * under its letter by construction (no chart-library domain padding to drift).
 */
function Bar({
	amount,
	max,
	index,
	isToday,
}: {
	amount: number;
	max: number;
	index: number;
	isToday: boolean;
}) {
	const colors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const height = useSharedValue(0);

	const target =
		max > 0 && amount > 0
			? Math.max(6, (amount / max) * EARNINGS_CHART_HEIGHT)
			: 0;

	useEffect(() => {
		if (reducedMotion) {
			height.value = target;
			return;
		}
		height.value = withDelay(
			index * 70,
			withTiming(target, { duration: 650, easing: Easing.out(Easing.cubic) }),
		);
	}, [target, index, reducedMotion, height]);

	const barStyle = useAnimatedStyle(() => ({ height: height.value }));

	return (
		<View
			className="flex-1 items-center justify-end"
			style={{ height: EARNINGS_CHART_HEIGHT }}
		>
			<Animated.View
				style={[
					{
						width: BAR_WIDTH,
						borderTopLeftRadius: 5,
						borderTopRightRadius: 5,
						backgroundColor: colors.primary,
						opacity: isToday ? 1 : 0.5,
					},
					barStyle,
				]}
			/>
		</View>
	);
}

/**
 * 7-day earnings bars. Plain reanimated bars (no victory/skia) so the bars and
 * the weekday labels share one flex grid and stay aligned on every RN version.
 */
export function EarningsChart({ daily }: EarningsChartProps) {
	const { t } = useTranslation("technician");
	const weekdayLabels = t("home.chart.weekdayLetters", {
		returnObjects: true,
	}) as string[];
	const allZero = daily.every((d) => d.amount === 0);
	const todayIndex = daily.length - 1;
	const max = Math.max(1, ...daily.map((d) => d.amount));

	if (daily.length === 0) return null;

	return (
		<View>
			{allZero ? (
				<View
					className="items-center justify-center rounded-xl bg-surface-muted"
					style={{ height: EARNINGS_CHART_HEIGHT }}
				>
					<Text variant="caption" className="text-content-muted">
						{t("home.earnings.emptyChart")}
					</Text>
				</View>
			) : (
				<View className="flex-row items-end">
					{daily.map((d, i) => (
						<Bar
							key={d.date}
							amount={d.amount}
							max={max}
							index={i}
							isToday={i === todayIndex}
						/>
					))}
				</View>
			)}

			{/* weekday labels — app fonts, today emphasized. Same 7-col grid as bars. */}
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
							{weekdayLetter(d.date, weekdayLabels)}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}
