import { MapPin, Phone } from "lucide-react-native";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Linking, useWindowDimensions, View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import {
	BottomSheet,
	type BottomSheetModalRef,
} from "@/src/components/ui/bottom-sheet";
import { Text } from "@/src/components/ui/text";
import {
	radius,
	space,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import { getAvatarColor } from "@/src/lib/avatar";
import { getPfpInitialsFallback } from "@/src/lib/initials";

/**
 * Shared customer-actions bottom sheet (View in maps + Call). Lives in
 * `components/identity` so BOTH `booking-orders` and `techhome` can use it
 * without a cross-feature import. Avatar colour comes from `lib/avatar` (the
 * canonical shared helper), never from a feature.
 *
 * "View in maps" prefers the customer's coordinates (`latitude`/`longitude`)
 * and falls back to the address string when coords are absent.
 */
export interface CustomerActionsSheetHandle {
	open: (args: {
		name: string;
		phone: string | null;
		address: string | null;
		latitude?: number | null;
		longitude?: number | null;
		problem: string | null;
	}) => void;
	close: () => void;
}

interface SheetState {
	name: string;
	phone: string | null;
	address: string | null;
	latitude: number | null;
	longitude: number | null;
	problem: string | null;
}

const CustomerActionsSheet = forwardRef<CustomerActionsSheetHandle, object>(
	function CustomerActionsSheet(_, ref) {
		const themeColors = useThemeColors();
		const sheetRef = useRef<BottomSheetModalRef>(null);
		const { height } = useWindowDimensions();
		const [state, setState] = useState<SheetState | null>(null);

		useImperativeHandle(
			ref,
			() => ({
				open(args) {
					setState({
						name: args.name,
						phone: args.phone,
						address: args.address,
						latitude: args.latitude ?? null,
						longitude: args.longitude ?? null,
						problem: args.problem,
					});
					sheetRef.current?.present();
				},
				close() {
					sheetRef.current?.dismiss();
				},
			}),
			[],
		);

		const handleCall = () => {
			if (!state?.phone) return;
			void Linking.openURL(`tel:${state.phone}`);
		};

		const hasCoords = state?.latitude != null && state?.longitude != null;
		const canOpenMaps = hasCoords || Boolean(state?.address);

		const handleMaps = () => {
			if (!state) return;
			// Prefer exact coordinates — opens Google Maps to the pin, not a street guess.
			if (state.latitude != null && state.longitude != null) {
				void Linking.openURL(
					`https://www.google.com/maps/search/?api=1&query=${state.latitude},${state.longitude}`,
				);
				return;
			}
			if (state.address) {
				void Linking.openURL(`geo:0,0?q=${encodeURIComponent(state.address)}`);
			}
		};

		const initials = getPfpInitialsFallback(state?.name);
		const avatarColor = getAvatarColor(state?.name ?? "");

		return (
			<BottomSheet.Modal
				ref={sheetRef}
				snapPoints={[Math.min(height * 0.55, 460)]}
				handleIndicatorStyle={{
					backgroundColor: themeColors.borderDefault,
					width: 44,
				}}
			>
				<BottomSheet.View
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
								variant="bodyLg"
								className="font-google-sans-bold"
								style={{ color: themeColors.surfaceOnPrimary }}
							>
								{initials}
							</Text>
						</View>
						<View style={{ flex: 1, gap: space[1] }}>
							<Text
								variant="bodyLg"
								className="font-google-sans-bold"
								style={{ color: themeColors.textPrimary }}
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
							<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
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
							<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
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
									variant="body"
									className="font-google-sans-bold"
									style={{ color: themeColors.onPrimaryHeader }}
								>
									Call
								</Text>
							</View>
						</PressableScale>
						<PressableScale
							onPress={handleMaps}
							disabled={!canOpenMaps}
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
									variant="body"
									className="font-google-sans-bold"
									style={{ color: themeColors.textPrimary }}
								>
									Maps
								</Text>
							</View>
						</PressableScale>
					</View>
				</BottomSheet.View>
			</BottomSheet.Modal>
		);
	},
);

export default CustomerActionsSheet;
