import { router } from "expo-router";
import { Wrench } from "lucide-react-native";
import { ActivityIndicator, Pressable, View } from "react-native";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import SectionHeader from "@/src/components/user/home/SectionHeader";
import { Colors } from "@/src/lib/colors";
import { ICON_MAP } from "@/src/lib/helpers/category-helpers";
import type { Category } from "@/src/services/categories/schemas/response.schema";

interface CategoryGridProps {
	categories?: Category[];
	isLoading?: boolean;
	onCategoryPress?: (categoryId: string, categoryName: string) => void;
	onMorePress?: () => void;
}

const FALLBACK_COLORS = Colors.category.fallbacks;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CategoryCardProps {
	cat: Category;
	index: number;
	color: string;
	Icon: React.ComponentType<{
		size: number;
		color: string;
		strokeWidth: number;
	}>;
	onCategoryPress?: (categoryId: string, categoryName: string) => void;
}

function CategoryCard({
	cat,
	index,
	color,
	Icon,
	onCategoryPress,
}: CategoryCardProps) {
	const scale = useSharedValue(1);
	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<AnimatedPressable
			entering={FadeInDown.delay(index * 60).duration(350)}
			style={[{ width: "48.5%", marginBottom: 10 }, animStyle]}
			onPressIn={() => {
				scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
			}}
			onPressOut={() => {
				scale.value = withSpring(1, { damping: 15, stiffness: 300 });
			}}
			onPress={() => onCategoryPress?.(cat.id, cat.name)}
		>
			<View
				className="rounded-xl p-3"
				style={{ backgroundColor: Colors.surfaceLight }}
			>
				<View className="flex-row items-center gap-3">
					<View
						className="h-14 w-14 items-center justify-center rounded-xl"
						style={{ backgroundColor: color }}
					>
						<Icon size={24} color={Colors.white} strokeWidth={1.75} />
					</View>
					<Text
						className="flex-1 font-semibold text-[14px] text-content"
						style={{ fontFamily: "GoogleSans_600SemiBold" }}
						numberOfLines={2}
					>
						{cat.name}
					</Text>
				</View>
			</View>
		</AnimatedPressable>
	);
}

export default function CategoryGrid({
	categories,
	isLoading = false,
	onCategoryPress,
	onMorePress,
}: CategoryGridProps) {
	const displayCategories = categories?.slice(0, 4) ?? [];

	return (
		<View className="px-5">
			<SectionHeader
				title="Categories"
				actionLabel="Show all"
				onActionPress={() => {
					onMorePress?.();
					router.push("/(app)/(categories)");
				}}
			/>

			{isLoading && (
				<View className="h-16 items-center justify-center">
					<ActivityIndicator size="small" color={Colors.brand} />
				</View>
			)}

			{!isLoading && (
				<View className="flex-row flex-wrap justify-between">
					{displayCategories.map((cat, index) => {
						const meta = ICON_MAP[cat.id];
						const Icon = meta?.icon ?? Wrench;
						const color =
							meta?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
						return (
							<CategoryCard
								key={cat.id}
								cat={cat}
								index={index}
								color={color}
								Icon={Icon}
								onCategoryPress={onCategoryPress}
							/>
						);
					})}
				</View>
			)}
		</View>
	);
}
