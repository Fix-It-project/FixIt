import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useCountUp } from "../hooks/useCountUp";
import { useTechHomeStatsQuery } from "../hooks/useTechHomeStatsQuery";
import { formatEgp } from "../utils/money";

function StatTile({
	label,
	value,
	sub,
}: {
	label: string;
	value: string;
	sub?: string;
}) {
	return (
		<View className="flex-1 rounded-2xl border border-overlay-white bg-overlay-sm px-3 py-2.5">
			<Text
				variant="caption"
				className="font-semibold text-tint-on-hero uppercase opacity-65"
				numberOfLines={1}
			>
				{label}
			</Text>
			<Text
				variant="h4"
				className="mt-0.5 font-bold text-tint-on-hero"
				numberOfLines={1}
			>
				{value}
			</Text>
			{sub ? (
				<Text
					variant="caption"
					className="mt-0.5 text-tint-on-hero opacity-70"
					numberOfLines={1}
				>
					{sub}
				</Text>
			) : null}
		</View>
	);
}

/** Today's earnings · jobs done · pending — animated count-up tiles. */
export function HeaderStatStrip() {
	const { data: stats } = useTechHomeStatsQuery();

	const earningsToday = useCountUp(stats?.earnings.today ?? 0);
	const doneToday = useCountUp(stats?.jobs.doneToday ?? 0);
	const pendingCount = useCountUp(stats?.jobs.pendingCount ?? 0);

	return (
		<View className="flex-row gap-stack-sm">
			<StatTile label="Today" value={formatEgp(earningsToday)} />
			<StatTile label="Jobs done" value={String(doneToday)} sub="today" />
			<StatTile
				label="Pending"
				value={String(pendingCount)}
				sub={pendingCount === 1 ? "request" : "requests"}
			/>
		</View>
	);
}
