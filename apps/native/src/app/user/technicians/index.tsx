import { router, useLocalSearchParams } from "expo-router";
import { Search } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import BackButton from "@/src/components/ui/BackButton";
import { Text } from "@/src/components/ui/text";
import TechnicianListCard from "@/src/features/technicians/components/user/TechnicianListCard";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/features/technicians/components/user/TechnicianProfileSheet";
import TechnicianSortBar from "@/src/features/technicians/components/user/TechnicianSortBar";
import { useTechniciansQuery } from "@/src/features/technicians/hooks/useTechniciansQuery";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";
import { useTechnicianSearchStore } from "@/src/features/technicians/stores/technician-search-store";
import type { SortKey } from "@/src/features/technicians/types/sort";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";
import { Colors, spacing, typography, useThemeColors } from "@/src/lib/theme";
import { useLocationStore } from "@/src/stores/location-store";

// ─── Extracted list body (avoids nested ternary in JSX) ──────────────────────
function TechnicianListBody({
	isLoading: loading,
	technicians,
	onAvatarPress,
	onBookPress,
}: Readonly<{
	isLoading: boolean;
	technicians: TechnicianListItem[];
	onAvatarPress: (technicianId: string, initials: string) => void;
	onBookPress: (technicianId: string, name: string) => void;
}>) {
	if (loading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color={Colors.primary} />
			</View>
		);
	}

	if (technicians.length === 0) {
		return (
			<View className="flex-1 items-center justify-center px-button-lg-x">
				<Text variant="buttonLg" className="text-center text-content">
					No technicians found
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-center text-content-muted">
					Try adjusting your search or pick a different category.
				</Text>
			</View>
		);
	}

	return (
		<FlatList
			data={technicians}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => (
				<TechnicianListCard
					item={item}
					onAvatarPress={onAvatarPress}
					onBookPress={onBookPress}
				/>
			)}
			contentContainerStyle={{
				paddingTop: spacing.stack.md,
				paddingBottom: spacing.screen.paddingBottom,
			}}
			showsVerticalScrollIndicator={false}
		/>
	);
}

