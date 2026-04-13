import { View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLogoutMutation } from "@/src/hooks/auth/useLogoutMutation";
import { useProfileQuery } from "@/src/hooks/user/useProfileQuery";
import { useUserOrdersQuery } from "@/src/hooks/orders/useUserOrders";
import ProfileHeader from "@/src/components/profile/ProfileHeader";
import ProfileStatsSection from "@/src/components/profile/ProfileStatsSection";
import ProfileInfoCard from "@/src/components/profile/ProfileInfoCard";
import ProfileMenuSection from "@/src/components/profile/ProfileMenuSection";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";

export default function UserProfileScreen() {
  const { data: profile, isLoading } = useProfileQuery();
  const { data: orders = [] } = useUserOrdersQuery();
  const totalBookings = orders.length;
  const completedBookings = orders.filter((o) => o.status === "completed").length;
  const logout = useLogoutMutation();

  const handleEditProfile = useDebounce(() => router.push(ROUTES.user.profileEdit));
  const handlePastOrders = useDebounce(() => router.push(ROUTES.user.profileOrderHistory));
  const handleSettings = useDebounce(() => router.push(ROUTES.user.settings));

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
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-10"
        >
          <ProfileHeader name={profile?.full_name ?? null} isLoading={isLoading} />
          <ProfileStatsSection bookings={totalBookings} completed={completedBookings} />
          <ProfileInfoCard profile={profile} isLoading={isLoading} />
          <ProfileMenuSection
            onEditProfile={handleEditProfile}
            onPastOrders={handlePastOrders}
            onSettings={handleSettings}
            onLogout={handleLogout}
            isLoggingOut={logout.isPending}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
