import { type ReactNode, useState } from "react";
import { type LayoutChangeEvent, ScrollView, View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import DetailHeader from "@/src/features/booking-orders/components/shared/DetailHeader";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { deriveUiState } from "@/src/features/booking-orders/utils/derive-ui-state";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/navigation";
import { space } from "@/src/constants/design-tokens";
import StageProgressBar from "./StageProgressBar";
import StepBodySlide from "./StepBodySlide";
import StickyBottomCTA from "./StickyBottomCTA";

const IN_PROGRESS_PILL_COUNT = 4;
const PILL_LABELS = ["On the way", "Inspecting", "Quote", "Finalize"] as const;

interface StateScreenLayoutProps {
	readonly order: Order;
	readonly viewer: "user" | "technician";
	readonly children: ReactNode;
	readonly stickyCta?: ReactNode;
}

function toVisibleStepIndex(lifecycleStepIndex: number): number {
	if (lifecycleStepIndex < 3) return 0;
	if (lifecycleStepIndex > 6) return 4;
	return lifecycleStepIndex - 2;
}

export default function StateScreenLayout({
	order,
	viewer,
	children,
	stickyCta,
}: StateScreenLayoutProps) {
	const ui = deriveUiState(order, viewer);
	const visibleStepIndex = toVisibleStepIndex(ui.stepIndex);
	const [ctaHeight, setCtaHeight] = useState(0);

	const goBack = useSafeBack(
		viewer === "user" ? ROUTES.user.orders : ROUTES.technician.bookings,
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
					title="Order"
				/>
				<StageProgressBar
					stepIndex={visibleStepIndex}
					stepCount={IN_PROGRESS_PILL_COUNT}
					labels={PILL_LABELS}
				/>
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
