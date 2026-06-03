import { Tabs, usePathname } from "expo-router";
import {
	Bell,
	CalendarDays,
	House,
	type LucideProps,
	User,
	Wallet,
} from "lucide-react-native";
import { View } from "react-native";
import { ProtectedTabsLayout } from "@/src/components/navigation/ProtectedTabsLayout";
import { Colors } from "@/src/constants/design-tokens";
import { useNotificationUnreadCountQuery } from "@/src/features/notifications/hooks/useNotificationUnreadCountQuery";
import { ROUTES } from "@/src/lib/navigation";
import { useThemeColors } from "@/src/constants/design-tokens";

type NotificationTabIconProps = LucideProps & { hasUnread: boolean };

function TechHomeTabIcon({ color, size }: Readonly<LucideProps>) {
	return <House size={size} color={color} strokeWidth={1.8} />;
}

function TechScheduleTabIcon({ color, size }: Readonly<LucideProps>) {
	return <CalendarDays size={size} color={color} strokeWidth={1.8} />;
}

function TechWalletTabIcon({ color, size }: Readonly<LucideProps>) {
	return <Wallet size={size} color={color} strokeWidth={1.8} />;
}

function TechProfileTabIcon({ color, size }: Readonly<LucideProps>) {
	return <User size={size} color={color} strokeWidth={1.8} />;
}

function TechNotificationTabIcon({
	color,
	size,
	hasUnread,
}: Readonly<NotificationTabIconProps>) {
	return (
		<View
			className="items-center justify-center"
		>
			<Bell size={size} color={color} strokeWidth={1.8} />
			{hasUnread ? (
				<View
					className="absolute -top-1 -right-1 h-status-dot-sm w-status-dot-sm rounded-pill"
					style={{ backgroundColor: Colors.danger }}
				/>
			) : null}
		</View>
	);
}

export default function TechAppTabsLayout() {
	const themeColors = useThemeColors();
	const pathname = usePathname();
	const { data: unreadCount } = useNotificationUnreadCountQuery("technician");
	const hasUnread = (unreadCount ?? 0) > 0;
	const topSafeAreaBackground =
		pathname === ROUTES.technician.home ||
		pathname === ROUTES.technician.schedule
			? themeColors.primaryDark
			: themeColors.surfaceElevated;

	return (
		<ProtectedTabsLayout
			allowedUserType="technician"
			unauthenticatedRedirect={ROUTES.auth.welcome}
			wrongRoleRedirect={ROUTES.user.home}
			topSafeAreaBackgroundColor={topSafeAreaBackground}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: TechHomeTabIcon,
				}}
			/>
			<Tabs.Screen
				name="schedule/index"
				options={{
					title: "Schedule",
					tabBarIcon: TechScheduleTabIcon,
				}}
			/>
			<Tabs.Screen
				name="notifications/index"
				options={{
					title: "Notifications",
					tabBarIcon: ({ color, size }) => (
						<TechNotificationTabIcon
							color={color}
							size={size}
							hasUnread={hasUnread}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="wallet/index"
				options={{
					title: "Wallet",
					tabBarIcon: TechWalletTabIcon,
				}}
			/>
			<Tabs.Screen
				name="profile/index"
				options={{
					title: "My Profile",
					tabBarIcon: TechProfileTabIcon,
				}}
			/>
			<Tabs.Screen
				name="chat/index"
				options={{
					href: null,
				}}
			/>
		</ProtectedTabsLayout>
	);
}
