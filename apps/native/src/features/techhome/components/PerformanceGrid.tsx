import { View } from "react-native";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { useTechHomeStatsQuery } from "../hooks/useTechHomeStatsQuery";
import { SectionHeader } from "./SectionHeader";

function pct(rate: number | null | undefined): string {
	return rate == null ? "—" : `${Math.round(rate * 100)}%`;
}

function StatCard({
	label,
	value,
	sub,
	accentClass,
}: {
	label: string;
	value: string;
	sub: string;
	accentClass: string;
}) {
	return (
		<Card elevated className="flex-1 p-card-compact">
			<View className={`h-2 w-2 rounded-full ${accentClass}`} />
			<Text variant="h3" className="mt-stack-sm font-bold text-content">
				{value}
			</Text>
			<Text
				variant="label"
				className="mt-0.5 font-semibold text-content-secondary"
			>
				{label}
			</Text>
			<Text variant="caption" className="text-content-muted">
				{sub}
			</Text>
		</Card>
	);
}

/** 2×2 performance grid — every figure computed server-side from real data. */
export function PerformanceGrid() {
	const { data: stats } = useTechHomeStatsQuery();

	const rating =
		stats?.rates.rating == undefined ? "—" : stats.rates.rating.toFixed(2);
	const reviews = stats?.rates.reviewCount ?? 0;

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader title="Performance" hint="Better stats bring more jobs" />
			<View className="gap-stack-sm">
				<View className="flex-row gap-stack-sm">
					<StatCard
						label="Acceptance rate"
						value={pct(stats?.rates.acceptanceRate)}
						sub="last 30 days"
						accentClass="bg-success"
					/>
					<StatCard
						label="Jobs this week"
						value={String(stats?.jobs.thisWeek ?? 0)}
						sub="completed"
						accentClass="bg-app-primary"
					/>
				</View>
				<View className="flex-row gap-stack-sm">
					<StatCard
						label="Rating"
						value={rating}
						sub={`${reviews} ${reviews === 1 ? "review" : "reviews"}`}
						accentClass="bg-star"
					/>
					<StatCard
						label="Cancellation rate"
						value={pct(stats?.rates.cancellationRate)}
						sub="last 30 days"
						accentClass="bg-danger"
					/>
				</View>
			</View>
		</View>
	);
}
