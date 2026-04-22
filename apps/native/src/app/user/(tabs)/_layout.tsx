import { router, Tabs } from "expo-router";
import {
	ClipboardList,
	Grid2X2,
	House,
	type LucideProps,
	MessageCircle,
	User,
} from "lucide-react-native";
import { Platform, TouchableOpacity } from "react-native";
import { ProtectedTabsLayout } from "@/src/components/navigation/ProtectedTabsLayout";
import { useDebounce } from "@/src/hooks/useDebounce";
import { elevation, shadowStyle } from "@/src/lib/design-tokens";
import { ROUTES } from "@/src/lib/routes";
import { useBottomTabMetrics } from "@/src/lib/tab-bar-config";
import { useThemeColors } from "@/src/lib/theme";

const CHAT_FAB_SIZE = 56;

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

function ChatFab({
	bottom,
	onPress,
	primaryColor,
	surfaceColor,
}: ChatFabProps) {
	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.85}
			style={{
				position: "absolute",
				right: 20,
				bottom,
				width: CHAT_FAB_SIZE,
				height: CHAT_FAB_SIZE,
				borderRadius: CHAT_FAB_SIZE / 2,
				backgroundColor: primaryColor,
				alignItems: "center",
				justifyContent: "center",
				...shadowStyle(elevation.header, {
					shadowColor: primaryColor,
					opacity: Platform.OS === "ios" ? 0.35 : 0,
					android: Platform.OS === "android" ? 6 : 0,
					radius: Platform.OS === "ios" ? 10 : 0,
				}),
			}}
		>
			<MessageCircle size={26} color={surfaceColor} strokeWidth={1.8} />
		</TouchableOpacity>
	);
}

export default function UserTabsLayout() {
	const themeColors = useThemeColors();
	const { tabBarHeight } = useBottomTabMetrics();
	const goToChatbot = useDebounce(() => router.push(ROUTES.user.chat));

	return (
		<ProtectedTabsLayout
			allowedUserType="user"
			unauthenticatedRedirect={ROUTES.auth.welcome}
			wrongRoleRedirect={ROUTES.technician.home}
			overlay={
				<ChatFab
					onPress={goToChatbot}
					bottom={tabBarHeight + 12}
					primaryColor={themeColors.primary}
					surfaceColor={themeColors.surfaceOnPrimary}
				/>
			}
		>
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
		</ProtectedTabsLayout>
	);
}
