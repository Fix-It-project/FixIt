import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	getCategoryMeta,
	translateCategoryLabel,
} from "@/src/features/categories/constants/categories";
import type { Category } from "@/src/features/categories/schemas/response.schema";
import { Wrench } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

interface CategoryTileProps {
	readonly category: Category;
	readonly index: number;
	readonly onPress: (categoryId: string, categoryName: string) => void;
}

export default function CategoryTile({ category, onPress }: CategoryTileProps) {
	const { t } = useTranslation("categories");
	const themeColors = useThemeColors();
	const meta = getCategoryMeta(category.id);
	const Icon = meta?.icon ?? Wrench;
	const label = translateCategoryLabel(t, category.id, category.name);
	// Unified brand color — categories no longer carry per-category colors.
	const color = themeColors.primary;

	return (
		<TouchableOpacity
			testID="category-tile"
			className="mb-stack-md overflow-hidden rounded-input"
			style={{
				width: "48.5%",
				backgroundColor: themeColors.surfaceElevated,
			}}
			onPress={() => onPress(category.id, category.name)}
			activeOpacity={0.7}
		>
			<View className="flex-row items-center">
				<View
					className="h-avatar-xl w-avatar-xl items-center justify-center"
					style={{ backgroundColor: color }}
				>
					<Icon
						size={26}
						color={themeColors.surfaceOnPrimary}
						strokeWidth={1.75}
					/>
				</View>
				<Text
					variant="buttonMd"
					className="flex-1 px-stack-md text-content"
					numberOfLines={2}
				>
					{label}
				</Text>
			</View>
		</TouchableOpacity>
	);
}
