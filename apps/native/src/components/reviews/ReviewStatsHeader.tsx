import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

interface Props {
	readonly avgRating: number | null;
	readonly reviewCount: number;
	readonly distribution?: Record<1 | 2 | 3 | 4 | 5, number>;
}

export default function ReviewStatsHeader({
	avgRating,
	reviewCount,
	distribution,
}: Props) {
	const { t } = useTranslation("reviews");
	const themeColors = useThemeColors();
	const maxCount = useMemo(
		() => Math.max(...Object.values(distribution ?? {}), 1),
		[distribution],
	);

	// When there are zero reviews, show "—" + "No reviews yet" regardless of avgRating.
	// The DB's stats column reports rating=5.00 for zero-review rows; UI must not surface that.
	const isEmpty = reviewCount === 0 || avgRating === null;

	let reviewCountLabel: string;
	if (reviewCount === 0) reviewCountLabel = t("stats.noReviews");
	else if (reviewCount === 1) reviewCountLabel = t("stats.reviewOne");
	else reviewCountLabel = t("stats.reviewOther", { count: reviewCount });

	return (
		<View className="px-button-x py-stack-xl">
			<View className="items-center">
				<Text variant="h2" className="text-content">
					{isEmpty ? "—" : (avgRating?.toFixed(2) ?? "—")}
				</Text>
				<Text variant="caption" className="mt-stack-xs text-content-muted">
					{reviewCountLabel}
				</Text>
			</View>

			{distribution ? (
				<View className="mt-stack-lg gap-stack-xs">
					{([5, 4, 3, 2, 1] as const).map((star) => {
						const count = distribution[star];
						return (
							<View key={star} className="flex-row items-center gap-stack-sm">
								<Text variant="caption" className="w-4 text-content-muted">
									{star}
								</Text>
								<View
									className="flex-1 flex-row overflow-hidden rounded-pill"
									style={{ height: 6, backgroundColor: themeColors.overlayDim }}
								>
									<View
										className="rounded-pill"
										style={{
											flex: count / maxCount,
											backgroundColor: themeColors.ratingDefault,
										}}
									/>
								</View>
								<Text
									variant="caption"
									className="w-6 text-right text-content-muted"
								>
									{count}
								</Text>
							</View>
						);
					})}
				</View>
			) : null}
		</View>
	);
}
