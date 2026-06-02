import { router } from "expo-router";
import {
	ActivityIndicator,
	ScrollView,
	View,
} from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import CategoryTile from "@/src/features/categories/components/user/CategoryTile";
import { useCategoriesQuery } from "@/src/features/categories/hooks/useCategoriesQuery";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";
import { Colors } from "@/src/constants/design-tokens";

export default function CategoriesScreen() {
	const {
		data: categories,
		isLoading,
		isError,
		refetch,
	} = useCategoriesQuery();

	const handleCategoryPress = useDebounce(
		(categoryId: string, categoryName: string) => {
			router.push({
				pathname: ROUTES.user.services,
				params: { categoryId, categoryName },
			});
		},
	);

	return (
		<View className="flex-1 bg-surface">
			<View className="px-screen-x pt-card pb-stack-md">
				<Text variant="h2" className="text-content">
					Categories
				</Text>
			</View>

			{isLoading && (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			)}

			{isError && !isLoading && (
				<View className="flex-1 items-center justify-center gap-stack-sm">
					<Text variant="bodySm" className="text-content-muted">
						Failed to load categories.
					</Text>
					<Button variant="link" size="sm" onPress={() => refetch()}>
						Retry
					</Button>
				</View>
			)}

			{!isLoading && !isError && (
				<ScrollView
					className="flex-1"
					showsVerticalScrollIndicator={false}
					contentContainerClassName="px-screen-x pb-stack-xl"
				>
					<View className="flex-row flex-wrap justify-between">
						{categories?.map((cat, index) => (
							<CategoryTile
								key={cat.id}
								category={cat}
								index={index}
								onPress={handleCategoryPress}
							/>
						))}
					</View>
				</ScrollView>
			)}
		</View>
	);
}
