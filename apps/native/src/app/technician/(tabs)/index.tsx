import { RefreshControl, ScrollView, View } from "react-native";
import { TechActiveOrderBubble } from "@/src/features/booking-orders/components/state-machine/shared";
import IncomingRequestsSection from "@/src/features/dashboard/components/tech/IncomingRequestsSection";
import TodayScheduleSection from "@/src/features/dashboard/components/tech/TodayScheduleSection";
import { useDashboardOrdersQuery } from "@/src/features/dashboard/hooks/useDashboardOrdersQuery";
import DashboardHeader from "@/src/features/tech-self/components/tech/DashboardHeader";
import { useTechSelfProfileQuery } from "@/src/features/tech-self/hooks/useTechSelfProfileQuery";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

const SECTION_GAP = 8;

export default function TechHome() {
	const themeColors = useThemeColors();
	const { isRefetching, refetch } = useDashboardOrdersQuery();
	const { data: profile } = useTechSelfProfileQuery();

	return (
		<View className="flex-1 bg-surface-elevated">
			{/* Sticky header — outside ScrollView */}
			<DashboardHeader />

			{/* Scrollable content */}
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingBottom: spacing.stack.xl,
					gap: SECTION_GAP,
				}}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={refetch}
						colors={[themeColors.primary]}
						tintColor={themeColors.primary}
					/>
				}
			>
				{/* Incoming job requests */}
				<IncomingRequestsSection categoryName={profile?.category_name} />

				{/* Today's schedule timeline */}
				<TodayScheduleSection />
			</ScrollView>
			<TechActiveOrderBubble />
		</View>
	);
}
