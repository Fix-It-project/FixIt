import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/stores/auth-store";

export default function AuthLayout() {
  const { isAuthenticated, isLoading, userType } = useAuthStore();

  if (!isLoading && isAuthenticated) {
    if (userType === "technician") {
      return <Redirect href="/(tech-app)" />;
    }
    return <Redirect href="/(app)" />;
  }

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="get-started" />
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="Technician/login" />
        <Stack.Screen name="User/login" />
        <Stack.Screen name="User/signup" />
        <Stack.Screen name="Technician/signup" />
        <Stack.Screen name="Technician/signup-step2" />
        <Stack.Screen name="Technician/signup-step3" />
        <Stack.Screen name="Technician/signup-step4" />
        <Stack.Screen name="Technician/signup-step5" />
        <Stack.Screen name="(forgotpassword)" />
      </Stack>
    </SafeAreaView>
  );
}
