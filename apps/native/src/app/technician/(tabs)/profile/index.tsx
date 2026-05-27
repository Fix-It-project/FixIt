import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { confirm } from "@/src/components/ui/dialog";
import { useLogoutMutation } from "@/src/features/auth/hooks/useLogoutMutation";
import ProfileContentLayout from "@/src/features/profile/components/ProfileContentLayout";
import ProfileMenuSection from "@/src/features/profile/components/ProfileMenuSection";
import ProfileInfoCard from "@/src/features/tech-self/components/tech/ProfileInfoCard";
import { useTechSelfProfileQuery } from "@/src/features/tech-self/hooks/useTechSelfProfileQuery";
import { useUploadTechProfileImageMutation } from "@/src/features/tech-self/hooks/useUploadTechProfileImageMutation";
import { useDebounce } from "@/src/hooks/useDebounce";
import { showError } from "@/src/lib/errors/show-error";
import { logger } from "@/src/lib/logger";
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
			logger.info("profile", "technician_photo_permission_denied");
			Toast.show({
				type: "info",
				text1: "Permission required",
				text2: "Please allow access to your photo library.",
			});
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
					onError: (error) => {
						logger.error("profile", "technician_photo_upload_failed", error);
						showError(error);
					},
				},
			);
		}
	};

	const handleLogout = async () => {
		const ok = await confirm({
			title: "Log out",
			description: "Are you sure you want to log out?",
			primary: { label: "Log out", destructive: true },
			secondary: { label: "Cancel" },
		});
		if (ok) {
			logout.mutate(undefined, {
				onError: (error) => {
					logger.error("auth", "technician_logout_failed", error);
					showError(error);
				},
			});
		}
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
