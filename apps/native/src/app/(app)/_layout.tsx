import { Redirect, Stack } from "expo-router";
import {
  AUTH_GET_STARTED_ROUTE,
  TECH_ROOT_ROUTE,
} from "@/src/lib/navigation-routes";
import { useAuthStore } from "@/src/stores/auth-store";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const userType = useAuthStore((state) => state.userType);

  if (!isLoading && !isAuthenticated) {
    return <Redirect href={AUTH_GET_STARTED_ROUTE} />;
  }

  if (!isLoading && isAuthenticated && userType !== "user") {
    return <Redirect href={TECH_ROOT_ROUTE} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
