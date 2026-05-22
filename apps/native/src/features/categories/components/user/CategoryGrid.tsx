import { router } from "expo-router";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Category } from "@/src/features/categories/schemas/response.schema";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";
import { Colors, useThemeColors } from "@/src/lib/theme";
import CategoryTile from "./CategoryTile";

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
	const displayCategories = categories?.slice(0, 4) ?? [];
	const goToCategories = useDebounce(() => {
		onMorePress?.();
		router.push(ROUTES.user.categories);
	});
	const handleCategoryTap = useDebounce(
		(categoryId: string, categoryName: string) => {
			onCategoryPress?.(categoryId, categoryName);
		},
	);
	let content = (
		<View className="flex-row flex-wrap justify-between">
			{displayCategories.map((cat, index) => (
				<CategoryTile
					key={cat.id}
					category={cat}
					index={index}
					onPress={handleCategoryTap}
				/>
			))}
		</View>
	);

	if (isLoading) {
		content = (
			<View className="h-avatar-xl items-center justify-center">
				<ActivityIndicator size="small" color={Colors.primary} />
			</View>
		);
	}

	return (
		<View className="px-screen-x">
			{/* Section header */}
			<View className="mb-stack-md flex-row items-center justify-between">
				<Text variant="h2" className="text-content">
					Categories
				</Text>
				<TouchableOpacity onPress={goToCategories} activeOpacity={0.6}>
					<Text
						variant="bodySm"
						className="font-medium"
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
