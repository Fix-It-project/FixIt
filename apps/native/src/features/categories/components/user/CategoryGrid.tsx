import { router } from "expo-router";
import { Wrench } from "lucide-react-native";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Category } from "@/src/features/categories/schemas/response.schema";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getCategoryMeta } from "@/src/lib/helpers/category-helpers";
import { Colors, useThemeColors } from "@/src/lib/theme";

interface CategoryGridProps {
	readonly categories?: Category[];
	readonly isLoading?: boolean;
	readonly onCategoryPress?: (categoryId: string, categoryName: string) => void;
	readonly onMorePress?: () => void;
}

export default function CategoryGrid({
	categories,
	isLoading = false,
	onCategoryPress,
	onMorePress,
}: CategoryGridProps) {
	const themeColors = useThemeColors();
	const fallbackColors = themeColors.category.fallbacks;
	const displayCategories = categories?.slice(0, 4) ?? [];
	const goToCategories = useDebounce(() => {
		onMorePress?.();
		router.push("/(app)/(categories)");
	});
	let content = (
		<View className="flex-row flex-wrap justify-between">
			{displayCategories.map((cat, index) => {
				const meta = getCategoryMeta(cat.id);
				const Icon = meta?.icon ?? Wrench;
				const color =
					meta?.color ?? fallbackColors[index % fallbackColors.length];
				return (
					<TouchableOpacity
						key={cat.id}
						className="mb-2.5 overflow-hidden rounded-xl"
						style={{
							width: "48.5%",
							backgroundColor: themeColors.surfaceElevated,
						}}
						onPress={() => onCategoryPress?.(cat.id, cat.name)}
						activeOpacity={0.7}
					>
						<View className="flex-row items-center">
							<View
								className="h-16 w-16 items-center justify-center"
								style={{ backgroundColor: color }}
							>
								<Icon
									size={26}
									color={themeColors.surfaceBase}
									strokeWidth={1.75}
								/>
							</View>
							<Text
								className="flex-1 px-3 font-semibold text-[14px] text-content"
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
	);

	if (isLoading) {
		content = (
			<View className="h-16 items-center justify-center">
				<ActivityIndicator size="small" color={Colors.primary} />
			</View>
		);
	}

	return (
		<View className="px-5">
			{/* Section header */}
			<View className="mb-2.5 flex-row items-center justify-between">
				<Text
					className="font-bold text-[22px] text-content"
					style={{ fontFamily: "GoogleSans_700Bold" }}
				>
					Categories
				</Text>
				<TouchableOpacity onPress={goToCategories} activeOpacity={0.6}>
					<Text
						className="font-medium text-[13px]"
						style={{ color: themeColors.surfaceMuted }}
					>
						Show all
					</Text>
				</TouchableOpacity>
			</View>
			{content}
		</View>
	);
}
