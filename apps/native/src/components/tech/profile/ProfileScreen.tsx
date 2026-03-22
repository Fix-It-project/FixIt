import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useLogoutMutation } from "@/src/hooks/auth/useLogoutMutation";
import { useTechSelfProfileQuery } from "@/src/hooks/tech/useTechSelfProfileQuery";
import { useUploadTechProfileImageMutation } from "@/src/hooks/tech/useUploadTechProfileImageMutation";
import ProfileHeader from "@/src/components/shared/profile/ProfileHeader";
import ProfileStatsSection from "@/src/components/shared/profile/ProfileStatsSection";
import ProfileMenuSection from "@/src/components/shared/profile/ProfileMenuSection";
import TechProfileInfoCard from "@/src/components/tech/profile/TechProfileInfoCard";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";

export default function ProfileScreen() {
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

  return (
    <View className="flex-1 bg-surface-gray">
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
          <TechProfileInfoCard profile={profile} isLoading={isLoading} />
          <ProfileMenuSection
            onEditProfile={() => router.push("/(tech-app)/(profile)/edit-profile")}
            onSettings={() => router.push("/settings")}
            onLogout={handleLogout}
            isLoggingOut={logout.isPending}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
