import { Star } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { TechnicianReviewFromSchema } from "@/src/features/reviews/schemas/review.schema";
import { formatRelativeTime } from "@/src/features/reviews/utils/relative-time";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
  readonly review: TechnicianReviewFromSchema;
}

export default function ReviewListItem({ review }: Props) {
  const themeColors = useThemeColors();
  const rating = review.rating ?? 0;

  return (
    <View
      className="rounded-card p-card"
      style={{ backgroundColor: themeColors.surfaceElevated }}
    >
      <View className="flex-row items-center justify-between">
        <Text variant="buttonLg" className="text-content flex-1" numberOfLines={1}>
          {review.reviewer_name ?? "Anonymous"}
        </Text>
        <Text variant="caption" className="text-content-muted ml-stack-sm">
          {formatRelativeTime(review.created_at)}
        </Text>
      </View>
      {review.rating !== null && (
        <View className="mt-stack-xs flex-row gap-stack-xs">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              color={themeColors.ratingDefault}
              fill={star <= rating ? themeColors.ratingDefault : "transparent"}
              strokeWidth={1.5}
            />
          ))}
        </View>
      )}
      {!!review.comment && (
        <Text variant="bodySm" className="mt-stack-xs text-content-secondary">
          {review.comment}
        </Text>
      )}
    </View>
  );
}
