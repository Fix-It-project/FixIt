import { useCallback, useRef } from "react";
import { ScrollView, View } from "react-native";
import { spacing } from "@/src/constants/design-tokens";
import AddNewAddressSheet, {
	type AddNewAddressSheetRef,
} from "@/src/features/addresses/components/user/AddNewAddressSheet";
import AddressBottomSheet, {
	type AddressBottomSheetRef,
} from "@/src/features/addresses/components/user/AddressBottomSheet";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { ActiveOrderStrip } from "@/src/features/newhome/components/ActiveOrderStrip";
import { CategoryRow } from "@/src/features/newhome/components/CategoryRow";
import { HomeHeader } from "@/src/features/newhome/components/HomeHeader";
import { OfferCard } from "@/src/features/newhome/components/OfferCard";
import { PreviousOrdersSection } from "@/src/features/newhome/components/PreviousOrdersSection";
import { TopRatedSection } from "@/src/features/newhome/components/TopRatedSection";

export function NewHome() {
	const addressSheetRef = useRef<AddressBottomSheetRef>(null);
	const addNewAddressSheetRef = useRef<AddNewAddressSheetRef>(null);
	const { data: addresses } = useAddressesQuery();
	const activeAddress =
		addresses?.find((address) => address.is_active) ?? addresses?.[0];
	const addressLabel = activeAddress
		? `${activeAddress.street}, ${activeAddress.city}`
		: undefined;

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
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingBottom: spacing.screen.scrollBottomInset,
				}}
			>
				<HomeHeader
					onAddressPress={handleLocationPress}
					address={addressLabel}
				/>
				<View
					style={{
						gap: spacing.section.gap,
						paddingTop: spacing.stack.lg,
					}}
				>
					<ActiveOrderStrip />
					<CategoryRow />
					<OfferCard />
					<TopRatedSection />
					<PreviousOrdersSection />
				</View>
				<View style={{ height: 24 }} className="bg-background" />
			</ScrollView>

			<AddressBottomSheet
				ref={addressSheetRef}
				onAddNewAddress={handleAddNewAddress}
			/>
			<AddNewAddressSheet
				ref={addNewAddressSheetRef}
				onBack={handleNewAddressBack}
			/>
		</View>
	);
}