export default function TechniciansListScreen() {
	const themeColors = useThemeColors();
	const { categoryId, categoryName, serviceId, serviceName } =
		useLocalSearchParams<{
			categoryId: string;
			categoryName: string;
			serviceId: string;
			serviceName: string;
		}>();

	const { searchText, setSearchText, activeSort, setActiveSort } =
		useTechnicianSearchStore();
	const { location, permissionStatus, requestLocationPermission } =
		useLocationStore();
	const coords = activeSort === "Nearest" ? location : null;

	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const {
		data: technicians = [],
		isLoading,
		refetch,
	} = useTechniciansQuery(categoryId ?? "", searchText, coords);
	const goBack = useSafeBack({
		pathname: ROUTES.user.services,
		params: { categoryId, categoryName },
	});

	const [recommendedRank, setRecommendedRank] = useState<Map<
		string,
		number
	> | null>(null);
	const [isFetchingRecommended, setIsFetchingRecommended] = useState(false);

	const fetchRecommended = useCallback(async () => {
		setIsFetchingRecommended(true);

		try {
			const { getRecommendedTechnicians } = await import(
				"@/src/features/technicians/recommendations.service"
			);
			const problemDescription =
				(typeof serviceName === "string" && serviceName.trim()) ||
				(typeof categoryName === "string" && categoryName.trim()) ||
				"General home service needed";

			const recs = await getRecommendedTechnicians({
				problemDescription,
				topK: 10,
			});

			setRecommendedRank(
				new Map(
					recs.map((r: { technician_id: string }, i: number) => [
						r.technician_id,
						i,
					]),
				),
			);
		} catch {
			Toast.show({ type: "error", text1: "Could not load recommendations" });
			setRecommendedRank(null);
		} finally {
			setIsFetchingRecommended(false);
		}
	}, [serviceName, categoryName]);

	useEffect(() => {
		if (activeSort === "Nearest" && location) {
			refetch();
		}
	}, [activeSort, location, refetch]);

	useEffect(() => {
		if (activeSort === "Recommended") {
			void fetchRecommended();
		}
	}, [activeSort, fetchRecommended]);

	const handleSortPress = useCallback(
		async (option: SortKey) => {
			if (option === "Nearest" && permissionStatus !== "granted") {
				await requestLocationPermission();
				const updatedStatus = useLocationStore.getState().permissionStatus;
				if (updatedStatus !== "granted") {
					Toast.show({
						type: "error",
						text1: "Location permission required for nearest sort",
					});
					return;
				}
			}

			setActiveSort(option);

			if (option === "Recommended") {
				setRecommendedRank(null);
				await fetchRecommended();
				return;
			}

			setRecommendedRank(null);
		},
		[
			permissionStatus,
			requestLocationPermission,
			setActiveSort,
			fetchRecommended,
		],
	);

	const handleAvatarPress = useCallback(
		(technicianId: string, initials: string) => {
			profileSheetRef.current?.open(technicianId, initials);
		},
		[],
	);

	const handleBookPress = useDebounce((technicianId: string, name: string) => {
		const route = ROUTES.user.bookingDate(technicianId);
		router.push({
			...route,
			params: {
				...route.params,
				technicianName: name,
				serviceId,
				serviceName,
				categoryId,
				categoryName,
			},
		});
	}, 800);

	const displayedTechnicians = useMemo(() => {
		if (activeSort !== "Recommended" || !recommendedRank) return technicians;

		return [...technicians].sort((a, b) => {
			const ar = recommendedRank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
			const br = recommendedRank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
			return ar - br;
		});
	}, [technicians, activeSort, recommendedRank]);
	const technicianCountLabel =
		technicians.length === 1 ? "technician found" : "technicians found";

	return (
		<SafeAreaView
			className="flex-1"
			edges={["top"]}
			style={{ backgroundColor: Colors.primary }}
		>
			<View className="flex-1 bg-surface-elevated">
				<View style={{ backgroundColor: Colors.primary }} className="pb-card">
					<View className="flex-row items-center px-card pt-stack-sm pb-stack-sm">
						<BackButton
							variant="header-inverse"
							className="mr-stack-md"
							onPress={goBack}
						/>
						<View className="flex-1">
							<Text
								variant="h3"
								style={{ color: themeColors.onPrimaryHeader }}
								numberOfLines={1}
							>
								{serviceName ?? categoryName ?? "Technicians"}
							</Text>
							<Text
								variant="caption"
								style={{ color: themeColors.overlayBright }}
							>
								{technicians.length} {technicianCountLabel}
							</Text>
						</View>
					</View>

					<View className="mx-card mt-stack-xs">
						<View className="h-control-search flex-row items-center gap-control-search rounded-input bg-surface px-control-search">
							<Search
								size={spacing.icon.sm}
								color={themeColors.surfaceMuted}
								strokeWidth={2}
							/>
							<TextInput
								value={searchText}
								onChangeText={setSearchText}
								placeholder="Search technicians..."
								placeholderTextColor={themeColors.textMuted}
								className="flex-1 p-0 text-content"
								style={[
									typography.bodySm,
									{
										color: themeColors.textPrimary,
										textAlignVertical: "center",
									},
								]}
								returnKeyType="search"
								autoCorrect={false}
							/>
							{searchText.length > 0 && (
								<TouchableOpacity
									onPress={() => setSearchText("")}
									activeOpacity={0.6}
								>
									<Text
										variant="caption"
										className="font-medium text-content-muted"
									>
										Clear
									</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>
				</View>

				{/* ── Sort filter tabs ── */}
				<TechnicianSortBar
					activeSort={activeSort}
					onSortPress={handleSortPress}
				/>

				{activeSort === "Recommended" && isFetchingRecommended && (
					<View
						className="flex-row items-center gap-stack-sm px-card py-stack-md"
						style={{
							borderBottomWidth: 1,
							borderBottomColor: themeColors.borderDefault,
						}}
					>
						<ActivityIndicator size="small" color={Colors.primary} />
						<Text variant="label" className="text-content-muted">
							Ranking technicians for you...
						</Text>
					</View>
				)}

				{/* ── Technician list ── */}
				<TechnicianListBody
					isLoading={isLoading}
					technicians={displayedTechnicians}
					onAvatarPress={handleAvatarPress}
					onBookPress={handleBookPress}
				/>
			</View>

			{/* Sheets */}
			<TechnicianProfileSheet ref={profileSheetRef} />
		</SafeAreaView>
	);
}
