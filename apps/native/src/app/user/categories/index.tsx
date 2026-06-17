import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/design-tokens";
import CategoryTile from "@/src/features/categories/components/user/CategoryTile";
import { useCategoriesQuery } from "@/src/features/categories/hooks/useCategoriesQuery";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";

export default function CategoriesScreen() {
	const { t } = useTranslation("categories");
	const {
		data: categories,
		isLoading,
		isError,
		refetch,
	} = useCategoriesQuery();

	const handleCategoryPress = useDebounce(
		(categoryId: string, categoryName: string) => {
			router.push({
				pathname: ROUTES.user.technicians,
				params: { categoryId, categoryName },
			});
		},
	);

	return (
		<ScreenSafeAreaView edges={["top"]} className="flex-1 bg-surface">
			<ScreenStatusBar variant="surface" />
			<View className="flex-row items-center gap-stack-sm px-screen-x pt-card pb-stack-md">
				<PressableScale
					onPress={() => router.back()}
					accessibilityRole="button"
					accessibilityLabel={t("goBack")}
				>
					<ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
				</PressableScale>
				<Text variant="h2" className="flex-1 text-content">
					{t("title")}
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
						{t("loadError")}
					</Text>
					<Button variant="link" size="sm" onPress={() => refetch()}>
						{t("retry")}
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
		</ScreenSafeAreaView>
	);
}
