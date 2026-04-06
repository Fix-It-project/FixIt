import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Search } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useTechniciansQuery } from "@/src/hooks/user/useTechniciansQuery";
import { useLocationStore } from "@/src/stores/location-store";
import { useTechnicianSearchStore } from "@/src/stores/technician-search-store";
import TechnicianListCard from "@/src/components/user/browse/TechnicianListCard";
import TechnicianSortBar, { type SortKey } from "@/src/components/user/browse/TechnicianSortBar";
import TechnicianProfileSheet, {
  type TechnicianProfileSheetRef,
} from "@/src/components/user/browse/TechnicianProfileSheet";
import type { TechnicianListItem } from "@/src/services/technicians/schemas/response.schema";
import {
  getRecommendedTechnicians,
} from "@/src/services/technicians/recommendations.service";
import BackButton from "@/src/components/ui/BackButton";
import { useRef, useCallback, useEffect, useMemo, useState } from "react";

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
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  if (technicians.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text
          className="text-center text-[16px] font-semibold text-content"
          style={{ fontFamily: "GoogleSans_600SemiBold" }}
        >
          No technicians found
        </Text>
        <Text className="mt-1 text-center text-[13px] text-content-muted">
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
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default function TechniciansListScreen() {
  const { categoryId, categoryName, serviceId, serviceName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
    serviceId: string;
    serviceName: string;
  }>();

  const { searchText, setSearchText, activeSort, setActiveSort } = useTechnicianSearchStore();
  const { location, permissionStatus, requestLocationPermission } = useLocationStore();
  const coords = activeSort === "Nearest" ? location : null;

  const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
  const { data: technicians = [], isLoading, refetch } = useTechniciansQuery(
    categoryId ?? "",
    searchText,
    coords,
  );

  const [recommendedRank, setRecommendedRank] = useState<Map<string, number> | null>(null);

  const fetchRecommended = useCallback(async () => {
    try {
      const problemDescription =
        (typeof serviceName === "string" && serviceName.trim()) ||
        (typeof categoryName === "string" && categoryName.trim()) ||
        "General home service needed";

      const recs = await getRecommendedTechnicians({
        problemDescription,
        topK: 10,
      });

      setRecommendedRank(
        new Map(recs.map((r: { technician_id: string }, i: number) => [r.technician_id, i])),
      );
    } catch (error) {
      Toast.show({ type: "error", text1: "Could not load recommendations" });
      setRecommendedRank(null);
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
          Toast.show({ type: "error", text1: "Location permission required for nearest sort" });
          return;
        }
      }

      setActiveSort(option);

      if (option === "Recommended") {
        await fetchRecommended();
        return;
      }

      setRecommendedRank(null);
    },
    [permissionStatus, requestLocationPermission, setActiveSort, fetchRecommended],
  );

  const handleAvatarPress = useCallback(
    (technicianId: string, initials: string) => {
      profileSheetRef.current?.open(technicianId, initials);
    },
    [],
  );

  const handleBookPress = useCallback(
    (technicianId: string, name: string) => {
      router.push({
        pathname: "/(app)/(booking)" as any,
        params: {
          technicianId,
          technicianName: name,
          serviceId,
          serviceName,
          categoryId,
          categoryName,
        },
      });
    },
    [serviceId, serviceName, categoryId, categoryName],
  );

  const displayedTechnicians = useMemo(() => {
    if (activeSort !== "Recommended" || !recommendedRank) return technicians;

    return [...technicians].sort((a, b) => {
      const ar = recommendedRank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const br = recommendedRank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return ar - br;
    });
  }, [technicians, activeSort, recommendedRank]);

  return (
    <SafeAreaView className="flex-1" edges={["top"]} style={{ backgroundColor: Colors.brand }}>
      <View className="flex-1 bg-surface-gray">
        {/* ── Blue header ── */}
        <View style={{ backgroundColor: Colors.brand }} className="pb-4">
          {/* Top row: back + title */}
          <View className="flex-row items-center px-4 pb-2 pt-2">
            <BackButton variant="light" className="mr-3" />
            <View className="flex-1">
              <Text
                className="text-[20px] font-bold text-white"
                style={{ fontFamily: "GoogleSans_700Bold" }}
                numberOfLines={1}
              >
                {serviceName ?? categoryName ?? "Technicians"}
              </Text>
              <Text
                className="text-[12px] text-white/70"
                style={{ fontFamily: "GoogleSans_400Regular" }}
              >
                {technicians.length} technician{technicians.length !== 1 ? "s" : ""} found
              </Text>
            </View>
          </View>

          {/* Search bar */}
          <View className="mx-4 mt-1">
            <View
              className="flex-row items-center rounded-xl bg-white px-3.5"
              style={{ height: 44 }}
            >
              <Search size={18} color={Colors.surfaceMuted} strokeWidth={2} />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search technicians..."
                placeholderTextColor={Colors.textMuted}
                className="ml-2.5 flex-1 text-[14px] text-content"
                style={{ fontFamily: "GoogleSans_400Regular", padding: 0, textAlignVertical: "center" }}
                returnKeyType="search"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")} activeOpacity={0.6}>
                  <Text className="text-[12px] font-medium text-content-muted">Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* ── Sort filter tabs ── */}
        <TechnicianSortBar activeSort={activeSort} onSortPress={handleSortPress} />

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
