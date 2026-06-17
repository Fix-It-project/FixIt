import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	FlatList,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	View,
} from "react-native";
import Toast from "react-native-toast-message";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { getInspectionFeePreview } from "@/src/features/booking-orders/api/orders";
import { orderQueryKeys } from "@/src/features/booking-orders/schemas/query-keys";
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";
import { getCategorySlug } from "@/src/features/categories/constants/categories";
import type { TechniciansSortParam } from "@/src/features/technicians/api/technicians";
import {
	TECHNICIAN_LIST_CACHE_MS,
	TECHNICIAN_LIST_GC_MS,
	useTechniciansInfiniteQuery,
} from "@/src/features/technicians/hooks/useTechniciansQuery";
import { technicianQueryKeys } from "@/src/features/technicians/query-keys";
import { getRecommendedTechnicians } from "@/src/features/technicians/recommendations.service";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";
import { useTechnicianSearchStore } from "@/src/features/technicians/stores/technician-search-store";
import type { SortKey } from "@/src/features/technicians/types/sort";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";
import { useLocationStore } from "@/src/stores/location-store";
import { SortBar } from "./components/SortBar";
import { TechnicianCard } from "./components/TechnicianCard";
import { TechnicianListSkeleton } from "./components/TechnicianCardSkeleton";

function getStringParam(value: string | string[] | undefined): string {
	if (Array.isArray(value)) return value[0] ?? "";
	return value ?? "";
}

function toServerSort(sort: SortKey): TechniciansSortParam | undefined {
	if (sort === "Top Rated") return "top_rated";
	if (sort === "Most Reviews") return "most_reviews";
	if (sort === "Nearest") return "nearest";
	return undefined;
}

function isCacheOlderThanOneMinute(dataUpdatedAt: number | undefined): boolean {
	return (
		!!dataUpdatedAt && Date.now() - dataUpdatedAt >= TECHNICIAN_LIST_CACHE_MS
	);
}

function recommendedRankQueryKey({
	categoryId,
	problemDescription,
	coords,
}: {
	readonly categoryId: string;
	readonly problemDescription: string;
	readonly coords?: { latitude: number; longitude: number } | null;
}) {
	return [
		"recommended-technician-rank",
		categoryId || null,
		problemDescription,
		coords?.latitude ?? null,
		coords?.longitude ?? null,
	] as const;
}

function EmptyState({
	isError,
	hasSearch,
	onRetry,
}: {
	readonly isError: boolean;
	readonly hasSearch: boolean;
	readonly onRetry: () => void;
}) {
	const { t } = useTranslation("technicians");
	return (
		<View className="flex-1 items-center justify-center px-screen-x">
			<Text
				variant="buttonLg"
				className="text-center font-semibold text-content"
			>
				{isError ? t("list.empty.errorTitle") : t("list.empty.emptyTitle")}
			</Text>
			<Text
				variant="bodySm"
				className="mt-stack-xs max-w-sm text-center text-content-muted"
			>
				{isError
					? t("list.empty.errorBody")
					: hasSearch
						? t("list.empty.searchBody")
						: t("list.empty.categoryBody")}
			</Text>
			{isError ? (
				<Button
					variant="secondary"
					size="sm"
					className="mt-stack-md"
					onPress={onRetry}
				>
					{t("list.empty.retry")}
				</Button>
			) : null}
		</View>
	);
}

