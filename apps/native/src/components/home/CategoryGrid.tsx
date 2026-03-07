import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Wrench } from "lucide-react-native";
import { router } from "expo-router";
import { Text } from "@/src/components/ui/text";
import { CATEGORIES } from "@/src/lib/categories";
import { Colors } from "@/src/lib/colors";
import { useCategoriesQuery } from "@/src/hooks/categories/useCategoriesQuery";

interface CategoryGridProps {
  onCategoryPress?: (categoryId: string, categoryName: string) => void;
  onMorePress?: () => void;
}

const ICON_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, { icon: c.icon, color: c.color }])
);

const FALLBACK_COLORS = Colors.category.fallbacks;

export default function CategoryGrid({
  onCategoryPress,
  onMorePress,
}: CategoryGridProps) {
  const { data: categories, isLoading } = useCategoriesQuery();

  const displayCategories = categories?.slice(0, 4) ?? [];

  return (
    <View className="px-5">
      {/* Section header */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <Text className="text-[22px] font-bold text-content" style={{ fontFamily: "GoogleSans_700Bold" }}>Categories</Text>
        <TouchableOpacity onPress={() => { onMorePress?.(); router.push("/(app)/categories" as any); }} activeOpacity={0.6}>
          <Text className="text-[13px] font-medium" style={{ color: Colors.surfaceMuted }}>
            Show all
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {isLoading && (
        <View className="h-16 items-center justify-center">
          <ActivityIndicator size="small" color={Colors.brand} />
        </View>
      )}

      {/* 2×2 grid */}
      {!isLoading && (
        <View className="flex-row flex-wrap justify-between">
          {displayCategories.map((cat, index) => {
            const meta = ICON_MAP[cat.id];
            const Icon = meta?.icon ?? Wrench;
            const color = meta?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
            return (
              <TouchableOpacity
                key={cat.id}
                className="mb-2.5 overflow-hidden rounded-xl"
                style={{ width: "48.5%", backgroundColor: "#f0f1f3" }}
                onPress={() => onCategoryPress?.(cat.id, cat.name)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View
                    className="h-16 w-16 items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={26} color="#fff" strokeWidth={1.75} />
                  </View>
                  <Text
                    className="flex-1 px-3 text-[14px] font-semibold text-content"
                    style={{ fontFamily: "GoogleSans_600SemiBold" }}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
