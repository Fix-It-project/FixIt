import { useNavigation } from "@react-navigation/native";
import type { MaterialTopTabNavigationProp } from "@react-navigation/material-top-tabs";
import Animated, { FadeInDown } from "react-native-reanimated";
import { View } from "react-native";
import NotificationBell from "@/src/components/ui/NotificationBell";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";
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
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 10,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="flex-row items-center justify-between"
        >
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: 22,
              color: themeColors.onPrimaryHeader,
            }}
          >
            Fix
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 26,
                color: themeColors.accentSky,
              }}
            >
              IT
            </Text>
            {"  "}
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 22,
                color: themeColors.onPrimaryHeader,
              }}
            >
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
