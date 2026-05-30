import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import BookingsTabContent from "@/src/features/booking-orders/components/tech/BookingsTabContent";
import ScheduleTabContent from "@/src/features/schedule/components/tech/ScheduleTabContent";
import {
	Colors,
	fontFamily,
	fontSize,
	radius,
	space,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";

type ActiveView = "schedule" | "bookings";
type ScheduleTopTabParamList = {
	schedule: undefined;
	bookings: undefined;
};

const TopTabs = createMaterialTopTabNavigator<ScheduleTopTabParamList>();

export default function UnifiedSchedulePage() {
	const themeColors = useThemeColors();
	const params = useLocalSearchParams<{ view?: string }>();
	const requestedView: ActiveView =
		params.view === "bookings" ? "bookings" : "schedule";

	return (
		<View className="flex-1 bg-surface">
			<TopTabs.Navigator
				key={requestedView}
				initialRouteName={requestedView}
				screenOptions={{
					swipeEnabled: true,
					animationEnabled: true,
					lazy: false,
					sceneStyle: { backgroundColor: "transparent" },
					tabBarStyle: {
						backgroundColor: Colors.primaryDark,
						shadowColor: "transparent",
						elevation: 0,
					},
					tabBarIndicatorStyle: {
						backgroundColor: themeColors.surfaceOnPrimary,
						height: space[0.5] + space.px,
						borderRadius: radius.pill,
					},
					tabBarItemStyle: {
						minHeight: spacing.button.height.md,
					},
					tabBarLabelStyle: {
						fontFamily: fontFamily.semibold,
						fontSize: fontSize.sm,
						textTransform: "none",
					},
					tabBarActiveTintColor: themeColors.surfaceOnPrimary,
					tabBarInactiveTintColor: Colors.overlaySub,
					tabBarPressColor: "transparent",
					tabBarAndroidRipple: { borderless: false, color: "transparent" },
				}}
			>
				<TopTabs.Screen
					name="schedule"
					component={ScheduleTabContent}
					options={{ title: "Schedule" }}
				/>
				<TopTabs.Screen
					name="bookings"
					component={BookingsTabContent}
					options={{ title: "Bookings" }}
				/>
			</TopTabs.Navigator>
		</View>
	);
}
