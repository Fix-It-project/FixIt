import { useState, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, Search, SlidersHorizontal } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useTechniciansQuery } from "@/src/hooks/technicians/useTechniciansQuery";
import { useLocationStore } from "@/src/stores/location-store";
import TechnicianListCard from "@/src/components/technicians/TechnicianListCard";
import TechnicianProfileSheet, {
  type TechnicianProfileSheetRef,
} from "@/src/components/technicians/TechnicianProfileSheet";
import type { TechnicianListItem } from "@/src/services/technicians/types";

// ─── Sort options ────────────────────────────────────────────────────────────
const SORT_OPTIONS = ["Top Rated", "Nearest", "Most Reviews"] as const;
type SortKey = (typeof SORT_OPTIONS)[number];

// ─── Extracted list body (avoids nested ternary in JSX) ──────────────────────
function TechnicianListBody({
  isLoading: loading,
  technicians,
  onAvatarPress,
}: Readonly<{
  isLoading: boolean;
  technicians: TechnicianListItem[];
  onAvatarPress: (technicianId: string, initials: string) => void;
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
        <TechnicianListCard item={item} onAvatarPress={onAvatarPress} />
      )}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default function TechniciansListScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  const [searchText, setSearchText] = useState("");
  const [activeSort, setActiveSort] = useState<SortKey>("Top Rated");

  const { location, permissionStatus, requestLocationPermission } = useLocationStore();
  const coords = activeSort === "Nearest" ? location : null;

  const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);

  // TanStack Query – cached & refetchable
  const { data: technicians = [], isLoading } = useTechniciansQuery(
    categoryId ?? "",
    searchText,
    coords,
  );

  const handleSortPress = useCallback(
    (option: SortKey) => {
      setActiveSort(option);
      if (option === "Nearest" && permissionStatus !== "granted") {
        requestLocationPermission();
      }
    },
    [permissionStatus, requestLocationPermission],
  );

  const handleAvatarPress = useCallback(
    (technicianId: string, initials: string) => {
      profileSheetRef.current?.open(technicianId, initials);
    },
    [],
  );

  return (
    <SafeAreaView className="flex-1" edges={["top"]} style={{ backgroundColor: Colors.brand }}>
      <View className="flex-1 bg-surface-gray">
        {/* ── Blue header ── */}
        <View style={{ backgroundColor: Colors.brand }} className="pb-4">
          {/* Top row: back + title */}
          <View className="flex-row items-center px-4 pb-2 pt-2">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="mr-3 h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: Colors.whiteOverlay }}
            >
              <ChevronLeft size={22} color={Colors.white} strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text
                className="text-[20px] font-bold text-white"
                style={{ fontFamily: "GoogleSans_700Bold" }}
                numberOfLines={1}
              >
                {categoryName ?? "Technicians"}
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
                style={{ fontFamily: "GoogleSans_400Regular", padding: 0 }}
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
        <View className="bg-white py-2.5" style={{ borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            <View
              className="mr-1 h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: Colors.surfaceGray }}
            >
              <SlidersHorizontal size={16} color={Colors.surfaceMuted} strokeWidth={2} />
            </View>
            {SORT_OPTIONS.map((option) => {
              const isActive = activeSort === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleSortPress(option)}
                  activeOpacity={0.7}
                  className="items-center justify-center rounded-full px-4"
                  style={{
                    height: 32,
                    backgroundColor: isActive ? Colors.brand : Colors.surfaceGray,
                  }}
                >
                  <Text
                    className="text-[12px] font-semibold"
                    style={{
                      fontFamily: "GoogleSans_600SemiBold",
                      color: isActive ? Colors.white : Colors.textSecondary,
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Technician list ── */}
        <TechnicianListBody
          isLoading={isLoading}
          technicians={technicians}
          onAvatarPress={handleAvatarPress}
        />
      </View>

      {/* ── Profile bottom sheet (renders above everything) ── */}
      <TechnicianProfileSheet ref={profileSheetRef} />
    </SafeAreaView>
  );
}