export default function NewTechnicians() {
	const { t } = useTranslation(["technicians", "categories"]);
	const themeColors = useThemeColors();
	const queryClient = useQueryClient();
	const params = useLocalSearchParams<{
		categoryId?: string | string[];
		categoryName?: string | string[];
	}>();
	const categoryId = getStringParam(params.categoryId);
	const categoryName =
		getStringParam(params.categoryName) || t("list.defaultTitle");
	const categorySlug = getCategorySlug(categoryId);
	const headerTitle = categorySlug
		? t(`categories:labels.${categorySlug}` as Parameters<typeof t>[0])
		: categoryName;

	const { searchText, setSearchText, activeSort, setActiveSort } =
		useTechnicianSearchStore();
	const debouncedSearch = useDebouncedValue(searchText, 350);
	const isSearchSettling = searchText.trim() !== debouncedSearch.trim();
	const { location, permissionStatus, requestLocationPermission } =
		useLocationStore();
	const { data: addresses } = useAddressesQuery();
	const activePricingAddress = useMemo(() => {
		return (
			addresses?.find(
				(address) =>
					address.is_active &&
					address.latitude != null &&
					address.longitude != null,
			) ??
			addresses?.find(
				(address) => address.latitude != null && address.longitude != null,
			) ??
			null
		);
	}, [addresses]);
	const activeAddressCoords = useMemo(() => {
		if (!activePricingAddress) return null;
		return {
			latitude: activePricingAddress.latitude as number,
			longitude: activePricingAddress.longitude as number,
		};
	}, [activePricingAddress]);
	const coords = activeAddressCoords ?? location;
	const lastCategoryRef = useRef<string | null>(null);

	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);

	useEffect(() => {
		if (!categoryId || lastCategoryRef.current === categoryId) return;
		lastCategoryRef.current = categoryId;
		setSearchText("");
	}, [categoryId, setSearchText]);

	const serverSort = toServerSort(activeSort);

	const {
		data,
		isLoading,
		isFetching,
		isFetchingNextPage,
		isError,
		refetch,
		fetchNextPage,
		hasNextPage,
	} = useTechniciansInfiniteQuery({
		categoryId,
		searchQuery: debouncedSearch,
		coords,
		sort: serverSort,
		pageSize: 20,
	});
	const technicians = useMemo(() => data?.pages.flat() ?? [], [data]);

	const goBack = useSafeBack(ROUTES.user.categories);

	const problemDescription = categoryName || "General home service needed";
	const activeRecommendedRankQueryKey = recommendedRankQueryKey({
		categoryId,
		problemDescription,
		coords,
	});

	const { data: recommendedRank = null, isLoading: isLoadingRecommended } =
		useQuery({
			queryKey: activeRecommendedRankQueryKey,
			queryFn: async () => {
				const recs = await getRecommendedTechnicians({
					problemDescription,
					latitude: coords?.latitude,
					longitude: coords?.longitude,
					topK: 10,
				});
				return new Map(
					recs.map((r: { technician_id: string }, i: number) => [
						r.technician_id,
						i,
					]),
				);
			},
			enabled: activeSort === "Recommended" && categoryId.length > 0,
			staleTime: TECHNICIAN_LIST_CACHE_MS,
			gcTime: TECHNICIAN_LIST_GC_MS,
			retry: 1,
		});

	// Refetch on return-to-screen, but only when the cache for the *current* filter
	// is older than one minute. Gives "refresh when I come back to it, only after a
	// minute" without any background auto-refresh while the screen just sits open.
	// (On first focus the data is fresh/loading, so this never double-fetches.)
	useFocusEffect(
		useCallback(() => {
			const listKey = technicianQueryKeys.infiniteList(
				categoryId.trim(),
				debouncedSearch.trim(),
				coords?.latitude ?? null,
				coords?.longitude ?? null,
				serverSort ?? null,
				20,
			);
			const listState = queryClient.getQueryState(listKey);
			if (isCacheOlderThanOneMinute(listState?.dataUpdatedAt)) {
				void refetch();
			}
			if (activeSort === "Recommended") {
				const rankKey = recommendedRankQueryKey({
					categoryId,
					problemDescription,
					coords,
				});
				const rankState = queryClient.getQueryState(rankKey);
				if (isCacheOlderThanOneMinute(rankState?.dataUpdatedAt)) {
					void queryClient.invalidateQueries({
						queryKey: rankKey,
						exact: true,
						refetchType: "active",
					});
				}
			}
		}, [
			activeSort,
			categoryId,
			coords,
			debouncedSearch,
			problemDescription,
			queryClient,
			refetch,
			serverSort,
		]),
	);

	const handleSortPress = useCallback(
		async (option: SortKey) => {
			if (
				option === "Nearest" &&
				!activeAddressCoords &&
				permissionStatus !== "granted"
			) {
				await requestLocationPermission();
				const updatedStatus = useLocationStore.getState().permissionStatus;
				if (updatedStatus !== "granted") {
					Toast.show({
						type: "info",
						text1: t("list.locationPermission"),
					});
					return;
				}
			}
			const targetSort = toServerSort(option);
			const targetTechniciansQueryKey = technicianQueryKeys.infiniteList(
				categoryId.trim(),
				debouncedSearch.trim(),
				coords?.latitude ?? null,
				coords?.longitude ?? null,
				targetSort ?? null,
				20,
			);
			const targetTechniciansState = queryClient.getQueryState(
				targetTechniciansQueryKey,
			);
			if (isCacheOlderThanOneMinute(targetTechniciansState?.dataUpdatedAt)) {
				await queryClient.invalidateQueries({
					queryKey: targetTechniciansQueryKey,
					exact: true,
					refetchType: option === activeSort ? "active" : "inactive",
				});
			}
			if (option === "Recommended") {
				const targetRecommendedRankQueryKey = recommendedRankQueryKey({
					categoryId,
					problemDescription,
					coords,
				});
				const targetRecommendedState = queryClient.getQueryState(
					targetRecommendedRankQueryKey,
				);
				if (isCacheOlderThanOneMinute(targetRecommendedState?.dataUpdatedAt)) {
					await queryClient.invalidateQueries({
						queryKey: targetRecommendedRankQueryKey,
						exact: true,
						refetchType: option === activeSort ? "active" : "inactive",
					});
				}
			}
			if (option === activeSort) return;
			setActiveSort(option);
		},
		[
			activeSort,
			activeAddressCoords,
			categoryId,
			coords,
			debouncedSearch,
			permissionStatus,
			problemDescription,
			queryClient,
			requestLocationPermission,
			setActiveSort,
			t,
		],
	);

	const handleAvatarPress = useCallback(
		(technicianId: string, initials: string) => {
			profileSheetRef.current?.open(technicianId, initials);
		},
		[],
	);

	const handleCardPress = useDebounce((item: TechnicianListItem) => {
		const fullName = `${item.first_name} ${item.last_name}`;
		const route = ROUTES.user.technicianDetail(item.id);
		router.push({
			...route,
			params: {
				...route.params,
				technicianName: fullName,
				initials: getPfpInitialsFallback(fullName),
				categoryId,
				categoryName,
				distanceKm:
					item.distance_km == null ? undefined : item.distance_km.toFixed(1),
			},
		});
	}, 600);

	const displayedTechnicians = useMemo(() => {
		if (activeSort !== "Recommended" || !recommendedRank) return technicians;
		return [...technicians].sort((a, b) => {
			const ar = recommendedRank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
			const br = recommendedRank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
			if (ar !== br) return ar - br;
			return a.first_name.localeCompare(b.first_name);
		});
	}, [technicians, activeSort, recommendedRank]);

	const inspectionFeeQueries = useQueries({
		queries: displayedTechnicians.map((technician) => ({
			queryKey: orderQueryKeys.inspectionFeePreview(
				technician.id,
				activePricingAddress?.id ?? "missing",
			),
			queryFn: async () => {
				const response = await getInspectionFeePreview(
					technician.id,
					activePricingAddress?.id as string,
				);
				return response.data;
			},
			enabled: !!activePricingAddress?.id,
			retry: false,
			meta: { showToast: false, silent: true },
			staleTime: TECHNICIAN_LIST_CACHE_MS,
			gcTime: TECHNICIAN_LIST_GC_MS,
		})),
	});

	const inspectionFeeLabels = useMemo(() => {
		return new Map(
			displayedTechnicians.map((technician, index) => {
				if (!activePricingAddress?.id) {
					return [technician.id, "Add address to preview fee"] as const;
				}
				const query = inspectionFeeQueries[index];
				if (!query || query.isLoading) {
					return [technician.id, "Calculating fee..."] as const;
				}
				if (query.isError) {
					return [technician.id, t("card.inspectionFeeUnavailable")] as const;
				}
				if (!query.data) {
					return [technician.id, "Calculated from distance"] as const;
				}
				return [
					technician.id,
					formatCurrency(query.data.inspection_fee),
				] as const;
			}),
		);
	}, [activePricingAddress?.id, displayedTechnicians, inspectionFeeQueries, t]);

	const renderItem = useCallback(
		({ item, index }: { item: TechnicianListItem; index: number }) => (
			<TechnicianCard
				item={item}
				index={index}
				inspectionFeeLabel={inspectionFeeLabels.get(item.id)}
				onPress={handleCardPress}
				onAvatarPress={handleAvatarPress}
			/>
		),
		[handleCardPress, handleAvatarPress, inspectionFeeLabels],
	);

	const keyExtractor = useCallback((item: TechnicianListItem) => item.id, []);

	const showSkeleton =
		isLoading ||
		(isFetching && !isFetchingNextPage && technicians.length === 0) ||
		(activeSort === "Recommended" &&
			isLoadingRecommended &&
			recommendedRank === null) ||
		isSearchSettling;
	// Background refetch keeps cached cards on screen; show a small top spinner
	// instead of replacing real results with placeholders.
	const isBackgroundRefreshing =
		isFetching &&
		!isFetchingNextPage &&
		!showSkeleton &&
		technicians.length > 0;
	const hasSearch =
		debouncedSearch.trim().length > 0 || searchText.trim().length > 0;
	const count = showSkeleton ? technicians.length : displayedTechnicians.length;
	const countLabel =
		count === 1 ? t("list.technicianOne") : t("list.technicianOther");
	const listFooter = useMemo(() => {
		if (!isFetchingNextPage) return null;
		return <LoadingSpinner className="py-stack-lg" size="small" />;
	}, [isFetchingNextPage]);
	const listHeader = useMemo(() => {
		if (!isBackgroundRefreshing) return null;
		return <LoadingSpinner className="py-stack-sm" size="small" />;
	}, [isBackgroundRefreshing]);
	const loadNextPage = useCallback(() => {
		if (!hasNextPage || isFetching || isFetchingNextPage) return;
		void fetchNextPage();
	}, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);
	const handleListScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const { contentOffset, contentSize, layoutMeasurement } =
				event.nativeEvent;
			const distanceFromBottom =
				contentSize.height - (contentOffset.y + layoutMeasurement.height);
			if (distanceFromBottom <= 160) {
				loadNextPage();
			}
		},
		[loadNextPage],
	);

	return (
		<ScreenSafeAreaView className="flex-1 bg-app-primary" edges={["top"]}>
			<ScreenStatusBar variant="blue" />
			<View className="flex-1 bg-background">
				<PageHeader
					title={headerTitle}
					subtitle={`${count} ${countLabel}`}
					variant="app-primary"
					onBackPress={goBack}
				/>

				<View className="px-screen-x pt-stack-lg pb-stack-lg">
					<View className="h-control-search flex-row items-center gap-control-search rounded-input bg-card px-control-search">
						<Search
							size={spacing.icon.sm}
							color={themeColors.textMuted}
							strokeWidth={2}
						/>
						<Input
							value={searchText}
							onChangeText={setSearchText}
							placeholder={t("list.searchPlaceholder")}
							variant="outline"
							className="h-auto flex-1 border-0 bg-transparent p-0 text-sm"
							returnKeyType="search"
							autoCorrect={false}
							underlineColorAndroid="transparent"
						/>
						{searchText.length > 0 ? (
							<Button
								variant="ghost"
								size="icon"
								className="h-control-icon-box-sm w-control-icon-box-sm"
								onPress={() => setSearchText("")}
								accessibilityLabel={t("list.clearSearch")}
							>
								<X
									size={spacing.icon.xs}
									color={themeColors.textSecondary}
									strokeWidth={2}
								/>
							</Button>
						) : null}
					</View>
				</View>

				<SortBar activeSort={activeSort} onSortPress={handleSortPress} />

				{showSkeleton ? (
					<TechnicianListSkeleton />
				) : displayedTechnicians.length === 0 ? (
					<EmptyState
						isError={isError}
						hasSearch={hasSearch}
						onRetry={() => {
							void refetch();
						}}
					/>
				) : (
					<FlatList
						data={displayedTechnicians}
						keyExtractor={keyExtractor}
						renderItem={renderItem}
						ListHeaderComponent={listHeader}
						ListFooterComponent={listFooter}
						onEndReached={loadNextPage}
						onEndReachedThreshold={0.4}
						onScroll={handleListScroll}
						scrollEventThrottle={120}
						contentContainerStyle={{
							paddingTop: spacing.stack.xs,
							paddingBottom: spacing.screen.scrollBottomInset,
						}}
						showsVerticalScrollIndicator={false}
						initialNumToRender={8}
						maxToRenderPerBatch={8}
						windowSize={9}
						removeClippedSubviews
					/>
				)}
			</View>

			<TechnicianProfileSheet ref={profileSheetRef} />
		</ScreenSafeAreaView>
	);
}
