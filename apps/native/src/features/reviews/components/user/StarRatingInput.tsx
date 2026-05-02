import { Star } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
  readonly value: number;
  readonly onChange: (rating: number) => void;
  readonly size?: number;
}

export default function StarRatingInput({ value, onChange, size = 36 }: Props) {
  const themeColors = useThemeColors();
  return (
    <View className="flex-row items-center justify-center gap-stack-sm" accessibilityRole="adjustable">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            activeOpacity={0.6}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${star} star${star === 1 ? "" : "s"}`}
            accessibilityState={{ selected: filled }}
          >
            <Star
              size={size}
              color={themeColors.ratingDefault}
              fill={filled ? themeColors.ratingDefault : "transparent"}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
