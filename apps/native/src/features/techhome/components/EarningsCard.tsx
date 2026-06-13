import { TrendingDown, TrendingUp } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useCountUp } from "../hooks/useCountUp";
import { useTechHomeStatsQuery } from "../hooks/useTechHomeStatsQuery";
import { earningsDeltaPct, formatEgp } from "../utils/money";
import { EarningsChart } from "./EarningsChart";

/**
 * Earnings hero — overlaps the gradient header (negative margin applied by the
 * parent screen). "Cash out" is intentionally disabled until a payout provider
 * is integrated; everything else is live data.
 */
export function EarningsCard() {
	const { data: stats } = useTechHomeStatsQuery();

	const today = stats?.earnings.today ?? 0;
	const yesterday = stats?.earnings.yesterday ?? 0;
	const week = stats?.earnings.thisWeek ?? 0;
	const animatedToday = useCountUp(today);
	const delta = earningsDeltaPct(today, yesterday);

	return (
		<Card elevated className="p-card">
			<View className="flex-row items-start justify-between">
				<View className="flex-1">
					<Text variant="caption" className="text-content-muted">
						Today's earnings
					</Text>
					<Text variant="display" className="mt-1 font-bold text-content">
						{formatEgp(animatedToday)}
					</Text>
					{delta === undefined ? null : (
						<View className="mt-2 flex-row items-center gap-1 self-start">
							<Icon
								as={delta >= 0 ? TrendingUp : TrendingDown}
								size={12}
								className={delta >= 0 ? "text-success" : "text-danger"}
							/>
							<Text
								variant="caption"
								className={delta >= 0 ? "text-success" : "text-danger"}
							>
								{delta >= 0 ? "+" : ""}
								{delta}% vs yesterday
							</Text>
						</View>
					)}
				</View>

				<Button
					variant="tonal"
					size="sm"
					disabled
					accessibilityLabel="Cash out — coming soon"
				>
					<Text variant="buttonMd" className="text-app-primary">
						Cash out
					</Text>
				</Button>
			</View>

			{/* 7-day chart */}
			<View className="pt-stack-sm">
				<EarningsChart daily={stats?.earnings.daily ?? []} />
			</View>

			{/* weekly total — hairline divider, no second surface */}
			<View className="mt-stack-sm flex-row items-center justify-between border-edge border-t pt-stack-sm">
				<Text variant="caption" className="text-content-secondary">
					This week
				</Text>
				<Text variant="body" className="font-bold text-content">
					{formatEgp(week)}
				</Text>
			</View>
		</Card>
	);
}
