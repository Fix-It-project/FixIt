import { Tabs } from "expo-router";
import { Bell, Briefcase, type LucideProps, User } from "lucide-react-native";
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
function TechJobsTabIcon({
	color,
	size,
	focused,
}: Readonly<LucideTabIconProps>) {
	return (
		<Briefcase
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
	const { data: unreadCount } = useNotificationUnreadCountQuery("technician");
	const hasUnread = (unreadCount ?? 0) > 0;

	// Top-inset color is driven per-screen via the chrome store (ScreenStatusBar),
	// so it always blends with the focused page — no pathname mapping here.
	return (
		<ProtectedTabsLayout
			allowedUserType="technician"
			unauthenticatedRedirect={ROUTES.auth.welcome}
			wrongRoleRedirect={ROUTES.user.home}
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
				name="jobs/index"
				options={{
					title: "Jobs",
					tabBarIcon: TechJobsTabIcon,
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
			{/* Wallet is parked off the footer until the Profile revamp folds it in. */}
			<Tabs.Screen
				name="wallet/index"
				options={{
					href: null,
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
