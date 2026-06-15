import { router, Tabs, usePathname } from "expo-router";
import {
	Bell,
	type LucideProps,
	MessageCircle,
	User,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Platform, useWindowDimensions, View } from "react-native";
import {
	ClipboardListTabIcon,
	HouseTabIcon,
} from "@/src/components/icons/FilledTabIcons";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import {
	getBaseTabScreenOptions,
	NARROW_TAB_BAR_HEIGHT,
	NARROW_TAB_BAR_WIDTH,
	useBottomTabMetrics,
} from "@/src/components/layout/tab-bar";
import { Button } from "@/src/components/ui/button";
import {
	Colors,
	elevation,
	shadowStyle,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import { useNotificationUnreadCountQuery } from "@/src/features/notifications/hooks/useNotificationUnreadCountQuery";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";

interface ChatFabProps {
	readonly bottom: number;
	readonly onPress: () => void;
	readonly primaryColor: string;
	readonly surfaceColor: string;
	readonly accessibilityLabel: string;
}

// Active tab icons fill with the active tint (blue); inactive stay outlined.
// Home + Orders use custom split-path glyphs so the interior detail (house door,
// list rows + dots) cuts out to the tab-bar background (surfaceBase) when focused
// — see the inline tabBarIcon renders below, which supply detailColor.
function ProfileTabIcon({
	color,
	size,
	focused,
}: Readonly<LucideProps & { focused?: boolean }>) {
	return (
		<User
			size={size}
			color={color}
			strokeWidth={1.8}
			fill={focused ? color : "transparent"}
		/>
	);
}

function NotificationTabIcon({
	color,
	size,
	focused,
	hasUnread,
}: Readonly<LucideProps & { focused?: boolean; hasUnread: boolean }>) {
	return (
		<View>
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

function ChatFab({
	bottom,
	onPress,
	primaryColor,
	surfaceColor,
	accessibilityLabel,
}: ChatFabProps) {
	return (
		<Button
			variant="primary"
			size="icon"
			onPress={onPress}
			accessibilityLabel={accessibilityLabel}
			style={{
				position: "absolute",
				right: spacing.screen.paddingX,
				bottom,
				...shadowStyle(elevation.header, {
					shadowColor: primaryColor,
					opacity: Platform.OS === "ios" ? 0.35 : 0,
					android: Platform.OS === "android" ? 6 : 0,
					radius: Platform.OS === "ios" ? 10 : 0,
				}),
			}}
		>
			<MessageCircle size={26} color={surfaceColor} strokeWidth={1.8} />
		</Button>
	);
}

export default function UserTabsLayout() {
	const { t } = useTranslation("common");
	const themeColors = useThemeColors();
	const metrics = useBottomTabMetrics();
	const { width, height } = useWindowDimensions();
	const pathname = usePathname();
	const goToChatbot = useDebounce(() => router.push(ROUTES.user.chat));
	const { data: unreadCount } = useNotificationUnreadCountQuery("user");
	const hasUnread = (unreadCount ?? 0) > 0;
	const screenOptions = getBaseTabScreenOptions(themeColors, metrics, {
		showLabels:
			width >= NARROW_TAB_BAR_WIDTH && height >= NARROW_TAB_BAR_HEIGHT,
	});
	const topSafeAreaBackground =
		pathname === ROUTES.user.home
			? themeColors.tint.heroStart
			: themeColors.surfaceElevated;

	return (
		<ScreenSafeAreaView
			className="flex-1"
			edges={["top"]}
			style={{ backgroundColor: topSafeAreaBackground }}
		>
			<View className="flex-1 bg-surface">
				<Tabs screenOptions={screenOptions}>
					<Tabs.Screen
						name="index"
						options={{
							title: t("tabs.home"),
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
						name="notifications/index"
						options={{
							title: t("tabs.notifications"),
							tabBarIcon: ({ color, size, focused }) => (
								<NotificationTabIcon
									color={color}
									size={size}
									focused={focused}
									hasUnread={hasUnread}
								/>
							),
						}}
					/>
					<Tabs.Screen
						name="orders/index"
						options={{
							title: t("tabs.orders"),
							tabBarIcon: ({ color, size, focused }) => (
								<ClipboardListTabIcon
									color={color}
									size={size}
									focused={focused}
									detailColor={themeColors.surfaceBase}
								/>
							),
						}}
					/>
					<Tabs.Screen
						name="profile/index"
						options={{
							title: t("tabs.profile"),
							tabBarIcon: ProfileTabIcon,
						}}
					/>
				</Tabs>
				<ChatFab
					onPress={goToChatbot}
					bottom={metrics.tabBarHeight + spacing.stack.md}
					primaryColor={themeColors.primary}
					surfaceColor={themeColors.surfaceOnPrimary}
					accessibilityLabel={t("tabs.openChat")}
				/>
			</View>
		</ScreenSafeAreaView>
	);
}
