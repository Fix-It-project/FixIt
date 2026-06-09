import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import Toast from "react-native-toast-message";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import type { TechniciansSortParam } from "@/src/features/technicians/api/technicians";
import { useTechniciansInfiniteQuery } from "@/src/features/technicians/hooks/useTechniciansQuery";
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

function EmptyState({
	isError,
	hasSearch,
	onRetry,
}: {
	readonly isError: boolean;
	readonly hasSearch: boolean;
	readonly onRetry: () => void;
}) {
	return (
		<View className="flex-1 items-center justify-center px-screen-x">
			<Text
				variant="buttonLg"
				className="text-center font-semibold text-content"
			>
				{isError ? "Unable to load technicians" : "No technicians found"}
			</Text>
			<Text
				variant="bodySm"
				className="mt-stack-xs max-w-sm text-center text-content-muted"
			>
				{isError
					? "Please try again in a moment."
					: hasSearch
						? "Try a shorter name or clear the search."
						: "There are no technicians in this category yet."}
			</Text>
			{isError ? (
				<Button
					variant="secondary"
					size="sm"
					className="mt-stack-md"
					onPress={onRetry}
				>
					Retry
				</Button>
			) : null}
		</View>
	);
}

export default function NewTechnicians() {
	const themeColors = useThemeColors();
	const params = useLocalSearchParams<{
		categoryId?: string | string[];
		categoryName?: string | string[];
	}>();
	const categoryId = getStringParam(params.categoryId);
	const categoryName = getStringParam(params.categoryName) || "Technicians";

	const { searchText, setSearchText, activeSort, setActiveSort } =
		useTechnicianSearchStore();
	const debouncedSearch = useDebouncedValue(searchText, 350);
	const isSearchSettling = searchText.trim() !== debouncedSearch.trim();
	const { location, permissionStatus, requestLocationPermission } =
		useLocationStore();
	const { data: addresses } = useAddressesQuery();
	const activeAddressCoords = useMemo(() => {
		const addressWithCoords =
			addresses?.find(
				(address) =>
					address.is_active &&
					address.latitude != null &&
					address.longitude != null,
			) ??
			addresses?.find(
				(address) => address.latitude != null && address.longitude != null,
			);
		if (!addressWithCoords) return null;
		return {
			latitude: addressWithCoords.latitude as number,
			longitude: addressWithCoords.longitude as number,
		};
	}, [addresses]);
	const coords = activeAddressCoords ?? location;
	const [sortRefreshToken, setSortRefreshToken] = useState(0);
	const lastCategoryRef = useRef<string | null>(null);

	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);

	useEffect(() => {
		if (!categoryId || lastCategoryRef.current === categoryId) return;
		lastCategoryRef.current = categoryId;
		setSearchText("");
	}, [categoryId, setSearchText]);

	const serverSort: TechniciansSortParam | undefined =
		activeSort === "Top Rated"
			? "top_rated"
			: activeSort === "Most Reviews"
				? "most_reviews"
				: activeSort === "Nearest"
					? "nearest"
					: undefined;

	const {
		data,
		isLoading,
		isFetching,
		isFetchingNextPage,
		isError,
		refetch,
		fetchNextPage,
		hasNextPage,
	} = useTechniciansInfiniteQuery(
		categoryId,
		debouncedSearch,
		coords,
		serverSort,
		sortRefreshToken,
	);
	const technicians = useMemo(() => data?.pages.flat() ?? [], [data]);

	const goBack = useSafeBack(ROUTES.user.categories);

	const problemDescription = categoryName || "General home service needed";

	const { data: recommendedRank = null, isFetching: isFetchingRecommended } =
		useQuery({
			queryKey: [
				"recommended-technician-rank",
				categoryId || null,
				problemDescription,
				coords?.latitude ?? null,
				coords?.longitude ?? null,
				sortRefreshToken,
			],
			queryFn: async () => {
				const recs = await getRecommendedTechnicians({
					problemDescription,
					latitude: coords?.latitude,
					longitude: coords?.longitude,
					topK: 20,
				});
				return new Map(
					recs.map((r: { technician_id: string }, i: number) => [
						r.technician_id,
						i,
					]),
				);
			},
			enabled: activeSort === "Recommended" && categoryId.length > 0,
			staleTime: 0,
			retry: 1,
		});

	const handleSortPress = useCallback(
		async (option: SortKey) => {
			if (option === activeSort) return;
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
						text1: "Location permission required for nearest sort",
					});
					return;
				}
			}
			setActiveSort(option);
			setSortRefreshToken((token) => token + 1);
		},
		[
			activeSort,
			activeAddressCoords,
			permissionStatus,
			requestLocationPermission,
			setActiveSort,
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
					item.distance_km != null ? item.distance_km.toFixed(1) : undefined,
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

	const renderItem = useCallback(
		({ item, index }: { item: TechnicianListItem; index: number }) => (
			<TechnicianCard
				item={item}
				index={index}
				onPress={handleCardPress}
				onAvatarPress={handleAvatarPress}
			/>
		),
		[handleCardPress, handleAvatarPress],
	);

	const keyExtractor = useCallback((item: TechnicianListItem) => item.id, []);

	const showSkeleton =
		isLoading ||
		(isFetching && !isFetchingNextPage) ||
		isFetchingRecommended ||
		isSearchSettling;
	const hasSearch =
		debouncedSearch.trim().length > 0 || searchText.trim().length > 0;
	const count = showSkeleton ? technicians.length : displayedTechnicians.length;
	const countLabel = count === 1 ? "technician" : "technicians";
	const listFooter = useMemo(() => {
		if (!isFetchingNextPage) return null;
		return <LoadingSpinner className="py-stack-lg" size="small" />;
	}, [isFetchingNextPage]);

	return (
		<ScreenSafeAreaView className="flex-1 bg-app-primary" edges={["top"]}>
			<View className="flex-1 bg-background">
				<PageHeader
					title={categoryName}
					subtitle={
						showSkeleton ? "Updating results" : `${count} ${countLabel}`
					}
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
							placeholder="Search technicians"
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
								accessibilityLabel="Clear search"
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
						ListFooterComponent={listFooter}
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) {
								void fetchNextPage();
							}
						}}
						onEndReachedThreshold={0.4}
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
