import { router } from "expo-router";
import { MapPin, Navigation, X } from "lucide-react-native";
import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, useWindowDimensions, View } from "react-native";
import {
	BottomSheet,
	type BottomSheetRef,
} from "@/src/components/ui/bottom-sheet";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useHardwareBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { ROUTES } from "@/src/lib/navigation";
import { useLocationStore } from "@/src/stores/location-store";

export interface AddNewAddressSheetRef {
	open: () => void;
	close: () => void;
}

interface AddNewAddressSheetProps {
	onBack?: () => void;
	onOpenChange?: (isOpen: boolean) => void;
}

const AddNewAddressSheet = forwardRef<
	AddNewAddressSheetRef,
	AddNewAddressSheetProps
>(function AddNewAddressSheet({ onBack, onOpenChange }, ref) {
	const { t } = useTranslation("addresses");
	const themeColors = useThemeColors();
	const bottomSheetRef = useRef<BottomSheetRef>(null);
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

	const handleBack = useCallback(() => {
		bottomSheetRef.current?.close();
		onBack?.();
	}, [onBack]);

	const handleSheetChange = useCallback(
		(index: number) => {
			setSheetIndex(index);
			onOpenChange?.(index >= 0);
		},
		[onOpenChange],
	);

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
				pathname: ROUTES.user.profileAddressNew,
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
			handleIndicatorStyle={{
				backgroundColor: themeColors.borderDefault,
				width: spacing.sheet.handleWidth,
			}}
			onChange={handleSheetChange}
		>
			<BottomSheet.View className="flex-1 px-button-x pb-screen-bottom-inset">
				<View className="mb-stack-sm flex-row items-center justify-between">
					<Text variant="bodyLg" className="font-bold text-content">
						{t("addSheet.title")}
					</Text>
					<TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
						<X size={22} color={themeColors.textSecondary} strokeWidth={2} />
					</TouchableOpacity>
				</View>

				<View className="flex-1 items-center justify-center gap-card-roomy">
					<View
						className="h-avatar-hero w-avatar-hero items-center justify-center rounded-pill"
						style={{ backgroundColor: themeColors.primaryLight }}
					>
						<Navigation size={36} color={Colors.primary} strokeWidth={2} />
					</View>

					<Text variant="bodyLg" className="text-center font-bold text-content">
						{t("addSheet.heading")}
					</Text>

					<Text
						variant="bodySm"
						className="px-card text-center text-content-secondary"
					>
						{t("addSheet.description")}
					</Text>

					<Button
						variant="primary"
						fullWidth
						iconLeft={MapPin}
						onPress={handleCaptureLocation}
						disabled={isLocating}
						loading={isLocating}
						accessibilityLabel={t("addSheet.useCurrentLocation")}
					>
						{t("addSheet.useCurrentLocation")}
					</Button>
				</View>
			</BottomSheet.View>
		</BottomSheet>
	);
});

export default AddNewAddressSheet;
