import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationHeader from "@/src/components/home/LocationHeader";
import OrderAgainCard from "@/src/components/home/OrderAgainCard";
import CategoryGrid from "@/src/components/home/CategoryGrid";
import RecommendedTechnicians from "@/src/components/home/RecommendedTechnicians";
import NearYouSection from "@/src/components/home/NearYouSection";
import { Colors } from "@/src/lib/colors";

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
          <View style={{ backgroundColor: Colors.brand }} className="pb-12">
            <LocationHeader />
          </View>

          {/* Content area */}
          <View className="bg-surface-gray">
            {/* Order Again card – intersects blue / gray boundary */}
            <View className="-mt-7">
              <OrderAgainCard />
            </View>

            {/* Category grid (7 + "More") */}
            <CategoryGrid />

            {/* Recommended technicians (swipeable carousel) */}
            <RecommendedTechnicians />

            {/* Near You section */}
            <NearYouSection />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
