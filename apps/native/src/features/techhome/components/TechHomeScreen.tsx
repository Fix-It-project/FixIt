import { RefreshControl, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	PROMO_PLACEHOLDER,
	SECTION_ENTER_DURATION_MS,
	SECTION_STAGGER_MS,
} from "../constants";
import {
	useActiveJob,
	useTechHomeOrdersQuery,
} from "../hooks/useTechHomeOrdersQuery";
import { useTechHomeStatsQuery } from "../hooks/useTechHomeStatsQuery";
import { ActiveJobCard } from "./ActiveJobCard";
import { EarningsCard } from "./EarningsCard";
import { HeroHeader } from "./HeroHeader";
import { IncomingRequestsSection } from "./IncomingRequestsSection";
import { PerformanceGrid } from "./PerformanceGrid";
import { PromoCard } from "./PromoCard";
import { ScheduleTimeline } from "./ScheduleTimeline";
import { TechHomeSkeleton } from "./skeletons";

/** How far the earnings card overlaps into the hero gradient. */
const EARNINGS_OVERLAP = 72;

function Enter({
	order,
	children,
}: {
	order: number;
	children: React.ReactNode;
}) {
	return (
		<Animated.View
			entering={FadeInDown.duration(SECTION_ENTER_DURATION_MS).delay(
				order * SECTION_STAGGER_MS,
			)}
		>
			{children}
		</Animated.View>
	);
}

export function TechHomeScreen() {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const ordersQuery = useTechHomeOrdersQuery();
	const statsQuery = useTechHomeStatsQuery();
	const activeJob = useActiveJob();

	const initialLoading =
		(ordersQuery.isPending && !ordersQuery.data) ||
		(statsQuery.isPending && !statsQuery.data);
	const refreshing = ordersQuery.isRefetching || statsQuery.isRefetching;
	const onRefresh = () => {
		void ordersQuery.refetch();
		void statsQuery.refetch();
	};

	return (
		<View testID="technician-home" className="flex-1 bg-surface">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="pb-screen-bottom-inset"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.primary]}
						tintColor={colors.tint.onHero}
						progressViewOffset={insets.top}
					/>
				}
			>
				<HeroHeader
					topInset={insets.top}
					overlapPadding={EARNINGS_OVERLAP + 24}
				/>

				{initialLoading ? (
					<TechHomeSkeleton />
				) : (
					<>
						{/* earnings hero overlapping the gradient */}
						<Enter order={0}>
							<View
								className="px-screen-x"
								style={{ marginTop: -EARNINGS_OVERLAP }}
							>
								<EarningsCard />
							</View>
						</Enter>

						{activeJob ? (
							<Enter order={1}>
								<ActiveJobCard order={activeJob} />
							</Enter>
						) : null}

						<Enter order={2}>
							<IncomingRequestsSection />
						</Enter>

						<Enter order={3}>
							<ScheduleTimeline />
						</Enter>

						<Enter order={4}>
							<PerformanceGrid />
						</Enter>

						<Enter order={5}>
							<PromoCard {...PROMO_PLACEHOLDER} />
						</Enter>
					</>
				)}
			</ScrollView>
		</View>
	);
}
