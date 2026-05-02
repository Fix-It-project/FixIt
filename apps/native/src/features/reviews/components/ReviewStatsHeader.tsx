import { useMemo } from "react";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { TechnicianReviewFromSchema } from "@/src/features/reviews/schemas/review.schema";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
  readonly avgRating: number | null;
  readonly reviewCount: number;
  readonly distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export default function ReviewStatsHeader({ avgRating, reviewCount, distribution }: Props) {
  const themeColors = useThemeColors();
  const maxCount = useMemo(() => Math.max(...Object.values(distribution), 1), [distribution]);

  return (
    <View className="px-button-x py-stack-xl">
      <View className="items-center">
        <Text variant="h2" className="text-content">
          {reviewCount === 0 || avgRating === null ? "—" : avgRating.toFixed(1)}
        </Text>
        <Text variant="caption" className="mt-stack-xs text-content-muted">
          {reviewCount === 0
            ? "No reviews yet"
            : reviewCount === 1
            ? "1 review"
            : `${reviewCount} reviews`}
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
