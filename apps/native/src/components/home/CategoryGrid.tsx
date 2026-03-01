import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { CATEGORIES } from "@/src/lib/categories";
import { Colors } from "@/src/lib/colors";

interface CategoryGridProps {
  onCategoryPress?: (categoryId: string) => void;
  onMorePress?: () => void;
}

export default function CategoryGrid({
  onCategoryPress,
  onMorePress,
}: CategoryGridProps) {
  const displayCategories = CATEGORIES.slice(0, 4);

  return (
    <View className="mb-2 px-5">
      {/* Section header */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <Text className="text-[18px] font-bold text-content">Categories</Text>
        <TouchableOpacity onPress={onMorePress} activeOpacity={0.6}>
          <Text className="text-[13px] font-medium" style={{ color: Colors.surfaceMuted }}>
            Show all
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2×2 grid */}
      <View className="flex-row flex-wrap justify-between">
        {displayCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <TouchableOpacity
              key={cat.id}
              className="mb-2.5 overflow-hidden rounded-xl"
              style={{ width: "48.5%", backgroundColor: "#f0f1f3" }}
              onPress={() => onCategoryPress?.(cat.id)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View
                  className="h-16 w-16 items-center justify-center"
                  style={{ backgroundColor: cat.color }}
                >
                  <Icon size={26} color="#fff" strokeWidth={1.75} />
                </View>
                <Text
                  className="flex-1 px-3 text-[14px] font-semibold text-content"
                  numberOfLines={2}
                >
                  {cat.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
