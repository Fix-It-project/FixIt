import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useTechHomeStatsQuery } from "../hooks/useTechHomeStatsQuery";
import { SectionHeader } from "./SectionHeader";

function pct(rate: number | null | undefined): string {
	return rate == null ? "—" : `${Math.round(rate * 100)}%`;
}

/** A single bare stat figure — no card surface, divided by hairlines only. */
function StatCell({
	label,
	value,
	sub,
	className = "",
}: {
	label: string;
	value: string;
	sub: string;
	className?: string;
}) {
	return (
		<View className={`flex-1 py-stack-sm ${className}`}>
			<Text variant="h2" className="font-bold text-content">
				{value}
			</Text>
			<Text variant="caption" className="mt-0.5 text-content-secondary">
				{label}
			</Text>
			<Text variant="caption" className="text-content-muted">
				{sub}
			</Text>
		</View>
	);
}

/** 2×2 performance figures — bare numbers, no fills, every figure server-side. */
export function PerformanceGrid() {
	const { data: stats } = useTechHomeStatsQuery();

	// Weekly rating — this week's reviews only, separate from the lifetime figure.
	const rating =
		stats?.rates.weeklyRating == null
			? "—"
			: stats.rates.weeklyRating.toFixed(2);
	const reviews = stats?.rates.weeklyReviewCount ?? 0;

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader title="Performance" />
			<View className="gap-stack-md">
				<View className="flex-row">
					<StatCell
						label="Acceptance rate"
						value={pct(stats?.rates.acceptanceRate)}
						sub="last 30 days"
						className="pr-card-compact"
					/>
					<StatCell
						label="Jobs this week"
						value={String(stats?.jobs.thisWeek ?? 0)}
						sub="completed"
						className="pl-card-compact"
					/>
				</View>
				<View className="flex-row">
					<StatCell
						label="Rating"
						value={rating}
						sub={`${reviews} ${reviews === 1 ? "review" : "reviews"} this week`}
						className="pr-card-compact"
					/>
					<StatCell
						label="Cancellation rate"
						value={pct(stats?.rates.cancellationRate)}
						sub="last 30 days"
						className="pl-card-compact"
					/>
				</View>
			</View>
		</View>
	);
}
