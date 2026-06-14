import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { CircleHelp } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { AppRefreshControl } from "@/src/components/ui/app-refresh-control";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { spacing } from "@/src/constants/design-tokens";
import AddNewAddressSheet, {
	type AddNewAddressSheetRef,
} from "@/src/features/addresses/components/user/AddNewAddressSheet";
import AddressBottomSheet, {
	type AddressBottomSheetRef,
} from "@/src/features/addresses/components/user/AddressBottomSheet";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { useDeleteAddressMutation } from "@/src/features/addresses/hooks/useDeleteAddressMutation";
import { orderQueryKeys } from "@/src/features/booking-orders/schemas/query-keys";
import { ActiveOrderStrip } from "@/src/features/newhome/components/ActiveOrderStrip";
import { CategoryRow } from "@/src/features/newhome/components/CategoryRow";
import { HomeHeader } from "@/src/features/newhome/components/HomeHeader";
import { OfferCard } from "@/src/features/newhome/components/OfferCard";
import { PreviousOrdersSection } from "@/src/features/newhome/components/PreviousOrdersSection";
import { TopRatedSection } from "@/src/features/newhome/components/TopRatedSection";
import { technicianQueryKeys } from "@/src/features/technicians/query-keys";
import { formatAddress } from "@/src/lib/helpers/format-address";
import { ROUTES } from "@/src/lib/navigation/routes";
import { confirm } from "@/src/stores/dialog-store";

function NeedHelpShelf() {
	const { t: tr } = useTranslation("home");

	return (
		<View className="px-screen-x">
			<Card className="p-card-roomy" style={{ gap: spacing.stack.md }}>
				<View className="flex-row items-start gap-stack-md">
					<View className="h-control-icon-box-lg w-control-icon-box-lg items-center justify-center rounded-button bg-surface-elevated">
						<Icon as={CircleHelp} size={20} className="text-content" />
					</View>
					<View className="min-w-0 flex-1 gap-stack-xs">
						<Text variant="label" className="text-content">
							{tr("supportShelfTitle")}
						</Text>
						<Text variant="bodySm" className="text-content-secondary">
							{tr("supportShelfBody")}
						</Text>
					</View>
				</View>
				<Button
					variant="secondary"
					size="md"
					fullWidth
					onPress={() => router.push(ROUTES.user.settingsHelp)}
				>
					{tr("contactSupport")}
				</Button>
			</Card>
		</View>
	);
}

export function NewHome() {
	const { t: tr } = useTranslation("home");
	const queryClient = useQueryClient();
	const addressSheetRef = useRef<AddressBottomSheetRef>(null);
	const addNewAddressSheetRef = useRef<AddNewAddressSheetRef>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isAddressAccordionOpen, setIsAddressAccordionOpen] = useState(false);
	const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
	const [isAddAddressSheetOpen, setIsAddAddressSheetOpen] = useState(false);
	const [isAddressSheetTransitioning, setIsAddressSheetTransitioning] =
		useState(false);
	const isAnyAddressSheetOpen =
		isAddressSheetOpen || isAddAddressSheetOpen || isAddressSheetTransitioning;
	const { data: addresses } = useAddressesQuery();
	const deleteAddressMutation = useDeleteAddressMutation();
	const activeAddress =
		addresses?.find((address) => address.is_active) ?? addresses?.[0];
	const addressLabel = activeAddress ? formatAddress(activeAddress) : undefined;

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
		async (addressId: string) => {
			const confirmed = await confirm({
				title: tr("address.deleteConfirmTitle"),
				description: tr("address.deleteConfirmMessage"),
				primary: { label: tr("address.deleteConfirm"), destructive: true },
				secondary: { label: tr("address.cancel") },
			});
			if (!confirmed) return;

			deleteAddressMutation.mutate(addressId, {
				onError: () => {
					void confirm({
						title: tr("address.deleteErrorTitle"),
						description: tr("address.deleteLastError"),
						primary: { label: tr("address.ok") },
					});
				},
			});
		},
		[tr, deleteAddressMutation],
	);
	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		try {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["user-addresses"] }),
				queryClient.invalidateQueries({ queryKey: ["categories"] }),
				queryClient.invalidateQueries({ queryKey: ["newhome"] }),
				queryClient.invalidateQueries({ queryKey: ["technician-profile"] }),
				queryClient.invalidateQueries({ queryKey: technicianQueryKeys.list() }),
				queryClient.invalidateQueries({ queryKey: orderQueryKeys.userOrders }),
			]);
		} finally {
			setIsRefreshing(false);
		}
	}, [queryClient]);

	return (
		<View testID="user-home" className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<AppRefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
						useTopInset
					/>
				}
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
					<NeedHelpShelf />
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
