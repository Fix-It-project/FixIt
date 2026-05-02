import { Star } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { TechnicianReviewFromSchema } from "@/src/features/reviews/schemas/review.schema";
import { formatRelativeTime } from "@/src/features/reviews/utils/relativeTime";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
  readonly review: TechnicianReviewFromSchema;
}

export default function ReviewPreviewRow({ review }: Props) {
  const themeColors = useThemeColors();
  const rating = review.rating ?? 0;

  return (
    <View className="py-stack-sm">
      <View className="flex-row items-center justify-between">
        <Text variant="buttonMd" className="text-content" numberOfLines={1} style={{ flex: 1 }}>
          {review.reviewer_name ?? "Anonymous"}
        </Text>
        <Text variant="caption" className="text-content-muted ml-stack-sm">
          {formatRelativeTime(review.created_at)}
        </Text>
      </View>
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
      {!!review.comment && (
        <Text
          variant="bodySm"
          className="mt-stack-xs text-content-secondary"
          numberOfLines={2}
        >
          {review.comment}
        </Text>
      )}
    </View>
  );
}
