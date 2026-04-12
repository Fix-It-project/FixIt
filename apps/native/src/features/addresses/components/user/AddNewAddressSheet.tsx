import BottomSheet, {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { Navigation, X } from "lucide-react-native";
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
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { useHardwareBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { Colors, useThemeColors } from "@/src/lib/theme";
import { useLocationStore } from "@/src/stores/location-store";

export interface AddNewAddressSheetRef {
	open: () => void;
	close: () => void;
}

interface AddNewAddressSheetProps {
	onBack?: () => void;
}

const AddNewAddressSheet = forwardRef<
	AddNewAddressSheetRef,
	AddNewAddressSheetProps
>(function AddNewAddressSheet({ onBack }, ref) {
	const themeColors = useThemeColors();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const { requestLocationPermission, isLoading: isLocating } =
		useLocationStore();
	const [sheetIndex, setSheetIndex] = useState(-1);

	const { height } = useWindowDimensions();
	const snapPoints = useMemo(() => [Math.min(height * 0.55, 480)], [height]);

	useImperativeHandle(ref, () => ({
		open() {
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

	const handleBack = useCallback(() => {
		bottomSheetRef.current?.close();
		onBack?.();
	}, [onBack]);

	useHardwareBackHandler(sheetIndex >= 0, () => {
		handleBack();
		return true;
	});

	const handleCaptureLocation = useCallback(async () => {
		await requestLocationPermission();
		const { location } = useLocationStore.getState();
		if (location) {
			bottomSheetRef.current?.close();
			router.push({
				pathname: "/(app)/(profile)/add-address",
				params: {
					latitude: String(location.latitude),
					longitude: String(location.longitude),
				},
			});
		}
	}, [requestLocationPermission]);

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
				width: 40,
			}}
			onChange={setSheetIndex}
		>
			<BottomSheetView className="flex-1 px-6 pb-10">
				<View className="mb-2 flex-row items-center justify-between">
					<Text
						className="font-bold text-[18px] text-content"
						style={{ fontFamily: "GoogleSans_700Bold" }}
					>
						Add New Location
					</Text>
					<TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
						<X size={22} color={themeColors.textSecondary} strokeWidth={2} />
					</TouchableOpacity>
				</View>

				<View
					className="flex-1 items-center justify-center"
					style={{ gap: 20 }}
				>
					<View
						className="h-20 w-20 items-center justify-center rounded-full"
						style={{ backgroundColor: themeColors.primaryLight }}
					>
						<Navigation size={36} color={Colors.primary} strokeWidth={2} />
					</View>

					<Text
						className="text-center text-[18px] text-content"
						style={{ fontFamily: "GoogleSans_700Bold" }}
					>
						Capture Your Location
					</Text>

					<Text
						className="px-4 text-center text-[14px] text-content-secondary"
						style={{ fontFamily: "GoogleSans_400Regular" }}
					>
						Tap the button below to capture your current GPS coordinates, then
						fill in your address details.
					</Text>

					<TouchableOpacity
						onPress={handleCaptureLocation}
						disabled={isLocating}
						activeOpacity={0.7}
						className="w-full flex-row items-center justify-center rounded-xl py-4"
						style={{
							backgroundColor: Colors.primary,
							opacity: isLocating ? 0.6 : 1,
						}}
					>
						{isLocating ? (
							<ActivityIndicator size="small" color={themeColors.surfaceBase} />
						) : (
							<Text
								className="text-[15px] text-white"
								style={{ fontFamily: "GoogleSans_600SemiBold" }}
							>
								Get Current Location
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
});

export default AddNewAddressSheet;
