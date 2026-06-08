import { Wrench } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Category } from "@/src/features/categories/schemas/response.schema";
import { getCategoryMeta } from "@/src/features/categories/constants/categories";
import { useThemeColors } from "@/src/constants/design-tokens";

interface CategoryTileProps {
	readonly category: Category;
	readonly index: number;
	readonly onPress: (categoryId: string, categoryName: string) => void;
}

export default function CategoryTile({
	category,
	onPress,
}: CategoryTileProps) {
	const themeColors = useThemeColors();
	const meta = getCategoryMeta(category.id);
	const Icon = meta?.icon ?? Wrench;
	// Unified brand color — categories no longer carry per-category colors.
	const color = themeColors.primary;

	return (
		<TouchableOpacity
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
					{category.name}
				</Text>
			</View>
		</TouchableOpacity>
	);
}
