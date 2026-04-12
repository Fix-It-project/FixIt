import { router, Tabs } from "expo-router";
import {
  ClipboardList,
  Grid2X2,
  House,
  MessageCircle,
  User,
} from "lucide-react-native";
import { Platform, TouchableOpacity } from "react-native";
import { ProtectedTabsLayout } from "@/src/components/navigation/ProtectedTabsLayout";
import { useDebounce } from "@/src/hooks/useDebounce";
import {
  AUTH_GET_STARTED_ROUTE,
  TECH_ROOT_ROUTE,
} from "@/src/lib/navigation-routes";
import { useBottomTabMetrics } from "@/src/lib/tab-bar-config";
import { useThemeColors } from "@/src/lib/theme";

const APP_CHATBOT_ROUTE = "/(app)/(chatbot)" as const;
const CHAT_FAB_SIZE = 56;
const HIDDEN_TAB_OPTIONS = {
  tabBarButton: () => null,
  tabBarItemStyle: { display: "none" as const },
};

export default function AppLayout() {
  const themeColors = useThemeColors();
  const { tabBarHeight } = useBottomTabMetrics();
  const goToChatbot = useDebounce(() => router.push(APP_CHATBOT_ROUTE));

  return (
    <ProtectedTabsLayout
      allowedUserType="user"
      unauthenticatedRedirect={AUTH_GET_STARTED_ROUTE}
      wrongRoleRedirect={TECH_ROOT_ROUTE}
      overlay={
        <TouchableOpacity
          onPress={goToChatbot}
          activeOpacity={0.85}
          style={{
            position: "absolute",
            right: 20,
            bottom: tabBarHeight + 12,
            width: CHAT_FAB_SIZE,
            height: CHAT_FAB_SIZE,
            borderRadius: CHAT_FAB_SIZE / 2,
            backgroundColor: themeColors.primary,
            alignItems: "center",
            justifyContent: "center",
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
        </TouchableOpacity>
      }
    >
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
        name="(categories)"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, size }) => (
            <Grid2X2 size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen name="(chatbot)" options={HIDDEN_TAB_OPTIONS} />
      <Tabs.Screen name="(services)" options={HIDDEN_TAB_OPTIONS} />
      <Tabs.Screen name="(technicians)" options={HIDDEN_TAB_OPTIONS} />
      <Tabs.Screen name="(booking)" options={HIDDEN_TAB_OPTIONS} />
      <Tabs.Screen
        name="(orders)"
        options={{
          title: "My Orders",
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} strokeWidth={1.8} />
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
  );
}
