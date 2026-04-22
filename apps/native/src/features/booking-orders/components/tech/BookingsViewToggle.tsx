import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@/src/components/ui/segmented-control";
import { Text } from "@/src/components/ui/text";
import { elevation, shadowStyle } from "@/src/lib/design-tokens";
import { useThemeColors } from "@/src/lib/theme";

/** Schedule / Bookings pill toggle — Bookings tab is always active for now. */
export default function BookingsViewToggle() {
	const themeColors = useThemeColors();
	return (
		<Animated.View
			entering={FadeInDown.delay(80).duration(400)}
			className="mb-4"
		>
			<SegmentedControl
				tone="overlay"
				style={{ backgroundColor: themeColors.overlaySm }}
			>
				{/* Schedule (no-op) */}
				<SegmentedControlItem>
					<Text variant="buttonMd" style={{ color: themeColors.overlaySub }}>
						Schedule
					</Text>
				</SegmentedControlItem>

				{/* Bookings (active) */}
				<SegmentedControlItem
					disabled
					style={{
						backgroundColor: themeColors.surfaceBase,
						...shadowStyle(elevation.raised, {
							shadowColor: themeColors.shadow,
							opacity: 0.1,
						}),
					}}
				>
					<Text variant="buttonMd" style={{ color: themeColors.primary }}>
						Bookings
					</Text>
				</SegmentedControlItem>
			</SegmentedControl>
		</Animated.View>
	);
}
