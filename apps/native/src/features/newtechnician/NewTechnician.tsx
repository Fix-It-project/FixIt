import { router, useLocalSearchParams } from "expo-router";
import type { TFunction } from "i18next";
import {
	CalendarCheck,
	CalendarDays,
	type LucideIcon,
	MapPin,
	Navigation,
	Star,
} from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type LayoutChangeEvent, View } from "react-native";
import PagerView, {
	type PagerViewOnPageScrollEvent,
	type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import Animated, {
	runOnJS,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { SegmentedTabBar } from "@/src/components/navigation/SegmentedTabBar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { formatRating } from "@/src/constants/format";
import { translateServiceName } from "@/src/features/categories/constants/categories";
import TechnicianAvatar from "@/src/features/technicians/components/user/TechnicianAvatar";
import { useTechnicianProfileQuery } from "@/src/features/technicians/hooks/useTechnicianProfileQuery";
import type { TechnicianService } from "@/src/features/technicians/schemas/response.schema";
import { formatLocation } from "@/src/features/technicians/utils/technician-utils";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";
import { AboutTab } from "./components/AboutTab";
import { ReviewsTab } from "./components/ReviewsTab";
import { ServicesTab } from "./components/ServicesTab";

const TABS = ["Details", "Services", "Reviews"] as const;
type TabKey = (typeof TABS)[number];

interface ProfileMetricProps {
	readonly icon: LucideIcon;
	readonly value: number | string;
	readonly label: string;
}

function ProfileMetric({ icon: Icon, value, label }: ProfileMetricProps) {
	const themeColors = useThemeColors();
	return (
		<View className="min-w-0 flex-1 items-center gap-stack-xs">
			<View className="flex-row items-center gap-stack-xs">
				<Icon
					size={spacing.icon.sm}
					color={themeColors.primary}
					strokeWidth={2.2}
				/>
				<Text
					variant="bodySm"
					className="font-semibold text-content"
					numberOfLines={1}
				>
					{value}
				</Text>
			</View>
			<Text variant="caption" className="text-center text-content-muted">
				{label}
			</Text>
		</View>
	);
}

function DetailSkeleton() {
	return (
		<View className="items-center px-card pt-card">
			<Skeleton className="h-avatar-hero w-avatar-hero rounded-pill" />
			<Skeleton className="mt-stack-md h-5 w-40 rounded-input" />
			<Skeleton className="mt-stack-sm h-4 w-28 rounded-input" />
			<View className="mt-card-roomy w-full flex-row gap-stack-md">
				<Skeleton className="h-20 flex-1 rounded-input" />
				<Skeleton className="h-20 flex-1 rounded-input" />
			</View>
		</View>
	);
}

function resolveTechnicianName(
	technicianName: string | undefined,
	profileName: string | undefined,
	t: TFunction<"technicians">,
): string {
	if (typeof technicianName === "string" && technicianName) {
		return technicianName;
	}
	return profileName ?? t("detail.technicianFallback");
}

function resolveTechnicianInitials(
	initials: string | undefined,
	name: string,
): string {
	if (typeof initials === "string" && initials) return initials;
	return getPfpInitialsFallback(name);
}

function formatDistanceLabel(
	distanceKm: string | undefined,
	t: TFunction<"technicians">,
): string {
	const parsed = Number(distanceKm);
	return Number.isFinite(parsed)
		? `${parsed.toFixed(1)} km`
		: t("detail.notAvailable");
}

function formatTechnicianRating(
	avgRating: number | null,
	reviewCount: number,
	t: TFunction<"technicians">,
): string {
	return avgRating !== null && reviewCount > 0
		? formatRating(avgRating)
		: t("detail.ratingNew");
}

function addVisitedTab(prev: Set<TabKey>, next: TabKey): Set<TabKey> {
	if (prev.has(next)) return prev;
	const updated = new Set(prev);
	updated.add(next);
	return updated;
}

export default function NewTechnician() {
	const { t } = useTranslation("technicians");
	const { t: tc } = useTranslation("categories");
	const themeColors = useThemeColors();
	const params = useLocalSearchParams<{
		id: string;
		technicianName?: string;
		initials?: string;
		categoryId?: string;
		categoryName?: string;
		distanceKm?: string;
		preselectServiceId?: string;
		tab?: string;
	}>();
	const technicianId = params.id;

	const { data: profile, isLoading } = useTechnicianProfileQuery(technicianId);

	// Default to Services; a `tab` param can still deep-link to any tab.
	const initialTab: TabKey =
		params.tab === "Details" ||
		params.tab === "Services" ||
		params.tab === "Reviews"
			? params.tab
			: "Services";
	const initialIndex = TABS.indexOf(initialTab);

	const [tab, setTab] = useState<TabKey>(initialTab);
	const [visited, setVisited] = useState<Set<TabKey>>(
		() => new Set<TabKey>([initialTab]),
	);
	const [selectedService, setSelectedService] =
		useState<TechnicianService | null>(null);
	const [reviewEndSignal, setReviewEndSignal] = useState(0);
	const [profileHeight, setProfileHeight] = useState(0);
	const [tabBarHeight, setTabBarHeight] = useState(0);

	const pagerRef = useRef<PagerView>(null);
	// Fractional pager position → drives the sliding underline (finger-follow).
	const position = useSharedValue(initialIndex);
	// Only the active page feeds the shared collapse offset.
	const activeIndex = useSharedValue(initialIndex);
	// Vertical offset of the active page → collapses the profile header.
	const scrollY = useSharedValue(0);
	// Measured profile-card height = how far the header can collapse.
	const profileHeightSV = useSharedValue(0);
	// Per-tab remembered offset so the header settles correctly after a swipe.
	const offsetDetails = useSharedValue(0);
	const offsetServices = useSharedValue(0);
	const offsetReviews = useSharedValue(0);
	// Latch so review pagination fires once per arrival at the list end.
	const reviewEndLatch = useSharedValue(false);

	const measured = profileHeight > 0 && tabBarHeight > 0;
	const headerTotal = profileHeight + tabBarHeight;

	const tabDefs = useMemo(
		() =>
			TABS.map((key) => ({
				key,
				label: t(`detail.tabs.${key}` as Parameters<typeof t>[0]),
			})),
		[t],
	);

	const bumpReviewSignal = useCallback(() => {
		setReviewEndSignal((signal) => signal + 1);
	}, []);

	const onProfileLayout = useCallback(
		(event: LayoutChangeEvent) => {
			const next = event.nativeEvent.layout.height;
			profileHeightSV.value = next;
			setProfileHeight(next);
		},
		[profileHeightSV],
	);

	const onTabsLayout = useCallback((event: LayoutChangeEvent) => {
		setTabBarHeight(event.nativeEvent.layout.height);
	}, []);

	const onTabPress = useCallback((_key: TabKey, index: number) => {
		pagerRef.current?.setPage(index);
	}, []);

	const onPageScroll = useCallback(
		(event: PagerViewOnPageScrollEvent) => {
			position.value = event.nativeEvent.position + event.nativeEvent.offset;
		},
		[position],
	);

	const onPageSelected = useCallback(
		(event: PagerViewOnPageSelectedEvent) => {
			const index = event.nativeEvent.position;
			setTab(TABS[index]);
			setVisited((prev) => addVisitedTab(prev, TABS[index]));
			activeIndex.value = index;
			scrollY.value = [offsetDetails, offsetServices, offsetReviews][
				index
			].value;
		},
		[activeIndex, scrollY, offsetDetails, offsetServices, offsetReviews],
	);

	const detailsScroll = useAnimatedScrollHandler({
		onScroll: (event) => {
			if (activeIndex.value !== 0) return;
			const y = event.contentOffset.y;
			scrollY.value = y;
			offsetDetails.value = y;
		},
	});
	const servicesScroll = useAnimatedScrollHandler({
		onScroll: (event) => {
			if (activeIndex.value !== 1) return;
			const y = event.contentOffset.y;
			scrollY.value = y;
			offsetServices.value = y;
		},
	});
	const reviewsScroll = useAnimatedScrollHandler({
		onScroll: (event) => {
			if (activeIndex.value !== 2) return;
			const y = event.contentOffset.y;
			scrollY.value = y;
			offsetReviews.value = y;
			const distanceFromEnd =
				event.contentSize.height - (y + event.layoutMeasurement.height);
			if (distanceFromEnd <= 96) {
				if (!reviewEndLatch.value) {
					reviewEndLatch.value = true;
					runOnJS(bumpReviewSignal)();
				}
			} else if (reviewEndLatch.value) {
				reviewEndLatch.value = false;
			}
		},
	});

	const profileAnim = useAnimatedStyle(() => ({
		transform: [{ translateY: -Math.min(scrollY.value, profileHeightSV.value) }],
	}));
	const tabsAnim = useAnimatedStyle(() => ({
		transform: [
			{
				translateY:
					profileHeightSV.value -
					Math.min(scrollY.value, profileHeightSV.value),
			},
		],
	}));

	const resolvedName = useMemo(
		() => resolveTechnicianName(params.technicianName, profile?.name, t),
		[params.technicianName, profile?.name, t],
	);

	const resolvedInitials = useMemo(
		() => resolveTechnicianInitials(params.initials, resolvedName),
		[params.initials, resolvedName],
	);

	const cachedDistanceLabel = useMemo(
		() => formatDistanceLabel(params.distanceKm, t),
		[params.distanceKm, t],
	);

	const goBack = useSafeBack(ROUTES.user.home);

	const handleSelectDate = useDebounce(() => {
		if (!selectedService) return;
		const route = ROUTES.user.bookingRoot(technicianId);
		const serviceName = translateServiceName(
			tc,
			selectedService.id,
			selectedService.name,
		);
		router.push({
			...route,
			params: {
				...route.params,
				serviceId: selectedService.id,
				serviceName,
				technicianName: resolvedName,
				categoryId: params.categoryId,
				categoryName: params.categoryName,
			},
		});
	}, 600);

	const pageContentStyle = {
		paddingTop: headerTotal,
		paddingHorizontal: spacing.stack.lg,
		paddingBottom: spacing.stack.xl,
	};

	return (
		<ScreenSafeAreaView className="flex-1 bg-app-primary" edges={["top"]}>
			<ScreenStatusBar variant="blue" />
			<View className="flex-1 bg-surface">
				<PageHeader
					title={t("detail.title")}
					variant="app-primary"
					onBackPress={goBack}
				/>

				{isLoading || !profile ? (
					<DetailSkeleton />
				) : (
					<>
						<View className="flex-1 overflow-hidden bg-surface">
							{/* Swipeable tab content; each page scrolls and collapses
							    the profile header independently. */}
							<PagerView
								ref={pagerRef}
								style={{ flex: 1, opacity: measured ? 1 : 0 }}
								initialPage={initialIndex}
								onPageScroll={onPageScroll}
								onPageSelected={onPageSelected}
							>
								<View key="Details" style={{ flex: 1 }}>
									<Animated.ScrollView
										onScroll={detailsScroll}
										scrollEventThrottle={16}
										showsVerticalScrollIndicator={false}
										contentContainerStyle={pageContentStyle}
									>
										{visited.has("Details") ? (
											<AboutTab technicianId={technicianId} />
										) : null}
									</Animated.ScrollView>
								</View>

								<View key="Services" style={{ flex: 1 }}>
									<Animated.ScrollView
										onScroll={servicesScroll}
										scrollEventThrottle={16}
										showsVerticalScrollIndicator={false}
										contentContainerStyle={pageContentStyle}
									>
										{visited.has("Services") ? (
											<ServicesTab
												technicianId={technicianId}
												selectedServiceId={selectedService?.id ?? null}
												onSelect={setSelectedService}
												preselectServiceId={params.preselectServiceId}
											/>
										) : null}
									</Animated.ScrollView>
								</View>

								<View key="Reviews" style={{ flex: 1 }}>
									<Animated.ScrollView
										onScroll={reviewsScroll}
										scrollEventThrottle={16}
										showsVerticalScrollIndicator={false}
										contentContainerStyle={pageContentStyle}
									>
										{visited.has("Reviews") ? (
											<ReviewsTab
												technicianId={technicianId}
												endReachedSignal={reviewEndSignal}
											/>
										) : null}
									</Animated.ScrollView>
								</View>
							</PagerView>

							{/* Collapsing profile header — slides up as content scrolls.
							    pointerEvents none so swipes/scrolls reach the pager. */}
							<Animated.View
								pointerEvents="none"
								onLayout={onProfileLayout}
								style={[
									{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 2 },
									profileAnim,
								]}
							>
								<View
									style={{
										paddingHorizontal: spacing.stack.lg,
										paddingTop: spacing.stack.lg,
										paddingBottom: spacing.stack.lg,
									}}
								>
									<View className="rounded-card bg-card p-card">
										<View className="flex-row items-start gap-stack-md">
											<TechnicianAvatar
												id={technicianId}
												initials={resolvedInitials}
												imageUrl={profile.profilePicture}
												size="lg"
											/>
											<View className="min-w-0 flex-1">
												<View className="flex-row items-start justify-between gap-stack-sm">
													<Text
														variant="buttonLg"
														className="min-w-0 flex-1 font-google-sans-bold text-content"
														numberOfLines={1}
													>
														{resolvedName}
													</Text>
													<View className="flex-row items-center gap-stack-xs pt-px">
														<Star
															size={spacing.icon.caption}
															color={themeColors.ratingDefault}
															fill={themeColors.ratingDefault}
															strokeWidth={0}
														/>
														<Text
															variant="caption"
															className="font-semibold text-content"
															numberOfLines={1}
														>
															{formatTechnicianRating(
																profile.avg_rating,
																profile.review_count,
																t,
															)}
														</Text>
													</View>
												</View>
												<Text
													variant="caption"
													className="mt-stack-xs text-content-secondary"
													numberOfLines={3}
												>
													{profile.description}
												</Text>
												<Badge
													variant="secondary"
													className="mt-stack-sm self-start rounded-input border-transparent bg-order-bg"
												>
													<MapPin
														size={spacing.icon.caption}
														color={themeColors.orderText}
														strokeWidth={2.1}
													/>
													<Text
														variant="caption"
														className="font-medium text-order-text"
														numberOfLines={1}
													>
														{formatLocation(null, profile.city, profile.street)}
													</Text>
												</Badge>
											</View>
										</View>

										<View className="my-stack-md h-px bg-edge/20" />

										<View className="flex-row items-start gap-stack-md">
											<ProfileMetric
												icon={CalendarCheck}
												value={profile.completedOrders}
												label={t("detail.metrics.completed")}
											/>
											<ProfileMetric
												icon={Navigation}
												value={cachedDistanceLabel}
												label={t("detail.metrics.distance")}
											/>
											<ProfileMetric
												icon={CalendarDays}
												value={profile.totalBookings}
												label={t("detail.metrics.bookings")}
											/>
										</View>
									</View>
								</View>
							</Animated.View>

							{/* Pinned tab bar — full-bleed underline; sticks once the
							    profile has scrolled past. */}
							<Animated.View
								onLayout={onTabsLayout}
								style={[
									{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 3 },
									tabsAnim,
								]}
							>
								<View style={{ backgroundColor: themeColors.surfaceBase }}>
									<SegmentedTabBar
										tabs={tabDefs}
										active={tab}
										onChange={onTabPress}
										position={position}
									/>
								</View>
							</Animated.View>
						</View>

						{/* ── Sticky CTA ── */}
						<View className="bg-surface px-card pt-stack-sm pb-stack-lg">
							<Button
								disabled={!selectedService}
								onPress={handleSelectDate}
								className="w-full"
								testID="select-date"
							>
								<Text variant="buttonLg" className="text-surface-on-primary">
									{selectedService
										? t("detail.selectDate")
										: t("detail.pickService")}
								</Text>
							</Button>
						</View>
					</>
				)}
			</View>
		</ScreenSafeAreaView>
	);
}
