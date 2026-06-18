import { ChevronRight } from "lucide-react-native";
import { Fragment } from "react";
import { Pressable, View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

export interface ProfileMetric {
	readonly key: string;
	readonly value: string | number;
	readonly label: string;
	/** When set, the cell becomes pressable and shows a small affordance. */
	readonly onPress?: () => void;
}

function Cell({
	metric,
	onHero,
}: {
	readonly metric: ProfileMetric;
	readonly onHero: boolean;
}) {
	const themeColors = useThemeColors();
	const valueColor = onHero ? themeColors.tint.onHero : undefined;
	const affordanceColor = onHero
		? themeColors.overlayBright
		: themeColors.textMuted;
	const body = (
		<>
			<View className="flex-row items-center gap-stack-xs">
				<Text
					variant="h3"
					className={onHero ? "font-bold" : "font-bold text-content"}
					style={valueColor ? { color: valueColor } : undefined}
				>
					{metric.value}
				</Text>
				{metric.onPress ? (
					<ChevronRight size={14} color={affordanceColor} strokeWidth={2} />
				) : null}
			</View>
			<Text
				variant="caption"
				className={
					onHero
						? "mt-stack-xs text-center"
						: "mt-stack-xs text-center text-content-muted"
				}
				style={onHero ? { color: themeColors.overlayBright } : undefined}
				numberOfLines={1}
			>
				{metric.label}
			</Text>
		</>
	);

	if (metric.onPress) {
		return (
			<Pressable
				onPress={metric.onPress}
				accessibilityRole="button"
				className="flex-1 items-center active:opacity-70"
			>
				{body}
			</Pressable>
		);
	}
	return <View className="flex-1 items-center">{body}</View>;
}

/**
 * Flat, card-less profile metrics laid out in a single row, divided by thin
 * vertical separators. Only metrics with an `onPress` carry a tap affordance.
 * When `onHero`, text + divider switch to overlay colors so figures stay legible
 * on the gradient (no cards). Otherwise it sits on the surface with padding.
 */
export default function ProfileMetrics({
	metrics,
	onHero = false,
}: {
	readonly metrics: readonly ProfileMetric[];
	readonly onHero?: boolean;
}) {
	const themeColors = useThemeColors();
	return (
		<View
			className={
				onHero
					? "flex-row items-center"
					: "flex-row items-center px-screen-x py-stack-lg"
			}
		>
			{metrics.map((metric, index) => (
				<Fragment key={metric.key}>
					{index > 0 ? (
						onHero ? (
							<View
								className="h-8 w-px"
								style={{ backgroundColor: themeColors.overlayMd }}
							/>
						) : (
							<Separator orientation="vertical" className="h-8" />
						)
					) : null}
					<Cell metric={metric} onHero={onHero} />
				</Fragment>
			))}
		</View>
	);
}
