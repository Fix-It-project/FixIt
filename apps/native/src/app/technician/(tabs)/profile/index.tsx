import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { MapPin, PencilLine, ReceiptText, Wrench } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import ProfileHero from "@/src/features/profile/components/ProfileHero";
import ProfileMetrics, {
	type ProfileMetric,
} from "@/src/features/profile/components/ProfileMetrics";
import ProfileRow from "@/src/features/profile/components/ProfileRow";
import ProfileSection from "@/src/features/profile/components/ProfileSection";
import RewardsSection from "@/src/features/profile/components/RewardsSection";
import EarningsAreaChart from "@/src/features/tech-self/components/EarningsAreaChart";
import RatingSheet from "@/src/features/tech-self/components/RatingSheet";
import { useTechSelfProfileQuery } from "@/src/features/tech-self/hooks/useTechSelfProfileQuery";
import { useTechWalletQuery } from "@/src/features/tech-self/hooks/useTechWalletQuery";
import { useUploadTechProfileImageMutation } from "@/src/features/tech-self/hooks/useUploadTechProfileImageMutation";
import { useDebounce } from "@/src/hooks/useDebounce";
import { formatEgp } from "@/src/lib/currency";
import { showError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";
import { ROUTES } from "@/src/lib/navigation";

export default function TechnicianProfileRoute() {
	const { t } = useTranslation("profile");
	const themeColors = useThemeColors();
	const { data: profile, isLoading } = useTechSelfProfileQuery();
	const { data: wallet } = useTechWalletQuery();
	const uploadImage = useUploadTechProfileImageMutation();
	const [ratingOpen, setRatingOpen] = useState(false);

	const fullName = profile
		? `${profile.first_name} ${profile.last_name}`
		: null;

	const metrics: ProfileMetric[] = [
		{
			key: "orders",
			value: profile?.total_orders ?? 0,
			label: t("metrics.totalOrders"),
		},
		{
			key: "completed",
			value: profile?.completed_orders ?? 0,
			label: t("metrics.completed"),
		},
		{
			key: "rating",
			value: profile?.avg_rating != null ? profile.avg_rating.toFixed(1) : "—",
			label: t("metrics.rating"),
			onPress: () => setRatingOpen(true),
		},
	];

	const goToSettings = useDebounce(() =>
		router.push(ROUTES.technician.settings),
	);
	const goToEdit = useDebounce(() =>
		router.push(ROUTES.technician.profileEdit),
	);
	const goToBookings = useDebounce(() =>
		router.push(ROUTES.technician.profileBookingHistory),
	);
	const goToServiceLocation = useDebounce(() =>
		router.push(ROUTES.technician.settingsAddress),
	);
	const goToServices = useDebounce(() =>
		router.push(ROUTES.technician.settingsServices),
	);

	const handleChangePhoto = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			Toast.show({
				type: "info",
				text1: t("avatar.permissionTitle"),
				text2: t("avatar.permissionBody"),
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

	return (
		<View className="flex-1 bg-surface">
			<ScreenStatusBar variant="blue" />
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="pb-screen-bottom-inset"
			>
				<ProfileHero
					name={fullName}
					subtitle={profile?.category_name ?? null}
					isLoading={isLoading}
					imageUrl={profile?.profile_image ?? null}
					onChangePhoto={handleChangePhoto}
					onOpenSettings={goToSettings}
					settingsLabel={t("actions.openSettings")}
					topColor={themeColors.primaryDark}
					metrics={<ProfileMetrics metrics={metrics} onHero />}
				>
					{profile?.description ? (
						<Text
							variant="caption"
							className="mt-stack-xs"
							style={{ color: themeColors.overlayBright }}
							numberOfLines={2}
						>
							{profile.description}
						</Text>
					) : null}
				</ProfileHero>

				<ProfileSection title={t("sections.earnings")} topSeparator={false}>
					<View className="px-screen-x pb-stack-md">
						<Text variant="caption" className="text-content-muted">
							{t("earnings.totalEarned")}
						</Text>
						<Text variant="h2" className="mt-stack-xs font-bold text-content">
							{formatEgp(wallet?.lifetimeEarnings ?? 0)}
						</Text>
					</View>
					<EarningsAreaChart last30={wallet?.last30 ?? []} />
				</ProfileSection>

				<ProfileSection title={t("sections.work")}>
					<ProfileRow
						icon={MapPin}
						label={t("menu.serviceLocation")}
						onPress={goToServiceLocation}
					/>
					<ProfileRow
						icon={Wrench}
						label={t("menu.services")}
						onPress={goToServices}
					/>
				</ProfileSection>

				<ProfileSection title={t("sections.account")}>
					<ProfileRow
						icon={PencilLine}
						label={t("menu.editProfile")}
						onPress={goToEdit}
					/>
					<ProfileRow
						icon={ReceiptText}
						label={t("menu.orderHistory")}
						onPress={goToBookings}
					/>
				</ProfileSection>

				<RewardsSection />
			</ScrollView>

			<RatingSheet visible={ratingOpen} onClose={() => setRatingOpen(false)} />
		</View>
	);
}
