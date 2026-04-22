import BottomSheet, {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Plus, X } from "lucide-react-native";
import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ActivityIndicator,
	FlatList,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { useSetActiveAddressMutation } from "@/src/features/addresses/hooks/useSetActiveAddressMutation";
import { useHardwareBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { Colors, spacing, useThemeColors } from "@/src/lib/theme";
import AddressListItem from "./AddressListItem";

export interface AddressBottomSheetRef {
	open: () => void;
	close: () => void;
}

interface AddressBottomSheetProps {
	onAddNewAddress: () => void;
}

function AddressSeparator() {
	return (
		<View
			style={{
				height: 1,
				backgroundColor: Colors.surfaceElevated,
			}}
		/>
	);
}

const AddressBottomSheet = forwardRef<
	AddressBottomSheetRef,
	AddressBottomSheetProps
>(function AddressBottomSheet({ onAddNewAddress }, ref) {
	const themeColors = useThemeColors();
	const bottomSheetRef = useRef<BottomSheet>(null);

	const { data: addresses, isLoading, isError } = useAddressesQuery();
	const setActiveMutation = useSetActiveAddressMutation();

	const [optimisticActiveId, setOptimisticActiveId] = useState<string | null>(
		null,
	);
	const [sheetIndex, setSheetIndex] = useState(-1);

	const { height } = useWindowDimensions();
	const snapPoints = useMemo(() => [Math.min(height * 0.65, 560)], [height]);

	useHardwareBackHandler(sheetIndex >= 0, () => {
		bottomSheetRef.current?.close();
		return true;
	});

	useImperativeHandle(ref, () => ({
		open() {
			setOptimisticActiveId(null);
			bottomSheetRef.current?.snapToIndex(0);
		},
		close() {
			bottomSheetRef.current?.close();
		},
	}));

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				opacity={0.5}
				pressBehavior="close"
			/>
		),
		[],
	);

	const handleActivate = useCallback(
		(addressId: string) => {
			setOptimisticActiveId(addressId);
			setActiveMutation.mutate(addressId, {
				onSettled: () => setOptimisticActiveId(null),
			});
		},
		[setActiveMutation],
	);

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close();
	}, []);

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
			enablePanDownToClose
			backdropComponent={renderBackdrop}
			backgroundStyle={{
				backgroundColor: themeColors.surfaceBase,
				borderTopLeftRadius: 24,
				borderTopRightRadius: 24,
			}}
			handleIndicatorStyle={{
				backgroundColor: themeColors.borderDefault,
				width: spacing.sheet.handleWidth,
			}}
			onChange={setSheetIndex}
		>
			<BottomSheetView className="flex-1 px-6 pb-6">
				<View className="mb-2 flex-row items-center justify-between">
					<Text variant="bodyLg" className="font-bold text-content">
						Choose delivery location
					</Text>
					<TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
						<X size={22} color={themeColors.textSecondary} strokeWidth={2} />
					</TouchableOpacity>
				</View>

				{isLoading && (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color={Colors.primary} />
						<Text variant="bodySm" className="mt-3 text-content-muted">
							Loading addresses…
						</Text>
					</View>
				)}

				{isError && !isLoading && (
					<View className="flex-1 items-center justify-center">
						<Text variant="buttonLg" className="text-center text-danger">
							Unable to load addresses
						</Text>
						<Text
							variant="bodySm"
							className="mt-1 text-center text-content-muted"
						>
							Please try again later.
						</Text>
					</View>
				)}

				{addresses && !isLoading && (
					<View className="flex-1">
						<Text
							variant="bodySm"
							className="mb-1 font-semibold text-content-secondary"
						>
							Saved addresses
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
								/>
							)}
						/>

						<TouchableOpacity
							onPress={onAddNewAddress}
							activeOpacity={0.7}
							className="mt-3 flex-row items-center justify-center rounded-button py-control-cta-y"
							style={{ backgroundColor: themeColors.primaryLight }}
						>
							<Plus size={18} color={Colors.primary} strokeWidth={2.5} />
							<Text variant="buttonMd" className="ml-2 text-app-primary">
								Add New Location
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</BottomSheetView>
		</BottomSheet>
	);
});

export default AddressBottomSheet;
