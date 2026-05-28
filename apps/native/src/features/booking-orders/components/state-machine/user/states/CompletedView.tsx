import { router } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import InlineReviewForm, {
	type InlineReviewFormHandle,
} from "@/src/components/reviews/InlineReviewForm";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Text } from "@/src/components/ui/text";
import {
	OrderInfoCompact,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import {
	DUR_STAGGER,
	STAGGER_GAP,
} from "@/src/constants/animation";
import { formatAmount } from "@/src/features/booking-orders/utils/format-currency";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";
import { radius, space, spacing, useThemeColors } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

export default function CompletedView({ order }: Props) {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const formRef = useRef<InlineReviewFormHandle>(null);

	const fadeIn = (i: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(i * STAGGER_GAP).duration(DUR_STAGGER);

	const amount = order.final_price ?? order.estimated_price ?? 0;
	const alreadyReviewed = order.has_review;

	const goToOrders = useCallback(() => {
		router.replace(ROUTES.user.orders);
	}, []);

	const handleDone = useCallback(async () => {
		if (alreadyReviewed || !formRef.current) {
			goToOrders();
			return;
		}
		await formRef.current.submit();
		goToOrders();
	}, [alreadyReviewed, goToOrders]);

	return (
		<View style={{ flex: 1, gap: space[5] }}>
			<StageHero
				icon={CheckCircle2}
				eyebrow="Done"
				title="All wrapped up."
				subtitle="Thanks for using FixIt."
				accentColor={themeColors.success}
			/>

			<Animated.View entering={fadeIn(0)}>
				<View
					style={{
						borderRadius: radius.card,
						padding: space[4],
						backgroundColor: `${themeColors.success}14`,
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<View style={{ gap: space[1] }}>
						<Text variant="caption" style={{ color: themeColors.textMuted }}>
							Final price
						</Text>
						<Text
							variant="h2"
							className="font-google-sans-bold"
							style={{ color: themeColors.success }}
						>
							{formatAmount(amount)}
							<Text
								variant="bodySm"
								className="font-google-sans-bold"
								style={{ color: themeColors.success }}
							>
								{" "}
								EGP
							</Text>
						</Text>
					</View>
					<CheckCircle2
						size={spacing.icon.lg}
						color={themeColors.success}
						strokeWidth={2.2}
					/>
				</View>
			</Animated.View>

			<OrderInfoCompact
				order={order}
				viewer="user"
				onIdentityPress={() =>
					profileSheetRef.current?.open(
						order.technician_id,
						getPfpInitialsFallback(order.technician_name),
					)
				}
				footer={
					!alreadyReviewed ? (
						<Animated.View entering={fadeIn(1)}>
							<InlineReviewForm
								ref={formRef}
								orderId={order.id}
								technicianId={order.technician_id}
								technicianName={order.technician_name ?? undefined}
							/>
						</Animated.View>
					) : null
				}
			/>

			<PressableScale
				onPress={handleDone}
				accessibilityRole="button"
				accessibilityLabel="Done"
				style={{ marginTop: "auto" }}
			>
				<View
					className="w-full items-center rounded-button px-button-x py-control-cta-y"
					style={{ backgroundColor: themeColors.primary }}
				>
					<Text
						variant="buttonLg"
						className="font-google-sans-bold"
						style={{ color: themeColors.onPrimaryHeader }}
					>
						Done
					</Text>
				</View>
			</PressableScale>

			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}
