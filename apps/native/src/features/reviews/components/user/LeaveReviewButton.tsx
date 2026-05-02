import { Star } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { reviewSheetRef } from "@/src/features/reviews/components/user/ReviewPromptHost";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
  readonly orderId: string;
  readonly technicianId: string;
  readonly technicianName: string;
}

export default function LeaveReviewButton({ orderId, technicianId, technicianName }: Props) {
  const themeColors = useThemeColors();
  const onPress = () => {
    reviewSheetRef.current?.open(orderId, technicianId, technicianName);
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Leave a review for ${technicianName}`}
      className="flex-row items-center gap-stack-xs rounded-pill border px-stack-md py-stack-xs"
      style={{ borderColor: themeColors.borderDefault }}
    >
      <Star size={14} color={themeColors.ratingDefault} fill={themeColors.ratingDefault} strokeWidth={0} />
      <Text variant="caption" className="font-semibold text-content">Leave review</Text>
    </TouchableOpacity>
  );
}
