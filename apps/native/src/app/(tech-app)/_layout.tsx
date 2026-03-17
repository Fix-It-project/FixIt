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
import { useAuthStore } from "@/src/stores/auth-store";

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
    <BottomSheetModalProvider>
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
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View
              className="-mt-5 h-14 w-14 items-center justify-center rounded-full"
              style={{
                backgroundColor: focused ? Colors.brand : Colors.brandDark,
                shadowColor: Colors.brand,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <MessageCircle
                size={26}
                color={Colors.white}
                strokeWidth={1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size }) => (
            <Wallet size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "My Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
    </BottomSheetModalProvider>
  );
}
