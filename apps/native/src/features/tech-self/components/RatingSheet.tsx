import { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import ReviewStatsHeader from "@/src/components/reviews/ReviewStatsHeader";
import BottomSheet, {
	type BottomSheetRef,
} from "@/src/components/ui/bottom-sheet";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useTechSelfReviewSummaryQuery } from "@/src/features/tech-self/hooks/useTechSelfReviewSummaryQuery";

interface RatingSheetProps {
	readonly visible: boolean;
	readonly onClose: () => void;
}

/**
 * Bottom sheet showing the technician's own rating distribution (reuses the
 * shared ReviewStatsHeader bars). Uses the persistent gorhom BottomSheet (the
 * one that works app-wide) rather than the modal variant; driven by `visible`.
 * The per-star breakdown is fetched lazily only while the sheet is open.
 */
export default function RatingSheet({ visible, onClose }: RatingSheetProps) {
	const ref = useRef<BottomSheetRef>(null);
	const themeColors = useThemeColors();
	const { data, isLoading } = useTechSelfReviewSummaryQuery(visible);

	useEffect(() => {
		if (visible) ref.current?.snapToIndex(0);
		else ref.current?.close();
	}, [visible]);

	const handleChange = useCallback(
		(index: number) => {
			if (index < 0) onClose();
		},
		[onClose],
	);

	return (
		<BottomSheet
			ref={ref}
			index={-1}
			snapPoints={undefined}
			enableDynamicSizing
			onChange={handleChange}
		>
			<BottomSheet.View className="pb-screen-bottom-inset">
				{isLoading || !data ? (
					<View className="items-center py-stack-3xl">
						<ActivityIndicator color={themeColors.primary} />
					</View>
				) : (
					<ReviewStatsHeader
						avgRating={data.avg_rating}
						reviewCount={data.review_count}
						distribution={
							data.distribution as unknown as Record<1 | 2 | 3 | 4 | 5, number>
						}
					/>
				)}
			</BottomSheet.View>
		</BottomSheet>
	);
}
