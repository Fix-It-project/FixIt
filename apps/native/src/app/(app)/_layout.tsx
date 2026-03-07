import { View, TouchableOpacity } from "react-native";
import { Redirect, Tabs, router } from "expo-router";
import {
  House,
  Grid2X2,
  MessageCircle,
  User,
} from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { useAuthStore } from "@/src/stores/auth-store";

export default function AppLayout() {
  const { isAuthenticated, isLoading, userType } = useAuthStore();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/get-started" />;
  }

  // Technicians should never land on the user app
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
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 0,
            height: 80,
            paddingBottom: 20,
            paddingTop: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 2,
          },
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
          name="categories"
          options={{
            title: "Categories",
            tabBarIcon: ({ color, size }) => (
              <Grid2X2 size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen name="chatbot" options={{ href: null }} />
        <Tabs.Screen name="technicians" options={{ href: null }} />
        <Tabs.Screen
          name="profile"
          options={{
            title: "My Profile",
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen name="technicians-list" options={{ href: null }} />
      </Tabs>

      {/* Floating chat button — bottom-right, above tab bar */}
      <TouchableOpacity
        onPress={() => router.push("/(app)/chatbot")}
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
