import type { MaterialTopTabNavigationProp } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import NotificationBell from "@/src/components/ui/NotificationBell";
import { Text } from "@/src/components/ui/text";
import {
	Colors,
	elevation,
	shadowStyle,
	spacing,
	useThemeColors,
} from "@/src/lib/theme";
import ScheduleScreen from "./ScheduleScreen";

type ScheduleTopTabParamList = {
	schedule: undefined;
	bookings: undefined;
};

export default function ScheduleTabContent() {
	const navigation =
		useNavigation<MaterialTopTabNavigationProp<ScheduleTopTabParamList>>();
	const themeColors = useThemeColors();

	return (
		<View className="flex-1 bg-surface-elevated">
			<View
				style={{
					backgroundColor: Colors.primaryDark,
					paddingHorizontal: spacing.header.shellPaddingX,
					paddingBottom: spacing.header.shellPaddingBottom,
					paddingTop: spacing.header.shellPaddingTop,
					borderBottomLeftRadius: 24,
					borderBottomRightRadius: 24,
					...shadowStyle(elevation.header, {
						shadowColor: Colors.shadow,
						opacity: 0.18,
					}),
				}}
			>
				<Animated.View
					entering={FadeInDown.duration(400)}
					className="flex-row items-center justify-between"
				>
					<Text variant="h2" style={{ color: themeColors.onPrimaryHeader }}>
						Fix
						<Text variant="h2" style={{ color: themeColors.accentSky }}>
							IT
						</Text>
						{"  "}
						<Text variant="h2" style={{ color: themeColors.onPrimaryHeader }}>
							Technicians
						</Text>
					</Text>

					<NotificationBell />
				</Animated.View>
			</View>

			<ScheduleScreen onDismissSetup={() => navigation.navigate("bookings")} />
		</View>
	);
}
