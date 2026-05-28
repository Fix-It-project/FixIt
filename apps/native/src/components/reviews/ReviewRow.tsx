import { Star } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { formatRelativeTime } from "@/src/lib/date/relative-time";
import { useThemeColors } from "@/src/constants/design-tokens";
import type { Review } from "./types";

export type ReviewRowVariant = "card" | "row" | "preview";

interface Props {
  readonly review: Review;
  readonly variant?: ReviewRowVariant;
}

const NAME_VARIANT: Record<ReviewRowVariant, "buttonLg" | "buttonMd"> = {
  card: "buttonLg",
  row: "buttonMd",
  preview: "buttonMd",
};

export default function ReviewRow({ review, variant = "row" }: Props) {
  const themeColors = useThemeColors();
  const rating = review.rating ?? 0;

  const containerClassName =
    variant === "card"
      ? "rounded-card p-card"
      : variant === "preview"
      ? "py-stack-sm"
      : "py-stack-md";

  const containerStyle =
    variant === "card"
      ? { backgroundColor: themeColors.surfaceElevated }
      : variant === "row"
      ? { borderBottomWidth: 1, borderBottomColor: themeColors.borderDefault }
      : undefined;

  const commentLines = variant === "preview" ? 2 : undefined;

  return (
    <View className={containerClassName} style={containerStyle}>
      <View className="flex-row items-center justify-between">
        <Text
          variant={NAME_VARIANT[variant]}
          className="text-content flex-1"
          numberOfLines={1}
        >
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
        <Text
          variant="bodySm"
          className="mt-stack-xs text-content-secondary"
          numberOfLines={commentLines}
        >
          {review.comment}
        </Text>
      )}
    </View>
  );
}
