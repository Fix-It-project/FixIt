import { router } from "expo-router";
import { Star } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { ReviewRow, ReviewStatsHeader } from "@/src/components/reviews";
import { AppRefreshControl } from "@/src/components/ui/app-refresh-control";
import BackButton from "@/src/components/ui/back-button";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useTechnicianReviewsInfiniteQuery } from "@/src/features/reviews/hooks/useTechnicianReviewsInfiniteQuery";
import { getReviewDistribution } from "@/src/features/reviews/utils/review-distribution";
import { useTechSelfProfileQuery } from "@/src/features/tech-self/hooks/useTechSelfProfileQuery";

function ReviewSeparator() {
	return <View className="h-stack-sm" />;
}

export default function TechnicianReviewsScreen() {
	const themeColors = useThemeColors();
	const { data: profile } = useTechSelfProfileQuery();
	const {
		data,
		isLoading,
		isRefetching,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useTechnicianReviewsInfiniteQuery(profile?.id ?? null);

	const reviews = useMemo(
		() => data?.pages.flatMap((p) => p.reviews) ?? [],
		[data],
	);
	const distribution = useMemo(() => getReviewDistribution(reviews), [reviews]);

	return (
		<ScreenSafeAreaView
			className="flex-1"
			edges={["top"]}
			style={{ backgroundColor: Colors.primary }}
		>
			<View className="flex-1 bg-surface">
				{/* Header */}
				<View
					style={{ backgroundColor: Colors.primary }}
					className="flex-row items-center gap-stack-md px-card pt-stack-sm pb-card"
				>
					<BackButton variant="header-inverse" onPress={() => router.back()} />
					<Text variant="h3" style={{ color: themeColors.onPrimaryHeader }}>
						My Reviews
					</Text>
				</View>

				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color={Colors.primary} />
					</View>
				) : (
					<FlatList
						data={reviews}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<View className="px-button-x">
								<ReviewRow review={item} variant="card" />
							</View>
						)}
						ItemSeparatorComponent={ReviewSeparator}
						contentContainerStyle={{
							paddingVertical: spacing.stack.lg,
							paddingBottom: spacing.stack["2xl"],
						}}
						ListHeaderComponent={
							<ReviewStatsHeader
								avgRating={profile?.avg_rating ?? null}
								reviewCount={profile?.review_count ?? 0}
								distribution={distribution}
							/>
						}
						ListEmptyComponent={
							<View className="flex-1 items-center justify-center px-button-x py-stack-xl">
								<Star
									size={40}
									color={themeColors.borderDefault}
									strokeWidth={1.5}
								/>
								<Text
									variant="buttonLg"
									className="mt-stack-md text-center text-content"
								>
									No reviews yet
								</Text>
								<Text
									variant="bodySm"
									className="mt-stack-xs text-center text-content-muted"
								>
									Reviews from completed jobs will appear here.
								</Text>
							</View>
						}
						ListFooterComponent={
							isFetchingNextPage ? (
								<ActivityIndicator
									size="small"
									color={Colors.primary}
									style={{ marginVertical: spacing.stack.lg }}
								/>
							) : null
						}
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) fetchNextPage();
						}}
						onEndReachedThreshold={0.5}
						refreshControl={
							<AppRefreshControl
								refreshing={isRefetching}
								onRefresh={refetch}
							/>
						}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>
		</ScreenSafeAreaView>
	);
}
