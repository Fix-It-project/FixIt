import { Star } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { ReviewRow } from "@/src/components/reviews";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { formatRating } from "@/src/constants/format";
import { useReviewSummaryQuery } from "@/src/features/reviews/hooks/useReviewSummaryQuery";
import { useTechnicianReviewsInfiniteQuery } from "@/src/features/reviews/hooks/useTechnicianReviewsInfiniteQuery";

const STARS = [5, 4, 3, 2, 1] as const;

interface DistributionBarProps {
	readonly star: number;
	readonly count: number;
	readonly total: number;
}

function DistributionBar({ star, count, total }: DistributionBarProps) {
	const pct = total > 0 ? Math.round((count / total) * 100) : 0;
	return (
		<View className="flex-row items-center gap-stack-sm">
			<Text variant="caption" className="w-3 text-content-muted">
				{star}
			</Text>
			<View className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-elevated">
				<View
					className="h-full rounded-pill bg-app-primary"
					style={{ width: `${pct}%` }}
				/>
			</View>
			<Text variant="caption" className="w-8 text-right text-content-muted">
				{pct}%
			</Text>
		</View>
	);
}

interface ReviewsTabProps {
	readonly technicianId: string;
	readonly endReachedSignal?: number;
}

export function ReviewsTab({
	technicianId,
	endReachedSignal = 0,
}: ReviewsTabProps) {
	const themeColors = useThemeColors();
	const { data: summary, isLoading: summaryLoading } =
		useReviewSummaryQuery(technicianId);
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useTechnicianReviewsInfiniteQuery(technicianId, 20);

	const reviews = useMemo(
		() => data?.pages.flatMap((p) => p.reviews) ?? [],
		[data],
	);

	const ratedTotal = useMemo(() => {
		if (!summary) return 0;
		return STARS.reduce(
			(sum, star) =>
				sum + summary.distribution[String(star) as "1" | "2" | "3" | "4" | "5"],
			0,
		);
	}, [summary]);

	useEffect(() => {
		if (!endReachedSignal || !hasNextPage || isFetchingNextPage) return;
		void fetchNextPage();
	}, [endReachedSignal, fetchNextPage, hasNextPage, isFetchingNextPage]);

	return (
		<View className="py-stack-md">
			{/* ── Summary ── */}
			{summaryLoading ? (
				<Skeleton className="h-28 w-full rounded-card" />
			) : summary && summary.review_count > 0 ? (
				<View className="flex-row gap-card rounded-card bg-surface-elevated p-card">
					<View className="items-center justify-center pr-card">
						<Text variant="display" className="text-content">
							{summary.avg_rating != null
								? formatRating(summary.avg_rating)
								: "—"}
						</Text>
						<View className="mt-stack-xs flex-row gap-stack-xs">
							{[1, 2, 3, 4, 5].map((s) => (
								<Star
									key={s}
									size={12}
									color={themeColors.ratingDefault}
									fill={
										s <= Math.round(summary.avg_rating ?? 0)
											? themeColors.ratingDefault
											: "transparent"
									}
									strokeWidth={1.5}
								/>
							))}
						</View>
						<Text variant="caption" className="mt-stack-xs text-content-muted">
							{summary.review_count}{" "}
							{summary.review_count === 1 ? "review" : "reviews"}
						</Text>
					</View>
					<View className="flex-1 justify-center gap-stack-xs">
						{STARS.map((star) => (
							<DistributionBar
								key={star}
								star={star}
								count={
									summary.distribution[
										String(star) as "1" | "2" | "3" | "4" | "5"
									]
								}
								total={ratedTotal}
							/>
						))}
					</View>
				</View>
			) : null}

			{/* ── Review list ── */}
			<View className="mt-stack-md">
				{isLoading ? (
					<View className="gap-stack-md">
						<Skeleton className="h-16 w-full rounded-input" />
						<Skeleton className="h-16 w-full rounded-input" />
					</View>
				) : reviews.length === 0 ? (
					<View className="items-center py-section-y">
						<Text variant="buttonLg" className="text-content">
							No reviews yet
						</Text>
						<Text variant="bodySm" className="mt-stack-xs text-content-muted">
							Be the first to book and review.
						</Text>
					</View>
				) : (
					<>
						{reviews.map((review) => (
							<ReviewRow key={review.id} review={review} variant="row" />
						))}
						{isFetchingNextPage ? (
							<LoadingSpinner className="py-stack-lg" size="small" />
						) : null}
					</>
				)}
			</View>
		</View>
	);
}
