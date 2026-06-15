import { router } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import InlineReviewForm, {
	type InlineReviewFormHandle,
} from "@/src/components/reviews/InlineReviewForm";
import { Text } from "@/src/components/ui/text";
import { DUR_STAGGER, STAGGER_GAP } from "@/src/constants/animation";
import {
	radius,
	space,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import {
	OrderInfoCompact,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { formatAmount } from "@/src/features/booking-orders/utils/format-currency";
import { ReportProblemEntry } from "@/src/features/reports/components/ReportProblemEntry";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";

interface Props {
	readonly order: Order;
}

export default function CompletedView({ order }: Props) {
	const { t } = useTranslation("orders");
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
				eyebrow={t("detail.stage.completed.eyebrow")}
				title={t("detail.stage.completed.title")}
				subtitle={t("detail.stage.completed.subtitle")}
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
							{t("detail.completed.finalPrice")}
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
								{t("detail.completed.currency")}
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

			<ReportProblemEntry
				orderId={order.id}
				viewer="user"
				counterpartyName={order.technician_name}
				hasOpenReport={order.has_open_report}
			/>

			<PressableScale
				onPress={handleDone}
				accessibilityRole="button"
				accessibilityLabel={t("detail.a11y.done")}
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
						{t("detail.cta.done")}
					</Text>
				</View>
			</PressableScale>

			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}
