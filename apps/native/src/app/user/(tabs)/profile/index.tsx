import { Alert } from "react-native";
import { router } from "expo-router";
import ProfileContentLayout from "@/src/features/profile/components/ProfileContentLayout";
import ProfileMenuSection from "@/src/features/profile/components/ProfileMenuSection";
import ProfileInfoCard from "@/src/features/users/components/user/ProfileInfoCard";
import { useLogoutMutation } from "@/src/features/auth/hooks/useLogoutMutation";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useUserOrdersQuery } from "@/src/features/booking-orders/hooks/useUserOrders";
import { useProfileQuery } from "@/src/features/users/hooks/useProfileQuery";
import { ROUTES } from "@/src/lib/routes";

export default function UserProfileRoute() {
  const { data: profile, isLoading } = useProfileQuery();
  const { data: orders = [] } = useUserOrdersQuery();
  const logout = useLogoutMutation();

  const totalBookings = orders.length;
  const completedBookings = orders.filter((order) => order.status === "completed").length;

  const handleEditProfile = useDebounce(() => router.push(ROUTES.user.profileEdit));
  const handlePastOrders = useDebounce(() => router.push(ROUTES.user.profileOrderHistory));
  const handleSettings = useDebounce(() => router.push(ROUTES.user.settings));
  const handleAddresses = useDebounce(() => router.push(ROUTES.user.profileAddressNew));

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () =>
          logout.mutate(undefined, {
            onError: (error) =>
              Alert.alert("Logout failed", error.message || "Something went wrong."),
          }),
      },
    ]);
  };

  return (
    <ProfileContentLayout
      name={profile?.full_name ?? null}
      isLoading={isLoading}
      bookings={totalBookings}
      completed={completedBookings}
    >
      <ProfileInfoCard profile={profile} isLoading={isLoading} />
      <ProfileMenuSection
        onEditProfile={handleEditProfile}
        onPastOrders={handlePastOrders}
        onAddresses={handleAddresses}
        onSettings={handleSettings}
        onLogout={handleLogout}
        isLoggingOut={logout.isPending}
      />
    </ProfileContentLayout>
  );
}
