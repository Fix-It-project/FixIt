import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert } from "react-native";
import { useLogoutMutation } from "@/src/features/auth/hooks/useLogoutMutation";
import ProfileContentLayout from "@/src/features/profile/components/ProfileContentLayout";
import ProfileMenuSection from "@/src/features/profile/components/ProfileMenuSection";
import ProfileInfoCard from "@/src/features/tech-self/components/tech/ProfileInfoCard";
import { useTechSelfProfileQuery } from "@/src/features/tech-self/hooks/useTechSelfProfileQuery";
import { useUploadTechProfileImageMutation } from "@/src/features/tech-self/hooks/useUploadTechProfileImageMutation";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { ROUTES } from "@/src/lib/routes";

export default function TechnicianProfileRoute() {
	const { data: profile, isLoading } = useTechSelfProfileQuery();
	const uploadImage = useUploadTechProfileImageMutation();
	const logout = useLogoutMutation();

	const fullName = profile
		? `${profile.first_name} ${profile.last_name}`
		: null;
	const handleEditProfile = useDebounce(() =>
		router.push(ROUTES.technician.profileEdit),
	);
	const handlePastOrders = useDebounce(() =>
		router.push(ROUTES.technician.profileBookingHistory),
	);
	const handleSettings = useDebounce(() =>
		router.push(ROUTES.technician.settings),
	);

	const handleChangePhoto = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			Alert.alert(
				"Permission required",
				"Please allow access to your photo library.",
			);
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
						Alert.alert(
							"Upload failed",
							getErrorMessage(error) || "Something went wrong.",
						),
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
							Alert.alert(
								"Logout failed",
								getErrorMessage(error) || "Something went wrong.",
							),
					}),
			},
		]);
	};

	return (
		<ProfileContentLayout
			name={fullName}
			isLoading={isLoading}
			imageUrl={profile?.profile_image ?? null}
			onChangePhoto={handleChangePhoto}
			bookings={profile?.total_orders ?? 0}
			completed={profile?.completed_orders ?? 0}
		>
			<ProfileInfoCard profile={profile} isLoading={isLoading} />
			<ProfileMenuSection
				onEditProfile={handleEditProfile}
				onPastOrders={handlePastOrders}
				onSettings={handleSettings}
				onLogout={handleLogout}
				isLoggingOut={logout.isPending}
			/>
		</ProfileContentLayout>
	);
}
