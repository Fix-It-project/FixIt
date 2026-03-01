import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { MoreHorizontal } from "lucide-react-native";
import { CATEGORIES } from "@/src/lib/categories";
import { Colors } from "@/src/lib/colors";

/** Convert hex to rgba */
function hexToRgba(hex: string, alpha: number) {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface CategoryGridProps {
  onCategoryPress?: (categoryId: string) => void;
  onMorePress?: () => void;
}

export default function CategoryGrid({
  onCategoryPress,
  onMorePress,
}: CategoryGridProps) {
  // Show first 7 categories + "More" button
  const displayCategories = CATEGORIES.slice(0, 7);

  return (
    <View className="mx-5 mb-4">
      <View className="flex-row flex-wrap">
        {displayCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <TouchableOpacity
              key={cat.id}
              className="mb-4 w-1/4 items-center"
              onPress={() => onCategoryPress?.(cat.id)}
              activeOpacity={0.7}
            >
              <View
                className="mb-2 h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: hexToRgba(cat.color, 0.12) }}
              >
                <Icon size={26} color={cat.color} strokeWidth={1.75} />
              </View>
              <Text
                className="text-center text-[11px] font-medium text-content"
                numberOfLines={2}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* More button */}
        <TouchableOpacity
          className="mb-4 w-1/4 items-center"
          onPress={onMorePress}
          activeOpacity={0.7}
        >
          <View
            className="mb-2 h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: hexToRgba(Colors.brand, 0.1) }}
          >
            <MoreHorizontal size={26} color={Colors.brand} strokeWidth={1.75} />
          </View>
          <Text className="text-center text-[11px] font-medium text-content">
            More
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
