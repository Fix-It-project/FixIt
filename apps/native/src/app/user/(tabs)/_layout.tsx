import { Tabs } from "expo-router";
import { Bell, type LucideProps, User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
	type ColorValue,
	Image,
	useWindowDimensions,
	View,
} from "react-native";
import {
	ClipboardListTabIcon,
	HouseTabIcon,
} from "@/src/components/icons/FilledTabIcons";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { useScreenChromeStore } from "@/src/components/layout/screen-chrome-store";
import {
	getBaseTabScreenOptions,
	NARROW_TAB_BAR_HEIGHT,
	NARROW_TAB_BAR_WIDTH,
	useBottomTabMetrics,
} from "@/src/components/layout/tab-bar";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";
import { useNotificationUnreadCountQuery } from "@/src/features/notifications/hooks/useNotificationUnreadCountQuery";

// Idle = the flat FXT wordmark tinted to the icon color (no badge), like the
// other outlined tab icons. Focused = the real blue rounded-square FixIt badge
// (white FXT) — a small square over the slot, mirroring Grok's active icon.
const fxtGlyph = require("@/src/assets/onboarding/fxt.png");
const fxtBadge = require("@/src/assets/images/fixit.png");

function FxtTabIcon({
	focused,
	tint,
}: Readonly<{ focused: boolean; tint: ColorValue }>) {
	if (focused) {
		return (
			<Image
				source={fxtBadge}
				resizeMode="contain"
				style={{ width: 34, height: 34 }}
			/>
		);
	}
	return (
		<Image
			source={fxtGlyph}
			resizeMode="contain"
			style={{ width: 40, height: 26, tintColor: tint }}
		/>
	);
}

// Active tab icons fill with the active tint (blue); inactive stay outlined.
// Home + Activity use custom split-path glyphs so the interior detail (house
// door, list rows + dots) cuts out to the tab-bar background (surfaceBase) when
// focused — see the inline tabBarIcon renders below, which supply detailColor.
// The center chat tab is the exception: see FxtTabIcon above — idle FXT glyph,
// focused swaps to the blue rounded-square FixIt badge.
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

export default function UserTabsLayout() {
	const { t } = useTranslation("common");
	const themeColors = useThemeColors();
	const metrics = useBottomTabMetrics();
	const { width, height } = useWindowDimensions();
	const { data: unreadCount } = useNotificationUnreadCountQuery("user");
	const hasUnread = (unreadCount ?? 0) > 0;
	const screenOptions = getBaseTabScreenOptions(themeColors, metrics, {
		showLabels:
			width >= NARROW_TAB_BAR_WIDTH && height >= NARROW_TAB_BAR_HEIGHT,
	});
	// Top inset blends with the focused screen: each screen publishes a chrome
	// variant via ScreenStatusBar; we resolve it to a live theme color here so it
	// re-renders across light/dark. The user side's `blue` band is heroStart (the
	// home + profile hero color); everything else sits on the elevated surface.
	const topVariant = useScreenChromeStore((s) => s.topVariant);
	const topSafeAreaBackground =
		topVariant === "blue"
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
						name="activity/index"
						options={{
							title: t("tabs.activity"),
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
						name="chat/index"
						options={{
							title: t("tabs.chat"),
							tabBarIcon: ({ focused, color }) => (
								<FxtTabIcon focused={focused} tint={color} />
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
						name="profile/index"
						options={{
							title: t("tabs.profile"),
							tabBarIcon: ProfileTabIcon,
						}}
					/>
				</Tabs>
			</View>
		</ScreenSafeAreaView>
	);
}
