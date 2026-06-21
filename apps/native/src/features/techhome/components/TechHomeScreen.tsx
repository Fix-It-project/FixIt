import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppRefreshControl } from "@/src/components/ui/app-refresh-control";
import { useThemeColors } from "@/src/constants/design-tokens";
import { SECTION_ENTER_DURATION_MS, SECTION_STAGGER_MS } from "../constants";
import {
	useActiveJob,
	useNextTodayJob,
	useTechHomeOrdersQuery,
} from "../hooks/useTechHomeOrdersQuery";
import { useTechHomeStatsQuery } from "../hooks/useTechHomeStatsQuery";
import { ActiveJobCard } from "./ActiveJobCard";
import { EarningsCard } from "./EarningsCard";
import { HeroHeader } from "./HeroHeader";
import { IncomingRequestsSection } from "./IncomingRequestsSection";
import { NextJobCard } from "./NextJobCard";
import { PerformanceGrid } from "./PerformanceGrid";
import { PromoCard } from "./PromoCard";
import { RescheduleTeaserCard } from "./RescheduleTeaserCard";
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
	const { t } = useTranslation("technician");
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const ordersQuery = useTechHomeOrdersQuery();
	const statsQuery = useTechHomeStatsQuery();
	const activeJob = useActiveJob();
	const nextTodayJob = useNextTodayJob();

	// Primary slot: the live job, else the next job to start today, else nothing.
	let primarySlot: React.ReactNode = null;
	if (activeJob) primarySlot = <ActiveJobCard order={activeJob} />;
	else if (nextTodayJob) primarySlot = <NextJobCard order={nextTodayJob} />;

	const initialLoading =
		(ordersQuery.isPending && !ordersQuery.data) ||
		(statsQuery.isPending && !statsQuery.data);
	const refreshing = ordersQuery.isRefetching || statsQuery.isRefetching;
	const onRefresh = () => {
		ordersQuery.refetch();
		statsQuery.refetch();
	};

	return (
		<View testID="technician-home" className="flex-1 bg-surface">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="pb-screen-bottom-inset"
				refreshControl={
					<AppRefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.primary]}
						tintColor={colors.tint.onHero}
						useTopInset
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

						{/* Primary slot: live job → else next job to start today → else collapse */}
						{primarySlot ? <Enter order={1}>{primarySlot}</Enter> : null}

						<Enter order={2}>
							<IncomingRequestsSection />
						</Enter>

						{/* Appears only when a customer sent a reschedule request. */}
						<Enter order={3}>
							<RescheduleTeaserCard />
						</Enter>

						<Enter order={4}>
							<ScheduleTimeline />
						</Enter>

						<Enter order={5}>
							<PerformanceGrid />
						</Enter>

						<Enter order={6}>
							<PromoCard
								badgeLabel={t("home.promo.badge")}
								title={t("home.promo.title")}
								body={t("home.promo.body")}
							/>
						</Enter>
					</>
				)}
			</ScrollView>
		</View>
	);
}
