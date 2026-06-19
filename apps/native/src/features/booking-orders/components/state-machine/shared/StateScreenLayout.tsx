import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { type LayoutChangeEvent, ScrollView, View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { space } from "@/src/constants/design-tokens";
import DetailHeader from "@/src/features/booking-orders/components/shared/DetailHeader";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { deriveUiState } from "@/src/features/booking-orders/utils/derive-ui-state";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";
import StageProgressBar from "./StageProgressBar";
import StepBodySlide from "./StepBodySlide";
import StickyBottomCTA from "./StickyBottomCTA";

interface StateScreenLayoutProps {
	readonly order: Order;
	readonly viewer: "user" | "technician";
	readonly children: ReactNode;
	readonly stickyCta?: ReactNode;
	// Suppress the stage pills (e.g. tech incoming-request / accept-reject screen,
	// where no stage is active yet and the bar conveys nothing).
	readonly hidePills?: boolean;
}

// Resolve the visible 1-based step from the UI phase (NOT the lifecycle
// stepIndex): `in_progress` and `awaiting_payment` collide at lifecycle index 6,
// so the Payment pill must come from `ui.phase`. 0 = no segment active yet
// (waiting/accepted and the terminal phases, which don't render this layout).
function visibleStepFor(phase: string, isCard: boolean): number {
	switch (phase) {
		case "tech_on_the_way":
			return 1;
		case "tech_inspecting":
			return 2;
		case "quote_open":
			return 3;
		case "work_in_progress":
			return 4;
		case "payment_pending":
			return isCard ? 5 : 4;
		default:
			return 0;
	}
}

export default function StateScreenLayout({
	order,
	viewer,
	children,
	stickyCta,
	hidePills = false,
}: StateScreenLayoutProps) {
	const { t } = useTranslation("orders");
	const ui = deriveUiState(order, viewer);
	// Card orders carry a distinct Payment step; cash settles in person, so the
	// flow ends at Work.
	const isCard = order.payment_method === "card";
	const pillLabels = isCard
		? ([
				t("detail.pills.onTheWay"),
				t("detail.pills.inspecting"),
				t("detail.pills.quote"),
				t("detail.pills.work"),
				t("detail.pills.payment"),
			] as const)
		: ([
				t("detail.pills.onTheWay"),
				t("detail.pills.inspecting"),
				t("detail.pills.quote"),
				t("detail.pills.work"),
			] as const);
	const visibleStepIndex = visibleStepFor(ui.phase, isCard);
	const [ctaHeight, setCtaHeight] = useState(0);

	const goBack = useSafeBack(
		viewer === "user" ? ROUTES.user.activity : ROUTES.technician.jobs,
	);

	useFocusBackHandler(() => {
		goBack();
		return true;
	});

	const handleCtaLayout = (event: LayoutChangeEvent) => {
		const next = event.nativeEvent.layout.height;
		if (Math.abs(next - ctaHeight) > 0.5) setCtaHeight(next);
	};

	return (
		<View className="flex-1 bg-surface">
			<ScreenSafeAreaView className="flex-1" edges={["top"]}>
				<DetailHeader
					categoryId={order.category_id}
					onBack={goBack}
					title={t("detail.orderTitle")}
				/>
				{hidePills ? null : (
					<StageProgressBar
						stepIndex={visibleStepIndex}
						stepCount={pillLabels.length}
						labels={pillLabels}
					/>
				)}
				<ScrollView
					className="flex-1"
					bounces={false}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={{
						flexGrow: 1,
						paddingHorizontal: space[4],
						paddingTop: space[3],
						paddingBottom: space[6] + (stickyCta ? ctaHeight : 0),
					}}
				>
					<StepBodySlide slideKey={ui.phase}>{children}</StepBodySlide>
				</ScrollView>
			</ScreenSafeAreaView>
			{stickyCta ? (
				<StickyBottomCTA onLayout={handleCtaLayout}>
					{stickyCta}
				</StickyBottomCTA>
			) : null}
		</View>
	);
}
