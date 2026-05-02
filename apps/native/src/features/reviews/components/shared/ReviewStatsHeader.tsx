import { useMemo } from "react";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { TechnicianReviewFromSchema } from "@/src/features/reviews/schemas/review.schema";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
  readonly avgRating: number | null;
  readonly totalCount: number;
  /** Distribution computed client-side from currently-loaded reviews (v1 approximation). */
  readonly reviews: TechnicianReviewFromSchema[];
}

export default function ReviewStatsHeader({ avgRating, totalCount, reviews }: Props) {
  const themeColors = useThemeColors();

  const distribution = useMemo(() => {
    const dist: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (r.rating && r.rating >= 1 && r.rating <= 5) {
        dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    }
    return dist;
  }, [reviews]);

  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <View className="px-button-x py-stack-xl">
      <View className="items-center">
        <Text variant="h2" className="text-content">
          {totalCount === 0 || avgRating === null ? "—" : avgRating.toFixed(1)}
        </Text>
        <Text variant="caption" className="mt-stack-xs text-content-muted">
          {totalCount === 0
            ? "No reviews yet"
            : totalCount === 1
            ? "1 review"
            : `${totalCount} reviews`}
        </Text>
      </View>

      <View className="mt-stack-lg gap-stack-xs">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = distribution[star];
                return (
            <View key={star} className="flex-row items-center gap-stack-sm">
              <Text variant="caption" className="w-4 text-content-muted">{star}</Text>
              <View
                className="flex-1 flex-row overflow-hidden rounded-pill"
                style={{ height: 6, backgroundColor: themeColors.overlayDim }}
              >
                <View
                  className="rounded-pill"
                  style={{ flex: count / maxCount, backgroundColor: themeColors.ratingDefault }}
                />
              </View>
              <Text variant="caption" className="w-6 text-right text-content-muted">{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
