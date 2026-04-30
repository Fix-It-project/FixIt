import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
} from "@/src/lib/theme";

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
		<SafeAreaView edges={["top"]} className="flex-1 bg-surface-elevated">
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
		</SafeAreaView>
	);
}
