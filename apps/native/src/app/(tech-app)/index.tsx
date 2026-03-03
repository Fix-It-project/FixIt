import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TechHeader from "@/src/components/tech-home/TechHeader";
import IncomingRequests from "@/src/components/tech-home/IncomingRequests";
import TodaySchedule from "@/src/components/tech-home/TodaySchedule";
import EarningsWallet from "@/src/components/tech-home/EarningsWallet";

const SECTION_GAP = 8;

export default function TechHome() {
  return (
    <View className="flex-1 bg-surface-gray">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Sticky header — outside ScrollView */}
        <TechHeader />

        {/* Scrollable content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, gap: SECTION_GAP }}
        >
          {/* Incoming job requests */}
          <IncomingRequests />

          {/* Today's schedule timeline */}
          <TodaySchedule />

          {/* Earnings & wallet */}
          <EarningsWallet />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
