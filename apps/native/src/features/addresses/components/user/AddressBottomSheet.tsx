import { Plus, X } from "lucide-react-native";
import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
	ActivityIndicator,
	FlatList,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import {
	BottomSheet,
	type BottomSheetRef,
} from "@/src/components/ui/bottom-sheet";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { useSetActiveAddressMutation } from "@/src/features/addresses/hooks/useSetActiveAddressMutation";
import { useHardwareBackHandler } from "@/src/hooks/useHardwareBackHandler";
import AddressListItem from "./AddressListItem";

export interface AddressBottomSheetRef {
	open: () => void;
	close: () => void;
}

interface AddressBottomSheetProps {
	onAddNewAddress?: () => void;
	onOpenChange?: (isOpen: boolean) => void;
	showAddAction?: boolean;
	showDeleteActions?: boolean;
	onDeleteAddress?: (addressId: string) => void;
}

function AddressSeparator() {
	return <View className="h-px bg-surface-elevated" />;
}

const AddressBottomSheet = forwardRef<
	AddressBottomSheetRef,
	AddressBottomSheetProps
>(function AddressBottomSheet(
	{
		onAddNewAddress,
		onOpenChange,
		showAddAction = true,
		showDeleteActions = false,
		onDeleteAddress,
	},
	ref,
) {
	const { t } = useTranslation("home");
	const themeColors = useThemeColors();
	const bottomSheetRef = useRef<BottomSheetRef>(null);

	const { data: addresses, isLoading, isError } = useAddressesQuery();
	const setActiveMutation = useSetActiveAddressMutation();

	const [optimisticActiveId, setOptimisticActiveId] = useState<string>();
	const [sheetIndex, setSheetIndex] = useState(-1);

	const { height } = useWindowDimensions();
	const snapPoints = useMemo(() => [Math.min(height * 0.65, 560)], [height]);

	useHardwareBackHandler(sheetIndex >= 0, () => {
		bottomSheetRef.current?.close();
		return true;
	});

	useImperativeHandle(ref, () => ({
		open() {
			setOptimisticActiveId(undefined);
			bottomSheetRef.current?.snapToIndex(0);
		},
		close() {
			bottomSheetRef.current?.close();
		},
	}));

	const handleActivate = useCallback(
		(addressId: string) => {
			setOptimisticActiveId(addressId);
			setActiveMutation.mutate(addressId, {
				onSettled: () => setOptimisticActiveId(undefined),
			});
		},
		[setActiveMutation],
	);

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close();
	}, []);

	const handleSheetChange = useCallback(
		(index: number) => {
			setSheetIndex(index);
			onOpenChange?.(index >= 0);
		},
		[onOpenChange],
	);

	const getIsActive = useCallback(
		(id: string, serverActive: boolean) =>
			optimisticActiveId ? id === optimisticActiveId : serverActive,
		[optimisticActiveId],
	);

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={-1}
			snapPoints={snapPoints}
			handleIndicatorStyle={{
				backgroundColor: themeColors.borderDefault,
				width: spacing.sheet.handleWidth,
			}}
			onChange={handleSheetChange}
		>
			<BottomSheet.View className="flex-1 px-button-x pb-stack-xl">
				<View className="mb-stack-sm flex-row items-center justify-between">
					<Text variant="bodyLg" className="font-bold text-content">
						{t("address.sheetTitle")}
					</Text>
					<TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
						<X size={22} color={themeColors.textSecondary} strokeWidth={2} />
					</TouchableOpacity>
				</View>

				{isLoading && (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color={Colors.primary} />
						<Text variant="bodySm" className="mt-stack-md text-content-muted">
							{t("address.loading")}
						</Text>
					</View>
				)}

				{isError && !isLoading && (
					<View className="flex-1 items-center justify-center">
						<Text variant="buttonLg" className="text-center text-danger">
							{t("address.loadErrorTitle")}
						</Text>
						<Text
							variant="bodySm"
							className="mt-stack-xs text-center text-content-muted"
						>
							{t("address.loadErrorMessage")}
						</Text>
					</View>
				)}

				{addresses && !isLoading && (
					<View className="flex-1">
						<Text
							variant="bodySm"
							className="mb-stack-xs font-semibold text-content-secondary"
						>
							{t("address.saved")}
						</Text>

						<FlatList
							data={addresses}
							keyExtractor={(item) => item.id}
							extraData={optimisticActiveId}
							showsVerticalScrollIndicator={false}
							ItemSeparatorComponent={AddressSeparator}
							renderItem={({ item }) => (
								<AddressListItem
									address={item}
									isActive={getIsActive(item.id, item.is_active)}
									onPress={() => handleActivate(item.id)}
									disabled={setActiveMutation.isPending}
									onDelete={
										showDeleteActions && onDeleteAddress
											? () => onDeleteAddress(item.id)
											: undefined
									}
									deleteLabel={t("address.delete")}
								/>
							)}
						/>

						{showAddAction && onAddNewAddress ? (
							<Button
								variant="secondary"
								onPress={onAddNewAddress}
								fullWidth
								iconLeft={Plus}
								className="mt-stack-md"
								accessibilityLabel={t("address.add")}
							>
								{t("address.add")}
							</Button>
						) : null}
					</View>
				)}
			</BottomSheet.View>
		</BottomSheet>
	);
});

export default AddressBottomSheet;
