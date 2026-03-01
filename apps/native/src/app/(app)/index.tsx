import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationHeader from "@/src/components/home/LocationHeader";
import HeaderPolygons from "@/src/components/home/HeaderPolygons";
import SearchBar from "@/src/components/home/SearchBar";
import PreviousOrdersSection from "@/src/components/home/OrderAgainCard";
import CategoryGrid from "@/src/components/home/CategoryGrid";
import RecommendedTechnicians from "@/src/components/home/RecommendedTechnicians";
import NearYouSection from "@/src/components/home/NearYouSection";
import { Colors } from "@/src/lib/colors";

/** Vertical gap between home-page sections (single source of truth). */
const SECTION_GAP = 16;

export default function Home() {
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
            <LocationHeader />
            <SearchBar />
          </View>

          {/* Content area */}
          <View className="bg-surface-gray" style={{ paddingTop: 12, gap: SECTION_GAP }}>
            {/* Category grid */}
            <CategoryGrid />

            {/* Recommended technicians */}
            <RecommendedTechnicians />

            {/* Near You section */}
            <NearYouSection />

            {/* Previous orders */}
            <PreviousOrdersSection />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
