import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Wrench } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";
import { getCategoryMeta } from "@/src/lib/helpers/category-helpers";
import { useCategoriesQuery } from "@/src/hooks/categories/useCategoriesQuery";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";

export default function CategoriesScreen() {
  const themeColors = useThemeColors();
  const fallbackColors = themeColors.category.fallbacks;
  const { data: categories, isLoading, isError, refetch } = useCategoriesQuery();

  const handleCategoryPress = useDebounce((categoryId: string, categoryName: string) => {
    router.push({
      pathname: ROUTES.user.services,
      params: { categoryId, categoryName },
    });
  });

  return (
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-5 pb-3 pt-4">
          <Text
            className="text-[26px] font-bold text-content"
            style={{ fontFamily: "GoogleSans_700Bold" }}
          >
            Categories
          </Text>
        </View>

        {isLoading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

        {isError && !isLoading && (
          <View className="flex-1 items-center justify-center gap-2">
            <Text className="text-[14px] text-content-muted">
              Failed to load categories.
            </Text>
            <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7}>
              <Text className="text-[14px] font-semibold text-app-primary">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-5 pb-6"
          >
            <View className="flex-row flex-wrap justify-between">
              {categories?.map((cat, index) => {
                const meta = getCategoryMeta(cat.id);
                const Icon = meta?.icon ?? Wrench;
                const color = meta?.color ?? fallbackColors[index % fallbackColors.length];
                return (
                  <TouchableOpacity
                    key={cat.id}
                    className="mb-3 overflow-hidden rounded-xl"
                    style={{ width: "48.5%", backgroundColor: themeColors.surfaceElevated }}
                    onPress={() => handleCategoryPress(cat.id, cat.name)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="h-16 w-16 items-center justify-center"
                        style={{ backgroundColor: color }}
                      >
                        <Icon size={26} color={themeColors.surfaceOnPrimary} strokeWidth={1.75} />
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
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
