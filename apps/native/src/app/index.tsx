import { Redirect } from "expo-router";
import { ROUTES } from "@/src/lib/routes";
import { useAuthStore } from "@/src/stores/auth-store";

export default function RootIndex() {
  const { isAuthenticated, userType, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.auth.welcome} />;
  }

  if (userType === "technician") {
    return <Redirect href={ROUTES.technician.home} />;
  }

  return <Redirect href={ROUTES.user.home} />;
}
