import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import type { Category } from "@/src/features/categories/schemas/response.schema";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";
import { useThemeColors } from "@/src/constants/design-tokens";
import CategoryTile from "./CategoryTile";

const CATEGORY_SKELETON_KEYS = [
	"category-skeleton-1",
	"category-skeleton-2",
	"category-skeleton-3",
	"category-skeleton-4",
] as const;

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
	const { t } = useTranslation("categories");
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
			<View className="flex-row flex-wrap justify-between">
				{CATEGORY_SKELETON_KEYS.map((key) => (
					<Skeleton
						key={key}
						className="mb-stack-md h-avatar-xl rounded-input"
						style={{ width: "48.5%" }}
					/>
				))}
			</View>
		);
	}

	return (
		<View className="px-screen-x">
			{/* Section header */}
			<View className="mb-stack-md flex-row items-center justify-between">
				<Text variant="h2" className="text-content">
					{t("title")}
				</Text>
				<TouchableOpacity onPress={goToCategories} activeOpacity={0.6}>
					<Text
						variant="bodySm"
						className="font-medium"
						style={{ color: themeColors.textMuted }}
					>
						{t("showAll")}
					</Text>
				</TouchableOpacity>
			</View>
			{content}
		</View>
	);
}
