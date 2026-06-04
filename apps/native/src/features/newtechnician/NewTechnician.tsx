import { router, useLocalSearchParams } from "expo-router";
import { Briefcase, ClipboardList, Star } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import BackButton from "@/src/components/ui/back-button";
import { Button } from "@/src/components/ui/button";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@/src/components/ui/segmented-control";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import {
	Colors,
	elevation,
	shadowStyle,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import { formatRating } from "@/src/constants/format";
import TechnicianAvatar from "@/src/features/technicians/components/user/TechnicianAvatar";
import { useTechnicianProfileQuery } from "@/src/features/technicians/hooks/useTechnicianProfileQuery";
import type { TechnicianService } from "@/src/features/technicians/schemas/response.schema";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";
import { AboutTab } from "./components/AboutTab";
import { ReviewsTab } from "./components/ReviewsTab";
import { ServicesTab } from "./components/ServicesTab";

const TABS = ["About", "Services", "Reviews"] as const;
type TabKey = (typeof TABS)[number];

interface StatChipProps {
	readonly icon: typeof Briefcase;
	readonly value: number;
	readonly label: string;
}

function StatChip({ icon: Icon, value, label }: StatChipProps) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-1 items-center gap-stack-xs rounded-input bg-surface-elevated px-stack-md py-card">
			<Icon size={18} color={themeColors.primary} strokeWidth={2} />
			<Text variant="buttonLg" className="font-bold text-content">
				{value}
			</Text>
			<Text variant="caption" className="text-content-muted">
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
	const themeColors = useThemeColors();
	const params = useLocalSearchParams<{
		id: string;
		technicianName?: string;
		initials?: string;
		categoryId?: string;
		categoryName?: string;
		preselectServiceId?: string;
		tab?: string;
	}>();
	const technicianId = params.id;

	const { data: profile, isLoading } = useTechnicianProfileQuery(technicianId);

	const initialTab: TabKey =
		params.tab === "Services" || params.tab === "Reviews"
			? params.tab
			: "About";
	const [tab, setTab] = useState<TabKey>(initialTab);
	const [visited, setVisited] = useState<Set<TabKey>>(
		() => new Set<TabKey>([initialTab]),
	);
	const [selectedService, setSelectedService] =
		useState<TechnicianService | null>(null);

	const selectTab = useCallback((next: TabKey) => {
		setTab(next);
		setVisited((prev) => {
			if (prev.has(next)) return prev;
			const updated = new Set(prev);
			updated.add(next);
			return updated;
		});
	}, []);

	const resolvedName = useMemo(() => {
		if (typeof params.technicianName === "string" && params.technicianName) {
			return params.technicianName;
		}
		return profile?.name ?? "Technician";
	}, [params.technicianName, profile?.name]);

	const resolvedInitials = useMemo(() => {
		if (typeof params.initials === "string" && params.initials) {
			return params.initials;
		}
		return getPfpInitialsFallback(resolvedName);
	}, [params.initials, resolvedName]);

	const goBack = useSafeBack(ROUTES.user.home);

	const handleSelectDate = useDebounce(() => {
		if (!selectedService) return;
		const route = ROUTES.user.bookingRoot(technicianId);
		router.push({
			...route,
			params: {
				...route.params,
				serviceId: selectedService.id,
				serviceName: selectedService.name,
				technicianName: resolvedName,
				categoryId: params.categoryId,
				categoryName: params.categoryName,
			},
		});
	}, 600);

	return (
		<ScreenSafeAreaView
			className="flex-1"
			edges={["top"]}
			style={{ backgroundColor: Colors.primary }}
		>
			<View className="flex-1 bg-surface">
				{/* ── Header band ── */}
				<View style={{ backgroundColor: Colors.primary }} className="pb-card">
					<View className="flex-row items-center px-card pt-stack-sm pb-stack-sm">
						<BackButton
							variant="header-inverse"
							className="mr-stack-md"
							onPress={goBack}
						/>
						<Text
							variant="h3"
							style={{ color: themeColors.onPrimaryHeader }}
							numberOfLines={1}
							className="flex-1"
						>
							Technician
						</Text>
					</View>
				</View>

				{isLoading || !profile ? (
					<DetailSkeleton />
				) : (
					<>
						{/* ── Profile card (overlaps the header band) ── */}
						<View
							className="mx-card items-center rounded-card border border-edge bg-card p-card"
							style={{ marginTop: -spacing.stack.lg }}
						>
							<TechnicianAvatar
								id={technicianId}
								initials={resolvedInitials}
								size="lg"
							/>
							<Text
								variant="h3"
								className="mt-stack-md text-center text-content"
								numberOfLines={1}
							>
								{resolvedName}
							</Text>

							<View className="mt-stack-xs flex-row items-center gap-stack-xs">
								<Star
									size={14}
									color={themeColors.ratingDefault}
									fill={themeColors.ratingDefault}
									strokeWidth={0}
								/>
								<Text variant="bodySm" className="text-content-secondary">
									{profile.avg_rating !== null && profile.review_count > 0
										? `${formatRating(profile.avg_rating)} · ${profile.review_count} ${
												profile.review_count === 1 ? "review" : "reviews"
											}`
										: "No reviews yet"}
								</Text>
							</View>

							<View className="mt-card w-full flex-row gap-stack-md">
								<StatChip
									icon={Briefcase}
									value={profile.completedOrders}
									label="Completed"
								/>
								<StatChip
									icon={ClipboardList}
									value={profile.totalBookings}
									label="Bookings"
								/>
							</View>
						</View>

						{/* ── Tabs ── */}
						<View className="mt-card">
							<SegmentedControl className="mx-card bg-surface-elevated">
								{TABS.map((tabKey) => {
									const isActive = tab === tabKey;
									return (
										<SegmentedControlItem
											key={tabKey}
											onPress={() => selectTab(tabKey)}
											className={isActive ? "bg-card" : ""}
											style={
												isActive
													? shadowStyle(elevation.flat, {
															shadowColor: themeColors.textPrimary,
															opacity: 0.08,
														})
													: undefined
											}
										>
											<Text
												variant="buttonMd"
												className={
													isActive
														? "font-bold text-content"
														: "text-content-muted"
												}
											>
												{tabKey}
											</Text>
										</SegmentedControlItem>
									);
								})}
							</SegmentedControl>
						</View>

						{/* ── Tab content (lazy-mounted, kept alive) ── */}
						<ScrollView
							className="flex-1"
							contentContainerStyle={{
								paddingHorizontal: 16,
								paddingBottom: 24,
							}}
							showsVerticalScrollIndicator={false}
						>
							{visited.has("About") ? (
								<View style={{ display: tab === "About" ? "flex" : "none" }}>
									<AboutTab technicianId={technicianId} profile={profile} />
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
									<ReviewsTab technicianId={technicianId} />
								</View>
							) : null}
						</ScrollView>

						{/* ── Sticky CTA ── */}
						<View className="border-edge border-t bg-card px-card pt-stack-md pb-stack-lg">
							{selectedService ? (
								<Text
									variant="caption"
									className="mb-stack-xs text-content-muted"
									numberOfLines={1}
								>
									Selected: {selectedService.name}
								</Text>
							) : null}
							<Button
								disabled={!selectedService}
								onPress={handleSelectDate}
								className="w-full"
							>
								<Text variant="buttonLg" className="text-surface-on-primary">
									{selectedService
										? "Select Date"
										: "Pick a service to continue"}
								</Text>
							</Button>
						</View>
					</>
				)}
			</View>
		</ScreenSafeAreaView>
	);
}
