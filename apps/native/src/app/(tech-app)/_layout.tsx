import { View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  House,
  CalendarDays,
  MessageCircle,
  Wallet,
  User,
} from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { TAB_BAR_STYLE, TAB_BAR_LABEL_STYLE } from "@/src/lib/tab-bar-config";
import { useAuthStore } from "@/src/stores/auth-store";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TechAppLayout() {
  const { isAuthenticated, isLoading, userType } = useAuthStore();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/get-started" />;
  }

  // Only technicians may access this group
  if (!isLoading && isAuthenticated && userType !== "technician") {
    return <Redirect href="/(app)" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <BottomSheetModalProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textMuted,
            tabBarStyle: TAB_BAR_STYLE,
            tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
          }}
        >
          <Tabs.Screen
            name="(bookings)"
            options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }}
          />
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
                  className="-mt-5 h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: focused ? Colors.primary : Colors.primaryDark,
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <MessageCircle
                    size={26}
                    color={Colors.surfaceBase}
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
        </Tabs>
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
}
