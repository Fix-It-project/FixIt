import { router, Tabs, usePathname } from "expo-router";
import {
	Bell,
	ClipboardList,
	Grid2X2,
	House,
	type LucideProps,
	MessageCircle,
	User,
} from "lucide-react-native";
import {
	Platform,
	useWindowDimensions,
	View,
} from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Button } from "@/src/components/ui/button";
import { useDebounce } from "@/src/hooks/useDebounce";
import {
	elevation,
	shadowStyle,
	spacing,
} from "@/src/constants/design-tokens";
import { Colors } from "@/src/constants/design-tokens";
import { useNotificationUnreadCountQuery } from "@/src/features/notifications/hooks/useNotificationUnreadCountQuery";
import { ROUTES } from "@/src/lib/navigation";
import {
	getBaseTabScreenOptions,
	NARROW_TAB_BAR_WIDTH,
	useBottomTabMetrics,
} from "@/src/components/layout/tab-bar";
import { useThemeColors } from "@/src/constants/design-tokens";


interface ChatFabProps {
	readonly bottom: number;
	readonly onPress: () => void;
	readonly primaryColor: string;
	readonly surfaceColor: string;
}

function HomeTabIcon({ color, size }: Readonly<LucideProps>) {
	return <House size={size} color={color} strokeWidth={1.8} />;
}

function CategoriesTabIcon({ color, size }: Readonly<LucideProps>) {
	return <Grid2X2 size={size} color={color} strokeWidth={1.8} />;
}

function OrdersTabIcon({ color, size }: Readonly<LucideProps>) {
	return <ClipboardList size={size} color={color} strokeWidth={1.8} />;
}

function ProfileTabIcon({ color, size }: Readonly<LucideProps>) {
	return <User size={size} color={color} strokeWidth={1.8} />;
}

function NotificationTabIcon({
	color,
	size,
	hasUnread,
}: Readonly<LucideProps & { hasUnread: boolean }>) {
	return (
		<View>
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

function ChatFab({
	bottom,
	onPress,
	primaryColor,
	surfaceColor,
}: ChatFabProps) {
	return (
		<Button
			variant="primary"
			size="icon"
			onPress={onPress}
			accessibilityLabel="Open AI chat"
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
	const themeColors = useThemeColors();
	const metrics = useBottomTabMetrics();
	const { width } = useWindowDimensions();
	const pathname = usePathname();
	const goToChatbot = useDebounce(() => router.push(ROUTES.user.chat));
	const { data: unreadCount } = useNotificationUnreadCountQuery("user");
	const hasUnread = (unreadCount ?? 0) > 0;
	const screenOptions = getBaseTabScreenOptions(themeColors, metrics, {
		showLabels: width >= NARROW_TAB_BAR_WIDTH,
	});
	const topSafeAreaBackground =
		pathname === ROUTES.user.home
			? themeColors.primary
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
							title: "Home",
							tabBarIcon: HomeTabIcon,
						}}
					/>
					<Tabs.Screen
						name="categories/index"
						options={{
							title: "Categories",
							tabBarIcon: CategoriesTabIcon,
						}}
					/>
					<Tabs.Screen
						name="notifications/index"
						options={{
							title: "Notifications",
							tabBarIcon: ({ color, size }) => (
								<NotificationTabIcon
									color={color}
									size={size}
									hasUnread={hasUnread}
								/>
							),
						}}
					/>
					<Tabs.Screen
						name="orders/index"
						options={{
							title: "My Orders",
							tabBarIcon: OrdersTabIcon,
						}}
					/>
					<Tabs.Screen
						name="profile/index"
						options={{
							title: "My Profile",
							tabBarIcon: ProfileTabIcon,
						}}
					/>
				</Tabs>
				<ChatFab
					onPress={goToChatbot}
					bottom={metrics.tabBarHeight + spacing.stack.md}
					primaryColor={themeColors.primary}
					surfaceColor={themeColors.surfaceOnPrimary}
				/>
			</View>
		</ScreenSafeAreaView>
	);
}
