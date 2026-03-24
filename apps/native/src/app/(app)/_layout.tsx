import { Colors } from "@/src/lib/colors";
import { TAB_BAR_STYLE, TAB_BAR_LABEL_STYLE } from "@/src/lib/tab-bar-config";
import { useAuthStore } from "@/src/stores/auth-store";
import { Redirect, Tabs, router } from "expo-router";
import {
  Grid2X2,
  House,
  MessageCircle,
  User,
} from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

export default function AppLayout() {
  const { isAuthenticated, isLoading, userType } = useAuthStore();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/get-started" />;
  }

  if (!isLoading && isAuthenticated && userType === "technician") {
    return <Redirect href="/(tech-app)" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.brand,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: TAB_BAR_STYLE,
          tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
        }}
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
        <Tabs.Screen
          name="(chatbot)"
          options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }}
        />
        <Tabs.Screen
          name="(services)"
          options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }}
        />
        <Tabs.Screen
          name="(technicians)"
          options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }}
        />
        <Tabs.Screen
          name="(booking)"
          options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }}
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

      {/* Floating chat button — bottom-right, above tab bar */}
      <TouchableOpacity
        onPress={() => router.push("/(app)/(chatbot)")}
        activeOpacity={0.85}
        style={{
          position: "absolute",
          bottom: 96,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: Colors.brand,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: Colors.brand,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <MessageCircle size={26} color={Colors.white} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  );
}