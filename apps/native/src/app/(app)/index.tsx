import { useRef, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import LocationHeader from "@/src/features/addresses/components/user/LocationHeader";
import HeaderPolygons from "@/src/components/home/HeaderPolygons";
import SearchBar from "@/src/components/home/SearchBar";
import PreviousOrdersSection from "@/src/features/booking-orders/components/user/PreviousOrdersSection";
import CategoryGrid from "@/src/features/categories/components/user/CategoryGrid";
import RecommendedTechnicians from "@/src/features/technicians/components/user/RecommendedTechnicians";
import NearYouSection from "@/src/features/technicians/components/user/NearYouSection";
import AddressBottomSheet, { type AddressBottomSheetRef } from "@/src/features/addresses/components/user/AddressBottomSheet";
import AddNewAddressSheet, { type AddNewAddressSheetRef } from "@/src/features/addresses/components/user/AddNewAddressSheet";
import { useCategoriesQuery } from "@/src/hooks/categories/useCategoriesQuery";
import { Colors } from "@/src/lib/colors";

/** Vertical gap between home-page sections (single source of truth). */
const SECTION_GAP = 16;

export default function Home() {
  const addressSheetRef = useRef<AddressBottomSheetRef>(null);
  const addNewAddressSheetRef = useRef<AddNewAddressSheetRef>(null);
  const { data: categories, isLoading: categoriesLoading } = useCategoriesQuery();

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    router.push({
      pathname: "/(app)/(services)/list",
      params: {
        categoryId,
        categoryName,
      },
    });
  };

  const handleLocationPress = useCallback(() => {
    addressSheetRef.current?.open();
  }, []);

  const handleAddNewAddress = useCallback(() => {
    addressSheetRef.current?.close();
    // Small delay to let the first sheet close before opening the second
    setTimeout(() => {
      addNewAddressSheetRef.current?.open();
    }, 300);
  }, []);

  const handleNewAddressBack = useCallback(() => {
    setTimeout(() => {
      addressSheetRef.current?.open();
    }, 300);
  }, []);

  return (
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView
        className="flex-1"
        edges={["top"]}
        style={{ backgroundColor: Colors.primary }}
      >
        <ScrollView
          className="flex-1 bg-surface-elevated"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-6"
        >
          {/* Blue header area */}
          <View style={{ backgroundColor: Colors.primary }} className="pb-6">
            <HeaderPolygons />
            <LocationHeader onLocationPress={handleLocationPress} />
            <SearchBar />
          </View>

          {/* Content area */}
          <View className="bg-surface-elevated" style={{ paddingTop: 12, gap: SECTION_GAP }}>
            {/* Category grid */}
            <CategoryGrid categories={categories} isLoading={categoriesLoading} onCategoryPress={handleCategoryPress} />
            {/* Recommended technicians */}
            <RecommendedTechnicians />
            {/* Near You section */}
            <NearYouSection />
            {/* Previous orders */}
            <PreviousOrdersSection />
          </View>
        </ScrollView>

        {/* Address selection bottom sheet */}
        <AddressBottomSheet
          ref={addressSheetRef}
          onAddNewAddress={handleAddNewAddress}
        />
        {/* Add new address bottom sheet */}
        <AddNewAddressSheet ref={addNewAddressSheetRef} onBack={handleNewAddressBack} />
      </SafeAreaView>
    </View>
  );
}