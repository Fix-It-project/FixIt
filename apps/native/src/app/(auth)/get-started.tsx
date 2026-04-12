import { router } from "expo-router";
import { View, Text, Image } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GetStartedScreen() {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const goToRoleSelection = useDebounce(() =>
    router.push("/(auth)/role-selection"),
  );

  return (
    <LinearGradient
      colors={[
        themeColors.gradientStart,
        themeColors.gradientMid,
        themeColors.gradientEnd,
      ]}
      locations={[0, 0.5, 1]}
      className="flex-1"
    >
      {/* Main Content */}
      <View
        className="flex-1 items-center px-8"
        style={{
          paddingTop: insets.top + 145,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Logo Container */}
        <View className="mb-[33px]">
          <Image
            source={require("../../assets/images/fixit.png")}
            style={{ width: 112, height: 112, borderRadius: 26 }}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <View className="flex-row items-center mb-2">
          <Text className="text-[41px] font-bold text-content tracking-tight">
            Fix
          </Text>
          <Text className="text-[41px] font-bold text-app-primary-dark tracking-tight">
            IT
          </Text>
        </View>

        {/* Subtitle */}
        <Text className="text-[17px] font-light text-content-secondary mb-[76px]">
          Fast & Reliable
        </Text>

        {/* Buttons */}
        <View className="w-full max-w-[327px] gap-4">
          <Button
            onPress={goToRoleSelection}
            className="flex-row gap-2 shadow-sm"
          >
            <BtnText className="text-[17px]">Get Started</BtnText>
            <ArrowRight size={20} color={themeColors.surfaceBase} />
          </Button>
        </View>

        {/* Terms and Privacy */}
        <View className="absolute px-8" style={{ bottom: insets.bottom + 18 }}>
          <Text className="text-[10.2px] text-content-muted text-center leading-4">
            By pressing on "Sign Up", you agree to our{" "}
            <Text className="underline">Terms of Service</Text>
            {"\n"}and <Text className="underline">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
