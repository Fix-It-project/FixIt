import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/stores/auth-store";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (!isLoading && isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
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
  );
}
