import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Star } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

interface RatingRowProps {
  readonly rating: number;
  readonly reviewCount: number;
}

export default function RatingRow({ rating, reviewCount }: RatingRowProps) {
  return (
    <View className="mt-1 flex-row items-center" style={{ gap: 4 }}>
      <Star size={12} color={Colors.ratingDefault} fill={Colors.ratingDefault} strokeWidth={0} />
      <Text
        className="font-semibold text-[12px] text-content"
        style={{ fontFamily: "GoogleSans_600SemiBold" }}
      >
        {rating}
      </Text>
      <Text className="text-[11px] text-content-muted">·</Text>
      <Text className="text-[11px] text-content-muted">
        {reviewCount} reviews
      </Text>
    </View>
  );
}
