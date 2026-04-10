import { RefreshControl, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/src/lib/colors";
import { useTechnicianOrdersQuery } from "@/src/hooks/tech/useCalendar";
import DashboardHeader from "@/src/features/tech-self/components/tech/DashboardHeader";
import IncomingRequestsSection from "@/src/features/dashboard/components/tech/IncomingRequestsSection";
import TodayScheduleSection from "@/src/features/dashboard/components/tech/TodayScheduleSection";
import EarningsWallet from "@/src/features/dashboard/components/tech/EarningsWallet";

const SECTION_GAP = 8;

export default function TechHome() {
  const { isRefetching, refetch } = useTechnicianOrdersQuery();

  return (
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Sticky header — outside ScrollView */}
        <DashboardHeader />

        {/* Scrollable content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, gap: SECTION_GAP }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* Incoming job requests */}
          <IncomingRequestsSection />

          {/* Today's schedule timeline */}
          <TodayScheduleSection />

          {/* Earnings & wallet */}
          <EarningsWallet />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
