import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { MapPin, Phone } from "lucide-react-native";
import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Linking, useWindowDimensions, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { PressableScale } from "@/src/components/ui/PressableScale";
import { getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { radius, space, spacing, useThemeColors } from "@/src/lib/theme";

export interface CustomerInfoSheetHandle {
	open: (args: {
		name: string;
		phone: string | null;
		address: string | null;
		problem: string | null;
	}) => void;
	close: () => void;
}

interface SheetState {
	name: string;
	phone: string | null;
	address: string | null;
	problem: string | null;
}

const CustomerInfoSheet = forwardRef<CustomerInfoSheetHandle, object>(
	function CustomerInfoSheet(_, ref) {
		const themeColors = useThemeColors();
		const sheetRef = useRef<BottomSheetModal>(null);
		const { height } = useWindowDimensions();
		const [state, setState] = useState<SheetState | null>(null);

		useImperativeHandle(
			ref,
			() => ({
				open(args) {
					setState(args);
					sheetRef.current?.present();
				},
				close() {
					sheetRef.current?.dismiss();
				},
			}),
			[],
		);

		const renderBackdrop = useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					disappearsOnIndex={-1}
					appearsOnIndex={0}
					opacity={1}
					pressBehavior="close"
					style={{ backgroundColor: themeColors.backdrop }}
				/>
			),
			[themeColors.backdrop],
		);

		const handleCall = () => {
			if (!state?.phone) return;
			void Linking.openURL(`tel:${state.phone}`);
		};

		const handleMaps = () => {
			if (!state?.address) return;
			const q = encodeURIComponent(state.address);
			void Linking.openURL(`geo:0,0?q=${q}`);
		};

		const initials = getPfpInitialsFallback(state?.name);
		const avatarColor = getAvatarColor(state?.name ?? "");

		return (
			<BottomSheetModal
				ref={sheetRef}
				snapPoints={[Math.min(height * 0.55, 460)]}
				enablePanDownToClose
				backdropComponent={renderBackdrop}
				backgroundStyle={{
					backgroundColor: themeColors.surfaceBase,
					borderTopLeftRadius: 24,
					borderTopRightRadius: 24,
				}}
				handleIndicatorStyle={{
					backgroundColor: themeColors.borderDefault,
					width: 44,
				}}
			>
				<BottomSheetView
					style={{
						padding: space[5],
						gap: space[5],
						backgroundColor: themeColors.surfaceBase,
					}}
				>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: space[3],
						}}
					>
						<View
							style={{
								width: 52,
								height: 52,
								borderRadius: 26,
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: avatarColor,
							}}
						>
							<Text
								className="font-google-sans-bold"
								style={{ color: themeColors.surfaceBase, fontSize: 18 }}
							>
								{initials}
							</Text>
						</View>
						<View style={{ flex: 1, gap: space[1] }}>
							<Text
								className="font-google-sans-bold"
								style={{ color: themeColors.textPrimary, fontSize: 18 }}
								numberOfLines={1}
							>
								{state?.name ?? "Customer"}
							</Text>
							<Text variant="caption" style={{ color: themeColors.textMuted }}>
								Customer details
							</Text>
						</View>
					</View>

					{state?.address ? (
						<View
							style={{
								borderRadius: radius.card,
								backgroundColor: themeColors.surfaceElevated,
								padding: space[4],
								gap: space[1],
							}}
						>
							<Text variant="caption" style={{ color: themeColors.textMuted }}>
								Address
							</Text>
							<Text
								variant="bodySm"
								style={{ color: themeColors.textPrimary }}
							>
								{state.address}
							</Text>
						</View>
					) : null}

					{state?.problem ? (
						<View
							style={{
								borderRadius: radius.card,
								backgroundColor: themeColors.surfaceElevated,
								padding: space[4],
								gap: space[1],
							}}
						>
							<Text variant="caption" style={{ color: themeColors.textMuted }}>
								Problem
							</Text>
							<Text
								variant="bodySm"
								style={{ color: themeColors.textPrimary }}
							>
								{state.problem}
							</Text>
						</View>
					) : null}

					<View
						style={{
							flexDirection: "row",
							gap: space[3],
						}}
					>
						<PressableScale
							onPress={handleCall}
							disabled={!state?.phone}
							accessibilityRole="button"
							accessibilityLabel="Call customer"
							style={{ flex: 1 }}
						>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "center",
									gap: space[2],
									paddingVertical: space[4],
									borderRadius: radius.button,
									backgroundColor: state?.phone
										? themeColors.primary
										: themeColors.borderDefault,
								}}
							>
								<Phone
									size={spacing.icon.sm}
									color={themeColors.onPrimaryHeader}
									strokeWidth={2.4}
								/>
								<Text
									className="font-google-sans-bold"
									style={{ color: themeColors.onPrimaryHeader, fontSize: 15 }}
								>
									Call
								</Text>
							</View>
						</PressableScale>
						<PressableScale
							onPress={handleMaps}
							disabled={!state?.address}
							accessibilityRole="button"
							accessibilityLabel="Open in maps"
							style={{ flex: 1 }}
						>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "center",
									gap: space[2],
									paddingVertical: space[4],
									borderRadius: radius.button,
									backgroundColor: themeColors.surfaceElevated,
								}}
							>
								<MapPin
									size={spacing.icon.sm}
									color={themeColors.textPrimary}
									strokeWidth={2.4}
								/>
								<Text
									className="font-google-sans-bold"
									style={{ color: themeColors.textPrimary, fontSize: 15 }}
								>
									Maps
								</Text>
							</View>
						</PressableScale>
					</View>
				</BottomSheetView>
			</BottomSheetModal>
		);
	},
);

export default CustomerInfoSheet;
