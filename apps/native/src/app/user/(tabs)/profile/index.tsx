import { router } from "expo-router";
import { MapPin, PencilLine, ReceiptText } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { useThemeColors } from "@/src/constants/design-tokens";
import ProfileHero from "@/src/features/profile/components/ProfileHero";
import ProfileMetrics, {
	type ProfileMetric,
} from "@/src/features/profile/components/ProfileMetrics";
import ProfileRow from "@/src/features/profile/components/ProfileRow";
import ProfileSection from "@/src/features/profile/components/ProfileSection";
import RewardsSection from "@/src/features/profile/components/RewardsSection";
import { useProfileQuery } from "@/src/features/users/hooks/useProfileQuery";
import { useUserStatsQuery } from "@/src/features/users/hooks/useUserStatsQuery";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";

export default function UserProfileRoute() {
	const { t } = useTranslation("profile");
	const themeColors = useThemeColors();
	const { data: profile, isLoading } = useProfileQuery();
	const { data: stats } = useUserStatsQuery();

	const memberSince = stats?.memberSince
		? t("hero.memberSince", {
				date: new Date(stats.memberSince).toLocaleDateString(undefined, {
					month: "long",
					year: "numeric",
				}),
			})
		: (profile?.email ?? null);

	const metrics: ProfileMetric[] = [
		{
			key: "bookings",
			value: stats?.totalBookings ?? 0,
			label: t("metrics.totalBookings"),
		},
		{
			key: "completed",
			value: stats?.completedBookings ?? 0,
			label: t("metrics.completed"),
		},
		{
			key: "top-category",
			value: stats?.mostBookedCategory?.count ?? "—",
			label: stats?.mostBookedCategory?.name ?? t("metrics.topService"),
		},
	];

	const goToSettings = useDebounce(() => router.push(ROUTES.user.settings));
	const goToEdit = useDebounce(() => router.push(ROUTES.user.profileEdit));
	const goToOrders = useDebounce(() =>
		router.push(ROUTES.user.profileOrderHistory),
	);
	const goToAddresses = useDebounce(() =>
		router.push(ROUTES.user.profileAddresses),
	);

	return (
		<View className="flex-1 bg-surface">
			<ScreenStatusBar variant="blue" />
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="pb-screen-bottom-inset"
			>
				<ProfileHero
					name={profile?.full_name ?? null}
					subtitle={memberSince}
					isLoading={isLoading}
					onOpenSettings={goToSettings}
					settingsLabel={t("actions.openSettings")}
					topColor={themeColors.tint.heroStart}
					metrics={<ProfileMetrics metrics={metrics} onHero />}
				/>

				<ProfileSection title={t("sections.account")} topSeparator={false}>
					<ProfileRow
						icon={PencilLine}
						label={t("menu.editProfile")}
						onPress={goToEdit}
					/>
					<ProfileRow
						icon={ReceiptText}
						label={t("menu.orderHistory")}
						onPress={goToOrders}
					/>
					<ProfileRow
						icon={MapPin}
						label={t("menu.addresses")}
						onPress={goToAddresses}
					/>
				</ProfileSection>

				<RewardsSection />
			</ScrollView>
		</View>
	);
}
