// Full-bleed live-tracking screen used by the "on the way" / tracking stage for
// both roles. The map is the whole screen; a single persistent sheet floats
// over it with the only details that matter. This deliberately bypasses
// StateScreenLayout (header + pills + party card + scroll) — the tracking
// moment wants a map, not a form.
//
// The sheet is a non-dismissable @gorhom/bottom-sheet with two snaps: a peek
// that shows the `peek` slot (identity + distance + primary action), and an
// expanded snap that reveals the `expanded` slot (secondary actions). The peek
// snap height is measured from the peek slot so the fold always lands cleanly
// between the two — never clipping the primary button or leaking the secondary
// one. The page itself never scrolls.

import { ChevronLeft } from "lucide-react-native";
import { type ReactNode, useMemo, useState } from "react";
import { type LayoutChangeEvent, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import BottomSheet from "@/src/components/ui/bottom-sheet";
import {
	elevation,
	shadowStyle,
	space,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import LiveTrackingMap, {
	type LatLng,
} from "@/src/features/booking-orders/components/shared/LiveTrackingMap";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";

interface Props {
	readonly viewer: "user" | "technician";
	/** The other party's live/target coordinate. */
	readonly target: LatLng | null;
	readonly selfLabel: string;
	readonly targetLabel: string;
	readonly waitingLabel: string;
	/** Always-visible slot: identity + distance + primary action. */
	readonly peek: ReactNode;
	/** Revealed-on-expand slot: secondary actions, banners, modals. */
	readonly expanded: ReactNode;
	/** Floating element over the map, beside the back button (destination card / pills). */
	readonly topSlot?: ReactNode;
	/** Back-button accessibility label. */
	readonly backLabel: string;
}

const BACK_SIZE = 40;
// Grab-handle vertical footprint + the sheet's own top padding, added on top of
// the measured peek-slot height to size the collapsed snap.
const HANDLE_ALLOWANCE = 28;
const PEEK_FALLBACK = 200;

export default function OrderTrackingScreen({
	viewer,
	target,
	selfLabel,
	targetLabel,
	waitingLabel,
	peek,
	expanded,
	topSlot,
	backLabel,
}: Props) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const [peekSlotHeight, setPeekSlotHeight] = useState(PEEK_FALLBACK);

	const goBack = useSafeBack(
		viewer === "user" ? ROUTES.user.activity : ROUTES.technician.jobs,
	);
	useFocusBackHandler(() => {
		goBack();
		return true;
	});

	const handlePeekLayout = (e: LayoutChangeEvent) => {
		const next = e.nativeEvent.layout.height;
		if (Math.abs(next - peekSlotHeight) > 1) setPeekSlotHeight(next);
	};

	// Collapsed snap = handle + top padding + the peek slot + a little breathing
	// room, so the fold sits in the gap before the expanded slot. The camera fits
	// both markers above this height.
	const peekHeight = HANDLE_ALLOWANCE + space[2] + peekSlotHeight + space[3];
	const snapPoints = useMemo<(string | number)[]>(
		() => [Math.round(peekHeight), "62%"],
		[peekHeight],
	);

	return (
		<View className="flex-1 bg-surface">
			<ScreenStatusBar variant="surface" />

			<LiveTrackingMap
				screen
				target={target}
				selfLabel={selfLabel}
				targetLabel={targetLabel}
				waitingLabel={waitingLabel}
				bottomFitInset={Math.round(peekHeight)}
			/>

			<View
				style={{
					position: "absolute",
					top: insets.top + space[2],
					left: space[4],
					right: space[4],
					flexDirection: "row",
					alignItems: "flex-start",
					gap: space[3],
				}}
				pointerEvents="box-none"
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={backLabel}
					onPress={goBack}
					style={[
						{
							width: BACK_SIZE,
							height: BACK_SIZE,
							borderRadius: BACK_SIZE / 2,
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: colors.surfaceBase,
						},
						shadowStyle(elevation.raised, { shadowColor: colors.shadow }),
					]}
				>
					<ChevronLeft
						size={spacing.icon.sm}
						color={colors.textPrimary}
						strokeWidth={2.4}
					/>
				</Pressable>
				{topSlot ? <View style={{ flex: 1 }}>{topSlot}</View> : null}
			</View>

			<BottomSheet
				index={0}
				snapPoints={snapPoints}
				enablePanDownToClose={false}
				backdropComponent={() => null}
			>
				<BottomSheet.View
					style={{
						paddingHorizontal: space[4],
						paddingTop: space[2],
						paddingBottom: insets.bottom + space[4],
					}}
				>
					<View onLayout={handlePeekLayout} style={{ gap: space[4] }}>
						{peek}
					</View>
					<View style={{ gap: space[3], marginTop: space[4] }}>{expanded}</View>
				</BottomSheet.View>
			</BottomSheet>
		</View>
	);
}
