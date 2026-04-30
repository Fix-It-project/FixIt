import { router } from "expo-router";
import { useCallback, useRef } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddNewAddressSheet, {
	type AddNewAddressSheetRef,
} from "@/src/features/addresses/components/user/AddNewAddressSheet";
import AddressBottomSheet, {
	type AddressBottomSheetRef,
} from "@/src/features/addresses/components/user/AddressBottomSheet";
import LocationHeader from "@/src/features/addresses/components/user/LocationHeader";
import PreviousOrdersSection from "@/src/features/booking-orders/components/user/PreviousOrdersSection";
import CategoryGrid from "@/src/features/categories/components/user/CategoryGrid";
import { useCategoriesQuery } from "@/src/features/categories/hooks/useCategoriesQuery";
import HeaderPolygons, {
	getHeaderPolygonPalette,
} from "@/src/features/tech-self/components/tech/HeaderPolygons";
import NearYouSection from "@/src/features/technicians/components/user/NearYouSection";
import RecommendedTechnicians from "@/src/features/technicians/components/user/RecommendedTechnicians";
import HomeSearchBar from "@/src/features/users/components/user/HomeSearchBar";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";
import { useThemeColors, useThemeMeta } from "@/src/lib/theme";

export default function Home() {
	const themeColors = useThemeColors();
	const { themeId } = useThemeMeta();
	const addressSheetRef = useRef<AddressBottomSheetRef>(null);
	const addNewAddressSheetRef = useRef<AddNewAddressSheetRef>(null);
	const { data: categories, isLoading: categoriesLoading } =
		useCategoriesQuery();
	const headerPolygonPalette = getHeaderPolygonPalette(themeColors, themeId);

	const handleCategoryPress = useDebounce(
		(categoryId: string, categoryName: string) => {
			router.push({
				pathname: ROUTES.user.services,
				params: { categoryId, categoryName },
			});
		},
	);

	const handleLocationPress = useCallback(() => {
		addressSheetRef.current?.open();
	}, []);

	const handleAddNewAddress = useCallback(() => {
		addressSheetRef.current?.close();
		setTimeout(() => {
			addNewAddressSheetRef.current?.open();
		}, 300);
	}, []);

	const handleNewAddressBack = useCallback(() => {
		setTimeout(() => {
			addressSheetRef.current?.open();
		}, 300);
	}, []);

	return (
		<View className="flex-1 bg-surface-elevated">
			<SafeAreaView
				className="flex-1"
				edges={["top"]}
				style={{ backgroundColor: themeColors.primary }}
			>
				<ScrollView
					className="flex-1 bg-surface-elevated"
					showsVerticalScrollIndicator={false}
					contentContainerClassName="pb-stack-xl"
				>
					<View
						style={{ backgroundColor: themeColors.primary }}
						className="pb-stack-xl"
					>
						<HeaderPolygons palette={headerPolygonPalette} />
						<LocationHeader onLocationPress={handleLocationPress} />
						<HomeSearchBar />
					</View>

					<View className="gap-stack-lg bg-surface-elevated pt-stack-md">
						<CategoryGrid
							categories={categories}
							isLoading={categoriesLoading}
							onCategoryPress={handleCategoryPress}
						/>
						<RecommendedTechnicians />
						<NearYouSection />
						<PreviousOrdersSection />
					</View>
				</ScrollView>

				<AddressBottomSheet
					ref={addressSheetRef}
					onAddNewAddress={handleAddNewAddress}
				/>
				<AddNewAddressSheet
					ref={addNewAddressSheetRef}
					onBack={handleNewAddressBack}
				/>
			</SafeAreaView>
		</View>
	);
}
