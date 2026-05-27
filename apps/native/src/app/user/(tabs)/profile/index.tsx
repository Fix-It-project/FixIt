import { router } from "expo-router";
import { confirm } from "@/src/components/ui/dialog";
import { useLogoutMutation } from "@/src/features/auth/hooks/useLogoutMutation";
import { useUserOrdersQuery } from "@/src/features/booking-orders/hooks/useUserOrders";
import ProfileContentLayout from "@/src/features/profile/components/ProfileContentLayout";
import ProfileMenuSection from "@/src/features/profile/components/ProfileMenuSection";
import ProfileInfoCard from "@/src/features/users/components/user/ProfileInfoCard";
import { useProfileQuery } from "@/src/features/users/hooks/useProfileQuery";
import { useDebounce } from "@/src/hooks/useDebounce";
import { showError } from "@/src/lib/errors/show-error";
import { ROUTES } from "@/src/lib/routes";

export default function UserProfileRoute() {
	const { data: profile, isLoading } = useProfileQuery();
	const { data: orders = [] } = useUserOrdersQuery();
	const logout = useLogoutMutation();

	const totalBookings = orders.length;
	const completedBookings = orders.filter(
		(order) => order.status === "completed",
	).length;

	const handleEditProfile = useDebounce(() =>
		router.push(ROUTES.user.profileEdit),
	);
	const handlePastOrders = useDebounce(() =>
		router.push(ROUTES.user.profileOrderHistory),
	);
	const handleSettings = useDebounce(() => router.push(ROUTES.user.settings));
	const handleAddresses = useDebounce(() =>
		router.push(ROUTES.user.profileAddressNew),
	);

	const handleLogout = async () => {
		const ok = await confirm({
			title: "Log out",
			description: "Are you sure you want to log out?",
			primary: { label: "Log out", destructive: true },
			secondary: { label: "Cancel" },
		});
		if (ok) {
			logout.mutate(undefined, {
				onError: (error) => showError(error),
			});
		}
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
