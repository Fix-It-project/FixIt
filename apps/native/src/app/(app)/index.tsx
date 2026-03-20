import { useRef, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import LocationHeader from "@/src/components/user/home/LocationHeader";
import HeaderPolygons from "@/src/components/user/home/HeaderPolygons";
import SearchBar from "@/src/components/user/home/SearchBar";
import PreviousOrdersSection from "@/src/components/user/home/OrderAgainCard";
import CategoryGrid from "@/src/components/user/home/CategoryGrid";
import RecommendedTechnicians from "@/src/components/user/home/RecommendedTechnicians";
import NearYouSection from "@/src/components/user/home/NearYouSection";
import AddressBottomSheet, { type AddressBottomSheetRef } from "@/src/components/user/home/AddressBottomSheet";
import AddNewAddressSheet, { type AddNewAddressSheetRef } from "@/src/components/user/home/AddNewAddressSheet";
import { Colors } from "@/src/lib/colors";

/** Vertical gap between home-page sections (single source of truth). */
const SECTION_GAP = 16;

export default function Home() {
  const addressSheetRef = useRef<AddressBottomSheetRef>(null);
  const addNewAddressSheetRef = useRef<AddNewAddressSheetRef>(null);

  // Incoming change: categoryName now passed directly instead of looked up via CATEGORIES.find()
  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    router.push({
      pathname: "/(app)/(technicians)/list" as any,
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
    <View className="flex-1 bg-surface-gray">
      <SafeAreaView
        className="flex-1"
        edges={["top"]}
        style={{ backgroundColor: Colors.brand }}
      >
        <ScrollView
          className="flex-1 bg-surface-gray"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-6"
        >
          {/* Blue header area */}
          <View style={{ backgroundColor: Colors.brand }} className="pb-6">
            <HeaderPolygons />
            <LocationHeader onLocationPress={handleLocationPress} />
            <SearchBar />
          </View>

          {/* Content area */}
          <View className="bg-surface-gray" style={{ paddingTop: 12, gap: SECTION_GAP }}>
            {/* Category grid */}
            <CategoryGrid onCategoryPress={handleCategoryPress} />
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