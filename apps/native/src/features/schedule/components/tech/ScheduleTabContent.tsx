import type { MaterialTopTabNavigationProp } from "expo-router/js-top-tabs";
import { useNavigation } from "expo-router/react-navigation";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	Colors,
	elevation,
	shadowStyle,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
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
		<View className="flex-1 bg-surface">
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
					className="flex-row items-center"
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
				</Animated.View>
			</View>

			<ScheduleScreen onDismissSetup={() => navigation.navigate("bookings")} />
		</View>
	);
}
