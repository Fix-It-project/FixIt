import { View, Platform } from "react-native";
import { Tabs } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  House,
  CalendarDays,
  MessageCircle,
  Wallet,
  User,
} from "lucide-react-native";
import { ProtectedTabsLayout } from "@/src/components/navigation/ProtectedTabsLayout";
import {
  APP_ROOT_ROUTE,
  AUTH_GET_STARTED_ROUTE,
} from "@/src/lib/navigation-routes";
import { useBottomTabMetrics } from "@/src/lib/tab-bar-config";
import { useThemeColors } from "@/src/lib/theme";

const HIDDEN_TAB_OPTIONS = {
  tabBarButton: () => null,
  tabBarItemStyle: { display: "none" as const },
};
const CENTER_ACTION_SIZE = 56;

export default function TechAppLayout() {
  const themeColors = useThemeColors();
  const { tabBarHeight } = useBottomTabMetrics();
  const centerActionLift = Math.round(tabBarHeight * 0.24);

  return (
    <BottomSheetModalProvider>
      <ProtectedTabsLayout
        allowedUserType="technician"
        unauthenticatedRedirect={AUTH_GET_STARTED_ROUTE}
        wrongRoleRedirect={APP_ROOT_ROUTE}
      >
        <Tabs.Screen name="(bookings)" options={HIDDEN_TAB_OPTIONS} />
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <House size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="(schedule)"
          options={{
            href: "/(tech-app)/(schedule)",
            title: "Schedule",
            tabBarIcon: ({ color, size }) => (
              <CalendarDays size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="(chatbot)"
          options={{
            title: "",
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  marginTop: -centerActionLift,
                  width: CENTER_ACTION_SIZE,
                  height: CENTER_ACTION_SIZE,
                  borderRadius: CENTER_ACTION_SIZE / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused
                    ? themeColors.primary
                    : themeColors.primaryDark,
                  elevation: Platform.OS === "android" ? 6 : 0,
                  shadowColor: themeColors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: Platform.OS === "ios" ? 0.35 : 0,
                  shadowRadius: Platform.OS === "ios" ? 10 : 0,
                }}
              >
                <MessageCircle
                  size={26}
                  color={themeColors.surfaceBase}
                  strokeWidth={1.8}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="(wallet)"
          options={{
            title: "Wallet",
            tabBarIcon: ({ color, size }) => (
              <Wallet size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            title: "My Profile",
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
      </ProtectedTabsLayout>
    </BottomSheetModalProvider>
  );
}
