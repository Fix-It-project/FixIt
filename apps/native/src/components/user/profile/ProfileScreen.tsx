import { View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLogoutMutation } from "@/src/hooks/auth/useLogoutMutation";
import { useProfileQuery } from "@/src/hooks/user/useProfileQuery";
import ProfileHeader from "@/src/components/shared/profile/ProfileHeader";
import ProfileStatsSection from "@/src/components/shared/profile/ProfileStatsSection";
import ProfileInfoCard from "@/src/components/shared/profile/ProfileInfoCard";
import ProfileMenuSection from "@/src/components/shared/profile/ProfileMenuSection";

// ─── Mock stats (replace with real query when backend is ready) ───────────────
const MOCK_STATS = { bookings: 12, completed: 8 } as const;

export default function ProfileScreen() {
  const { data: profile, isLoading } = useProfileQuery();
  const logout = useLogoutMutation();

  const handleEditProfile = () => router.push("/(app)/(profile)/edit-profile");
  const handlePastOrders = () => router.push("/(app)/(profile)/past-orders");
  const handleSettings = () => router.push("/settings");

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
    <View className="flex-1 bg-surface-gray">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-10"
        >
          <ProfileHeader name={profile?.full_name ?? null} isLoading={isLoading} />
          <ProfileStatsSection bookings={MOCK_STATS.bookings} completed={MOCK_STATS.completed} />
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

