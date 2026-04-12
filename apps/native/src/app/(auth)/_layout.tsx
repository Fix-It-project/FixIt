import { Redirect, Stack } from "expo-router";
import { APP_ROOT_ROUTE, TECH_ROOT_ROUTE } from "@/src/lib/navigation-routes";
import { useAuthStore } from "@/src/stores/auth-store";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const userType = useAuthStore((state) => state.userType);

  if (!isLoading && isAuthenticated) {
    if (userType === "technician") {
      return <Redirect href={TECH_ROOT_ROUTE} />;
    }
    return <Redirect href={APP_ROOT_ROUTE} />;
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
