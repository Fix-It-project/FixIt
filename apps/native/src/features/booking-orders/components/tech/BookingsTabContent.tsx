import { useRef } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import NotificationBell from "@/src/components/ui/NotificationBell";
import { Text } from "@/src/components/ui/text";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import {
	Colors,
	elevation,
	shadowStyle,
	spacing,
	useThemeColors,
} from "@/src/lib/theme";
import BookingListContent from "./BookingListContent";
import BookingsCalendarSheet, {
	type BookingsCalendarSheetRef,
} from "./BookingsCalendarSheet";
import BookingsWeekStrip from "./BookingsWeekStrip";

export default function BookingsTabContent() {
	const themeColors = useThemeColors();
	const calendarRef = useRef<BookingsCalendarSheetRef>(null);

	useFocusBackHandler(() => calendarRef.current?.closeIfOpen() ?? false);

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
					className="mb-4 flex-row items-center justify-between"
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

				<Animated.View entering={FadeInDown.delay(80).duration(300)}>
					<BookingsWeekStrip />
				</Animated.View>

				<Animated.View
					entering={FadeInDown.delay(160).duration(300)}
					className="mt-2.5 flex-row justify-end"
				>
					<BookingsCalendarSheet ref={calendarRef} />
				</Animated.View>
			</View>

			<BookingListContent />
		</View>
	);
}
