import { useRef, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
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
import UserBookingSheet, { type UserBookingSheetRef } from "@/src/components/user/booking/UserBookingSheet";
import type { TechnicianListItem } from "@/src/services/technicians/types/technician";

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
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  const { searchText, setSearchText, activeSort, setActiveSort } = useTechnicianSearchStore();

  const { location, permissionStatus, requestLocationPermission } = useLocationStore();
  const coords = activeSort === "Nearest" ? location : null;

  const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
  const bookingSheetRef = useRef<UserBookingSheetRef>(null);

  // TanStack Query – cached & refetchable
  const { data: technicians = [], isLoading, refetch } = useTechniciansQuery(
    categoryId ?? "",
    searchText,
    coords,
  );

  // When coords become available while "Nearest" is active, trigger a refetch
  useEffect(() => {
    if (activeSort === "Nearest" && location) {
      refetch();
    }
  }, [activeSort, location, refetch]);

  const handleSortPress = useCallback(
    async (option: SortKey) => {
      if (option === "Nearest" && permissionStatus !== "granted") {
        await requestLocationPermission();
        // After requesting, check the updated permission status from the store
        const updatedStatus = useLocationStore.getState().permissionStatus;
        if (updatedStatus !== "granted") {
          Toast.show({ type: "error", text1: "Location permission required for nearest sort" });
          return;
        }
      }
      setActiveSort(option);
    },
    [permissionStatus, requestLocationPermission, setActiveSort],
  );

  const handleAvatarPress = useCallback(
    (technicianId: string, initials: string) => {
      profileSheetRef.current?.open(technicianId, initials);
    },
    [],
  );

  const handleBookPress = useCallback(
    (technicianId: string, name: string) => {
      // Pass the categoryId as the service_id directly into the booking sheet
      if (categoryId) {
        bookingSheetRef.current?.open(technicianId, name, categoryId);
      }
    },
    [categoryId],
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
        <TechnicianSortBar activeSort={activeSort} onSortPress={handleSortPress} />

        {/* ── Technician list ── */}
        <TechnicianListBody
          isLoading={isLoading}
          technicians={technicians}
          onAvatarPress={handleAvatarPress}
          onBookPress={handleBookPress}
        />
      </View>

      {/* Sheets */}
      <TechnicianProfileSheet ref={profileSheetRef} />
      <UserBookingSheet ref={bookingSheetRef} />
    </SafeAreaView>
  );
}

