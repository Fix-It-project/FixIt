import { Wrench } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withRepeat,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useAvailabilityMutation } from "../hooks/useAvailabilityMutation";
import {
	useActiveJob,
	usePendingRequests,
} from "../hooks/useTechHomeOrdersQuery";

const TRACK_WIDTH = 52;
const KNOB_SIZE = 26;
const KNOB_MARGIN = 3;

/** Spring-animated switch; colors come from the live theme. */
function ToggleSwitch({
	value,
	onToggle,
	disabled,
}: {
	value: boolean;
	onToggle: () => void;
	disabled: boolean;
}) {
	const colors = useThemeColors();
	const offset = useSharedValue(value ? 1 : 0);

	useEffect(() => {
		offset.value = withSpring(value ? 1 : 0, { damping: 16, stiffness: 220 });
	}, [value, offset]);

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
			accessibilityState={{ checked: value, disabled }}
			accessibilityLabel={value ? "Go offline" : "Go online"}
			onPress={onToggle}
			disabled={disabled}
			hitSlop={8}
			style={{
				width: TRACK_WIDTH,
				height: KNOB_SIZE + KNOB_MARGIN * 2,
				borderRadius: 999,
				justifyContent: "center",
				backgroundColor: value ? colors.statusOnline : colors.overlayMd,
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
		</Pressable>
	);
}

/** Soft expanding ring behind the wrench while online. */
function PulseRing() {
	const colors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const pulse = useSharedValue(0);

	useEffect(() => {
		if (reducedMotion) return;
		pulse.value = withRepeat(
			withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
			-1,
		);
	}, [pulse, reducedMotion]);

	const style = useAnimatedStyle(() => ({
		opacity: 0.4 * (1 - pulse.value),
		transform: [{ scale: 1 + pulse.value * 0.45 }],
	}));

	if (reducedMotion) return null;
	return (
		<Animated.View
			pointerEvents="none"
			className="absolute inset-0 rounded-2xl"
			style={[{ borderWidth: 2, borderColor: colors.statusOnline }, style]}
		/>
	);
}

export function AvailabilityCard({ online }: { online: boolean }) {
	const colors = useThemeColors();
	const { mutate, isPending } = useAvailabilityMutation();
	const activeJob = useActiveJob();
	const { data: pending } = usePendingRequests();

	let subtitle = "Switch on to receive new requests";
	if (online) {
		if (activeJob) subtitle = "Accepting jobs · 1 job in progress";
		else if (pending.length > 0)
			subtitle = `Accepting jobs · ${pending.length} waiting for review`;
		else subtitle = "Accepting new job requests";
	}

	return (
		<View
			className={`flex-row items-center gap-stack-md rounded-card border p-4 ${
				online
					? "border-status-online bg-status-available"
					: "border-overlay-md bg-overlay-sm"
			}`}
		>
			<View
				className={`h-12 w-12 items-center justify-center rounded-2xl ${
					online ? "bg-status-available" : "bg-overlay-md"
				}`}
			>
				<Icon
					as={Wrench}
					size={20}
					color={online ? colors.statusOnline : colors.tint.onHero}
				/>
				{online ? <PulseRing /> : null}
			</View>

			<View className="flex-1">
				<View className="flex-row items-center gap-stack-xs">
					<Text
						variant="body"
						className={`font-bold ${online ? "text-success" : "text-tint-on-hero"}`}
						numberOfLines={1}
					>
						{online ? "You're available" : "You're offline"}
					</Text>
					{online ? (
						<View className="rounded bg-status-online px-1.5 py-0.5">
							<Text
								variant="caption"
								className="font-bold text-surface-on-primary"
							>
								LIVE
							</Text>
						</View>
					) : null}
				</View>
				<Text
					variant="caption"
					className={`opacity-80 ${online ? "text-success" : "text-tint-on-hero"}`}
					numberOfLines={1}
				>
					{subtitle}
				</Text>
			</View>

			<ToggleSwitch
				value={online}
				disabled={isPending}
				onToggle={() => mutate(!online)}
			/>
		</View>
	);
}
