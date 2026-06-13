import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useAvailabilityMutation } from "../hooks/useAvailabilityMutation";

const TRACK_WIDTH = 40;
const KNOB_SIZE = 16;
const KNOB_MARGIN = 3;

/**
 * Compact availability toggle for the hero — status dot + label + spring switch.
 * Replaces the old full-width AvailabilityCard. Lives on the tinted hero, so
 * text uses the on-hero color.
 */
export function OnlineSwitch({ online }: { online: boolean }) {
	const colors = useThemeColors();
	const { mutate, isPending } = useAvailabilityMutation();
	const offset = useSharedValue(online ? 1 : 0);

	useEffect(() => {
		offset.value = withSpring(online ? 1 : 0, { damping: 16, stiffness: 220 });
	}, [online, offset]);

	const knobStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX:
					KNOB_MARGIN +
					offset.value * (TRACK_WIDTH - KNOB_SIZE - KNOB_MARGIN * 2),
			},
		],
	}));

	return (
		<Pressable
			accessibilityRole="switch"
			accessibilityState={{ checked: online, disabled: isPending }}
			accessibilityLabel={online ? "Go offline" : "Go online"}
			onPress={() => mutate(!online)}
			disabled={isPending}
			hitSlop={8}
			className="flex-row items-center gap-stack-xs rounded-xl bg-overlay-white px-2.5 py-1.5"
		>
			<View
				className="h-2 w-2 rounded-full"
				style={{
					backgroundColor: online ? colors.statusOnline : colors.disabledText,
				}}
			/>
			<Text variant="caption" className="text-tint-on-hero">
				{online ? "Online" : "Offline"}
			</Text>
			<View
				style={{
					width: TRACK_WIDTH,
					height: KNOB_SIZE + KNOB_MARGIN * 2,
					borderRadius: 999,
					justifyContent: "center",
					backgroundColor: online ? colors.statusOnline : colors.overlayMd,
				}}
			>
				<Animated.View
					style={[
						{
							width: KNOB_SIZE,
							height: KNOB_SIZE,
							borderRadius: KNOB_SIZE / 2,
							backgroundColor: colors.surfaceOnPrimary,
						},
						knobStyle,
					]}
				/>
			</View>
		</Pressable>
	);
}
