import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, View } from "react-native";
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
	const { t: tr } = useTranslation("home");
	const addressSheetRef = useRef<AddressBottomSheetRef>(null);
	const addNewAddressSheetRef = useRef<AddNewAddressSheetRef>(null);
	const [isAddressAccordionOpen, setIsAddressAccordionOpen] = useState(false);
	const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
	const [isAddAddressSheetOpen, setIsAddAddressSheetOpen] = useState(false);
	const [isAddressSheetTransitioning, setIsAddressSheetTransitioning] =
		useState(false);
	const isAnyAddressSheetOpen =
		isAddressSheetOpen || isAddAddressSheetOpen || isAddressSheetTransitioning;
	const { data: addresses } = useAddressesQuery();
	const activeAddress =
		addresses?.find((address) => address.is_active) ?? addresses?.[0];
	const addressLabel = activeAddress
		? `${activeAddress.street}, ${activeAddress.city}`
		: undefined;

	const handleChangeAddressPress = useCallback(() => {
		setIsAddressSheetTransitioning(true);
		addressSheetRef.current?.open();
	}, []);

	const handleOpenAddAddress = useCallback(() => {
		setIsAddressSheetTransitioning(true);
		addressSheetRef.current?.close();
		setTimeout(() => {
			addNewAddressSheetRef.current?.open();
		}, 220);
	}, []);

	const handleAddressExpandedChange = useCallback(
		(expanded: boolean) => {
			if (expanded && isAnyAddressSheetOpen) {
				return;
			}
			setIsAddressAccordionOpen(expanded);
		},
		[isAnyAddressSheetOpen],
	);

	const handleDeleteAddress = useCallback(
		(_addressId: string) => {
			Alert.alert(
				tr("address.deleteUnavailableTitle"),
				tr("address.deleteUnavailableMessage"),
			);
		},
		[tr],
	);

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
					address={addressLabel}
					addressExpanded={isAddressAccordionOpen}
					onAddressExpandedChange={handleAddressExpandedChange}
					onChangeAddressPress={handleChangeAddressPress}
					onAddAddressPress={handleOpenAddAddress}
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
				onAddNewAddress={handleOpenAddAddress}
				showAddAction={false}
				showDeleteActions
				onDeleteAddress={handleDeleteAddress}
				onOpenChange={(isOpen) => {
					setIsAddressSheetOpen(isOpen);
					if (isOpen) {
						setIsAddressSheetTransitioning(false);
					}
				}}
			/>
			<AddNewAddressSheet
				ref={addNewAddressSheetRef}
				onOpenChange={(isOpen) => {
					setIsAddAddressSheetOpen(isOpen);
					setIsAddressSheetTransitioning(false);
				}}
			/>
		</View>
	);
}
