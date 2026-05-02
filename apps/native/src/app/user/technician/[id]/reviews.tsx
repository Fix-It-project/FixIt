import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/src/components/ui/BackButton";
import { Text } from "@/src/components/ui/text";
import ReviewListRow from "@/src/features/reviews/components/ReviewListRow";
import ReviewStatsHeader from "@/src/features/reviews/components/ReviewStatsHeader";
import { useTechnicianReviewsInfiniteQuery } from "@/src/features/reviews/hooks/useTechnicianReviewsInfiniteQuery";
import { useTechnicianProfileQuery } from "@/src/features/technicians/hooks/useTechnicianProfileQuery";
import { Colors, useThemeColors } from "@/src/lib/theme";

export default function TechnicianReviewsScreen() {
  const themeColors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: profile } = useTechnicianProfileQuery(id ?? null);
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTechnicianReviewsInfiniteQuery(id ?? null);

  const reviews = useMemo(
    () => data?.pages.flatMap((p) => p.reviews) ?? [],
    [data],
  );

  const distribution = useMemo(() => {
    const dist: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (r.rating && r.rating >= 1 && r.rating <= 5) {
        dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    }
    return dist;
  }, [reviews]);

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: Colors.primary }}
    >
      <View className="flex-1 bg-surface-elevated">
        {/* Header */}
        <View
          style={{ backgroundColor: Colors.primary }}
          className="flex-row items-center px-card pb-card pt-stack-sm gap-stack-md"
        >
          <BackButton variant="header-inverse" onPress={() => router.back()} />
          <View className="flex-1">
            <Text variant="h3" style={{ color: themeColors.onPrimaryHeader }} numberOfLines={1}>
              Reviews
            </Text>
            {profile?.name ? (
              <Text variant="caption" style={{ color: themeColors.overlayBright }} numberOfLines={1}>
                {profile.name}
              </Text>
            ) : null}
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ReviewListRow review={item} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            ListHeaderComponent={
              <ReviewStatsHeader
                avgRating={profile?.avg_rating ?? null}
                reviewCount={profile?.review_count ?? 0}
                distribution={distribution}
              />
            }
            ListEmptyComponent={
              !isLoading ? (
                <View className="flex-1 items-center justify-center py-stack-xl">
                  <Text variant="buttonLg" className="text-center text-content">
                    No reviews yet
                  </Text>
                  <Text variant="bodySm" className="mt-stack-xs text-center text-content-muted">
                    Reviews will appear here once completed.
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 16 }} />
              ) : null
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={Colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
