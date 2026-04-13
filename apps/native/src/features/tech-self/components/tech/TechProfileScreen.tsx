import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useDebounce } from "@/src/hooks/useDebounce";
import * as ImagePicker from "expo-image-picker";
import { useLogoutMutation } from "@/src/hooks/auth/useLogoutMutation";
import { useTechSelfProfileQuery } from "@/src/hooks/tech/useTechSelfProfileQuery";
import { useUploadTechProfileImageMutation } from "@/src/hooks/tech/useUploadTechProfileImageMutation";
import ProfileHeader from "@/src/components/profile/ProfileHeader";
import ProfileStatsSection from "@/src/components/profile/ProfileStatsSection";
import ProfileMenuSection from "@/src/components/profile/ProfileMenuSection";
import ProfileInfoCard from "@/src/features/tech-self/components/tech/ProfileInfoCard";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { ROUTES } from "@/src/lib/routes";

export default function TechProfileScreen() {
  const { data: profile, isLoading } = useTechSelfProfileQuery();
  const uploadImage = useUploadTechProfileImageMutation();
  const logout = useLogoutMutation();

  const handleChangePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      uploadImage.mutate(
        { imageUri: asset.uri, mimeType: asset.mimeType ?? "image/jpeg" },
        {
          onError: (error) =>
            Alert.alert("Upload failed", getErrorMessage(error) || "Something went wrong."),
        },
      );
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () =>
          logout.mutate(undefined, {
            onError: (error) =>
              Alert.alert("Logout failed", getErrorMessage(error) || "Something went wrong."),
          }),
      },
    ]);
  };

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : null;
  const handleEditProfile = useDebounce(() => router.push(ROUTES.technician.profileEdit));
  const handlePastOrders = useDebounce(() => router.push(ROUTES.technician.profileBookingHistory));
  const handleSettings = useDebounce(() => router.push(ROUTES.technician.settings));

  return (
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-10"
        >
          <ProfileHeader
            name={fullName}
            isLoading={isLoading}
            imageUrl={profile?.profile_image ?? null}
            onChangePhoto={handleChangePhoto}
          />
          <ProfileStatsSection
            bookings={profile?.total_orders ?? 0}
            completed={profile?.completed_orders ?? 0}
          />
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
