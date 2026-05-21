import { router, useLocalSearchParams } from "expo-router";
import { ArrowRight, Check, Home } from "lucide-react-native";
import { useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Text } from "@/src/components/ui/text";
import { OrderInfoCompact } from "@/src/features/booking-orders/components/state-machine/shared";
import { useUserOrderById } from "@/src/features/booking-orders/hooks/useUserOrders";
import {
	DUR_REVEAL,
	DUR_STAGGER,
	EASE_OUT_EXPO,
	SPRING_SOFT,
	STAGGER_GAP,
} from "@/src/lib/animation/constants";
import { PressableScale } from "@/src/components/ui/PressableScale";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { ROUTES } from "@/src/lib/routes";
import { Colors, space, useThemeColors } from "@/src/lib/theme";

const CHECK_SIZE = 64;
const CHECK_HALO_SIZE = 112;

export default function PlacedOrderScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const order = useUserOrderById(id ?? "");
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);

	const scale = useSharedValue(reducedMotion ? 1 : 0.7);
	const opacity = useSharedValue(reducedMotion ? 1 : 0);
	const haloScale = useSharedValue(reducedMotion ? 1 : 0.5);

	useEffect(() => {
		if (reducedMotion) return;
		scale.value = withSpring(1, SPRING_SOFT);
		opacity.value = withTiming(1, {
			duration: DUR_REVEAL,
			easing: EASE_OUT_EXPO,
		});
		haloScale.value = withSequence(
			withTiming(1.1, { duration: 360, easing: EASE_OUT_EXPO }),
			withSpring(1, SPRING_SOFT),
		);
	}, [reducedMotion, opacity, scale, haloScale]);

	const checkStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: scale.value }],
	}));
	const haloStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: haloScale.value }],
	}));

	const goHome = useCallback(() => {
		router.dismissAll();
		router.replace(ROUTES.user.home);
	}, []);

	const goToOrderDetail = useCallback(() => {
		if (!id) {
			goHome();
			return;
		}
		router.replace(ROUTES.user.orderDetail(id));
	}, [goHome, id]);

	useFocusBackHandler(() => {
		goHome();
		return true;
	});

	const enterDelay = (i: number) => (reducedMotion ? 0 : i * STAGGER_GAP);

	return (
		<ScreenSafeAreaView edges={["top"]} className="flex-1 bg-surface">
			<View
				className="flex-1"
				style={{
					paddingHorizontal: space[4],
					paddingTop: space[6],
					paddingBottom: space[6],
					gap: space[5],
				}}
			>
				<View style={{ alignItems: "center", gap: space[3] }}>
					<View style={{ width: CHECK_HALO_SIZE, height: CHECK_HALO_SIZE }}>
						<Animated.View
							style={[
								haloStyle,
								{
									position: "absolute",
									inset: 0,
									borderRadius: CHECK_HALO_SIZE / 2,
									backgroundColor: `${themeColors.success}1A`,
								},
							]}
						/>
						<Animated.View
							style={[
								checkStyle,
								{
									position: "absolute",
									top: (CHECK_HALO_SIZE - CHECK_SIZE) / 2,
									left: (CHECK_HALO_SIZE - CHECK_SIZE) / 2,
									width: CHECK_SIZE,
									height: CHECK_SIZE,
									borderRadius: CHECK_SIZE / 2,
									backgroundColor: themeColors.success,
									alignItems: "center",
									justifyContent: "center",
								},
							]}
						>
							<Check
								size={CHECK_SIZE * 0.55}
								color={themeColors.onPrimaryHeader}
								strokeWidth={3}
							/>
						</Animated.View>
					</View>

					<Animated.View
						entering={
							reducedMotion
								? undefined
								: FadeInDown.delay(enterDelay(1)).duration(DUR_STAGGER)
						}
						style={{ alignItems: "center", gap: space[1] }}
					>
						<Text
							className="font-google-sans-bold text-content"
							style={{ fontSize: 24, lineHeight: 28, textAlign: "center" }}
						>
							Request sent.
						</Text>
						<Text
							variant="bodySm"
							className="text-center text-content-secondary"
						>
							We pinged the technician. You'll get a ping when they accept.
						</Text>
					</Animated.View>
				</View>

				{order ? (
					<Animated.View
						entering={
							reducedMotion
								? undefined
								: FadeInDown.delay(enterDelay(2)).duration(DUR_STAGGER)
						}
					>
						<OrderInfoCompact
							order={order}
							viewer="user"
							onIdentityPress={() =>
								profileSheetRef.current?.open(
									order.technician_id,
									getPfpInitialsFallback(order.technician_name),
								)
							}
						/>
					</Animated.View>
				) : null}

				<Animated.View
					entering={
						reducedMotion
							? undefined
							: FadeInDown.delay(enterDelay(3)).duration(DUR_STAGGER)
					}
					style={{ marginTop: "auto", gap: space[2] }}
				>
					<PressableScale
						onPress={goToOrderDetail}
						accessibilityRole="button"
						accessibilityLabel="View order details"
					>
						<View className="w-full flex-row items-center justify-between gap-stack-sm rounded-button bg-app-primary px-button-x py-control-cta-y">
							<View style={{ width: space[5] }} />
							<Text
								variant="buttonLg"
								className="font-google-sans-bold text-surface-on-primary"
							>
								View order details
							</Text>
							<ArrowRight
								size={20}
								color={Colors.surfaceBase}
								strokeWidth={2.4}
							/>
						</View>
					</PressableScale>

					<PressableScale
						onPress={goHome}
						accessibilityRole="button"
						accessibilityLabel="Back to home"
					>
						<View className="w-full flex-row items-center justify-center gap-stack-sm rounded-button bg-surface-elevated px-button-x py-control-cta-y">
							<Home
								size={18}
								color={themeColors.textPrimary}
								strokeWidth={2.4}
							/>
							<Text
								variant="buttonLg"
								className="font-google-sans-bold text-content"
							>
								Back to home
							</Text>
						</View>
					</PressableScale>
				</Animated.View>
			</View>
			<TechnicianProfileSheet ref={profileSheetRef} />
		</ScreenSafeAreaView>
	);
}
