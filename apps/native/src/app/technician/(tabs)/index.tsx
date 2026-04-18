import { RefreshControl, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/lib/theme";
import DashboardHeader from "@/src/features/tech-self/components/tech/DashboardHeader";
import IncomingRequestsSection from "@/src/features/dashboard/components/tech/IncomingRequestsSection";
import TodayScheduleSection from "@/src/features/dashboard/components/tech/TodayScheduleSection";
import EarningsWallet from "@/src/features/dashboard/components/tech/EarningsWallet";
import { useDashboardOrdersQuery } from "@/src/features/dashboard/hooks/useDashboardOrdersQuery";

const SECTION_GAP = 8;

export default function TechHome() {
  const themeColors = useThemeColors();
  const { isRefetching, refetch } = useDashboardOrdersQuery();

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
              colors={[themeColors.primary]}
              tintColor={themeColors.primary}
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
