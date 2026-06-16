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
import { RadioGroup } from "@/src/components/ui/radio-group";
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
	return <View className="h-px bg-edge" />;
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
	const { t } = useTranslation("addresses");
	const themeColors = useThemeColors();
	const bottomSheetRef = useRef<BottomSheetRef>(null);

	const { data: addresses, isLoading, isError } = useAddressesQuery();
	const setActiveMutation = useSetActiveAddressMutation();

	const [sheetIndex, setSheetIndex] = useState(-1);

	const { height } = useWindowDimensions();
	const snapPoints = useMemo(() => [Math.min(height * 0.65, 560)], [height]);

	useHardwareBackHandler(sheetIndex >= 0, () => {
		bottomSheetRef.current?.close();
		return true;
	});

	useImperativeHandle(ref, () => ({
		open() {
			bottomSheetRef.current?.snapToIndex(0);
		},
		close() {
			bottomSheetRef.current?.close();
		},
	}));

	const handleActivate = useCallback(
		(addressId: string) => {
			setActiveMutation.mutate(addressId);
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
						{t("sheet.title")}
					</Text>
					<TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
						<X size={22} color={themeColors.textSecondary} strokeWidth={2} />
					</TouchableOpacity>
				</View>

				{isLoading && (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color={Colors.primary} />
						<Text variant="bodySm" className="mt-stack-md text-content-muted">
							{t("sheet.loading")}
						</Text>
					</View>
				)}

				{isError && !isLoading && (
					<View className="flex-1 items-center justify-center">
						<Text variant="buttonLg" className="text-center text-danger">
							{t("sheet.loadErrorTitle")}
						</Text>
						<Text
							variant="bodySm"
							className="mt-stack-xs text-center text-content-muted"
						>
							{t("sheet.loadErrorMessage")}
						</Text>
					</View>
				)}

				{addresses && !isLoading && (
					<View className="flex-1">
						<Text
							variant="bodySm"
							className="mb-stack-xs font-semibold text-content-secondary"
						>
							{t("sheet.saved")}
						</Text>

						<RadioGroup
							value={addresses.find((a) => a.is_active)?.id}
							onValueChange={handleActivate}
							className="flex-1"
						>
							<FlatList
								data={addresses}
								keyExtractor={(item) => item.id}
								showsVerticalScrollIndicator={false}
								ItemSeparatorComponent={AddressSeparator}
								renderItem={({ item }) => (
									<AddressListItem
										address={item}
										isActive={item.is_active}
										onPress={() => handleActivate(item.id)}
										onDelete={
											showDeleteActions &&
											onDeleteAddress &&
											addresses.length > 1
												? () => onDeleteAddress(item.id)
												: undefined
										}
										deleteDisabled={item.is_active}
										deleteLabel={t("sheet.delete")}
									/>
								)}
							/>
						</RadioGroup>

						{showAddAction && onAddNewAddress ? (
							<Button
								variant="secondary"
								onPress={onAddNewAddress}
								fullWidth
								iconLeft={Plus}
								className="mt-stack-md"
								accessibilityLabel={t("sheet.add")}
							>
								{t("sheet.add")}
							</Button>
						) : null}
					</View>
				)}
			</BottomSheet.View>
		</BottomSheet>
	);
});

export default AddressBottomSheet;
