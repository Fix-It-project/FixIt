import { Star } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/src/constants/design-tokens";

interface Props {
  readonly value: number;
  readonly onChange: (rating: number) => void;
  readonly size?: number;
}

export default function StarRatingInput({ value, onChange, size = 36 }: Props) {
  const { t } = useTranslation("reviews");
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
            accessibilityLabel={
              star === 1 ? t("star.rateOne") : t("star.rateOther", { n: star })
            }
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
