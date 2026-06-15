import { Tabs, usePathname } from "expo-router";
import { Bell, type LucideProps, User, Wallet } from "lucide-react-native";
import { View } from "react-native";
import {
	CalendarDaysTabIcon,
	HouseTabIcon,
} from "@/src/components/icons/FilledTabIcons";
import { ProtectedTabsLayout } from "@/src/components/navigation/ProtectedTabsLayout";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";
import { useNotificationUnreadCountQuery } from "@/src/features/notifications/hooks/useNotificationUnreadCountQuery";
import { ROUTES } from "@/src/lib/navigation";

type LucideTabIconProps = LucideProps & { focused?: boolean };
type NotificationTabIconProps = LucideTabIconProps & { hasUnread: boolean };

// Active tab icons fill with the active tint (blue); inactive stay outlined.
// Home + Schedule use custom split-path glyphs so the interior detail (house door,
// calendar day dots) cuts out to the tab-bar background (surfaceBase) when focused
// — see the inline tabBarIcon renders below, which supply detailColor.
function TechWalletTabIcon({
	color,
	size,
	focused,
}: Readonly<LucideTabIconProps>) {
	return (
		<Wallet
			size={size}
			color={color}
			strokeWidth={1.8}
			fill={focused ? color : "transparent"}
		/>
	);
}

function TechProfileTabIcon({
	color,
	size,
	focused,
}: Readonly<LucideTabIconProps>) {
	return (
		<User
			size={size}
			color={color}
			strokeWidth={1.8}
			fill={focused ? color : "transparent"}
		/>
	);
}

function TechNotificationTabIcon({
	color,
	size,
	focused,
	hasUnread,
}: Readonly<NotificationTabIconProps>) {
	return (
		<View className="items-center justify-center">
			<Bell
				size={size}
				color={color}
				strokeWidth={1.8}
				fill={focused ? color : "transparent"}
			/>
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
					tabBarIcon: ({ color, size, focused }) => (
						<HouseTabIcon
							color={color}
							size={size}
							focused={focused}
							detailColor={themeColors.surfaceBase}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="schedule/index"
				options={{
					title: "Schedule",
					tabBarIcon: ({ color, size, focused }) => (
						<CalendarDaysTabIcon
							color={color}
							size={size}
							focused={focused}
							detailColor={themeColors.surfaceBase}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="notifications/index"
				options={{
					title: "Notifications",
					tabBarIcon: ({ color, size, focused }) => (
						<TechNotificationTabIcon
							color={color}
							size={size}
							focused={focused}
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
