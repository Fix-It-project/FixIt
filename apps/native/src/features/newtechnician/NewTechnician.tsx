import { router, useLocalSearchParams } from "expo-router";
import {
	CalendarCheck,
	CalendarDays,
	type LucideIcon,
	MapPin,
	Navigation,
	Star,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type LayoutChangeEvent,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Pressable,
	Animated as RNAnimated,
	ScrollView,
	View,
} from "react-native";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
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
const TAB_BAR_HEIGHT = 52;
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

	const initialTab: TabKey =
		params.tab === "Services" || params.tab === "Reviews"
			? params.tab
			: "Details";
	const [tab, setTab] = useState<TabKey>(initialTab);
	const [visited, setVisited] = useState<Set<TabKey>>(
		() => new Set<TabKey>([initialTab]),
	);
	const [selectedService, setSelectedService] =
		useState<TechnicianService | null>(null);
	const [reviewEndSignal, setReviewEndSignal] = useState(0);
	const [tabBarWidth, setTabBarWidth] = useState(0);
	const tabPosition = useRef(new RNAnimated.Value(TABS.indexOf(initialTab)));

	const selectTab = useCallback((next: TabKey) => {
		setTab(next);
		setVisited((prev) => {
			if (prev.has(next)) return prev;
			const updated = new Set(prev);
			updated.add(next);
			return updated;
		});
	}, []);

	useEffect(() => {
		RNAnimated.timing(tabPosition.current, {
			toValue: TABS.indexOf(tab),
			duration: 180,
			useNativeDriver: true,
		}).start();
	}, [tab]);

	const handleTabBarLayout = useCallback((event: LayoutChangeEvent) => {
		setTabBarWidth(event.nativeEvent.layout.width);
	}, []);

	const resolvedName = useMemo(() => {
		if (typeof params.technicianName === "string" && params.technicianName) {
			return params.technicianName;
		}
		return profile?.name ?? t("detail.technicianFallback");
	}, [params.technicianName, profile?.name, t]);

	const resolvedInitials = useMemo(() => {
		if (typeof params.initials === "string" && params.initials) {
			return params.initials;
		}
		return getPfpInitialsFallback(resolvedName);
	}, [params.initials, resolvedName]);

	const cachedDistanceLabel = useMemo(() => {
		const parsed = Number(params.distanceKm);
		return Number.isFinite(parsed)
			? `${parsed.toFixed(1)} km`
			: t("detail.notAvailable");
	}, [params.distanceKm, t]);

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

	const handleContentScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			if (tab !== "Reviews") return;
			const { contentOffset, contentSize, layoutMeasurement } =
				event.nativeEvent;
			const distanceFromEnd =
				contentSize.height - (contentOffset.y + layoutMeasurement.height);
			if (distanceFromEnd <= 96) {
				setReviewEndSignal((signal) => signal + 1);
			}
		},
		[tab],
	);

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
						<ScrollView
							className="flex-1"
							contentContainerStyle={{
								paddingHorizontal: 16,
								paddingTop: spacing.stack.lg,
								paddingBottom: spacing.stack.lg,
							}}
							onScroll={handleContentScroll}
							scrollEventThrottle={120}
							showsVerticalScrollIndicator={false}
						>
							{/* ── Profile card ── */}
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
													{profile.avg_rating !== null &&
													profile.review_count > 0
														? formatRating(profile.avg_rating)
														: t("detail.ratingNew")}
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
											className="mt-stack-sm self-start rounded-input border-transparent bg-app-primary-light"
										>
											<MapPin
												size={spacing.icon.caption}
												color={themeColors.primary}
												strokeWidth={2.1}
											/>
											<Text
												variant="caption"
												className="font-medium text-app-primary"
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

							{/* ── Tabs ── */}
							<View className="mt-card">
								<View
									className="relative flex-row rounded-card bg-card px-stack-xs"
									onLayout={handleTabBarLayout}
									style={{ height: TAB_BAR_HEIGHT }}
								>
									{tabBarWidth > 0 ? (
										<RNAnimated.View
											className="absolute bottom-0 h-0.5 rounded-pill bg-app-primary"
											style={{
												left: spacing.stack.xs + spacing.stack.md,
												width:
													tabBarWidth / TABS.length -
													(spacing.stack.xs + spacing.stack.md) * 2,
												transform: [
													{
														translateX: tabPosition.current.interpolate({
															inputRange: [0, 1, 2],
															outputRange: [
																0,
																tabBarWidth / TABS.length,
																(tabBarWidth / TABS.length) * 2,
															],
														}),
													},
												],
											}}
										/>
									) : null}
									{TABS.map((tabKey) => {
										const isActive = tab === tabKey;
										return (
											<Pressable
												key={tabKey}
												onPress={() => selectTab(tabKey)}
												className="relative flex-1 items-center justify-center"
												style={{ height: TAB_BAR_HEIGHT }}
											>
												<Text
													variant="buttonMd"
													className={
														isActive
															? "font-bold text-content"
															: "text-content-muted"
													}
												>
													{t(
														`detail.tabs.${tabKey}` as Parameters<typeof t>[0],
													)}
												</Text>
											</Pressable>
										);
									})}
								</View>
							</View>

							{/* ── Tab content (lazy-mounted, kept alive) ── */}
							{visited.has("Details") ? (
								<View style={{ display: tab === "Details" ? "flex" : "none" }}>
									<AboutTab technicianId={technicianId} />
								</View>
							) : null}

							{visited.has("Services") ? (
								<View style={{ display: tab === "Services" ? "flex" : "none" }}>
									<ServicesTab
										technicianId={technicianId}
										selectedServiceId={selectedService?.id ?? null}
										onSelect={setSelectedService}
										preselectServiceId={params.preselectServiceId}
									/>
								</View>
							) : null}

							{visited.has("Reviews") ? (
								<View style={{ display: tab === "Reviews" ? "flex" : "none" }}>
									<ReviewsTab
										technicianId={technicianId}
										endReachedSignal={reviewEndSignal}
									/>
								</View>
							) : null}
						</ScrollView>

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
