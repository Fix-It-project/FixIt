import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, Image } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useDebounce } from "@/src/hooks/useDebounce";

export default function GetStartedScreen() {
  const goToRoleSelection = useDebounce(() => router.push("/(auth)/role-selection"));

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      locations={[0, 0.5, 1]}
      className="flex-1"
    >
      <StatusBar style="dark" />

      {/* Main Content */}
      <View className="flex-1 items-center pt-[189px] px-8">
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
          <Text className="text-[41px] font-bold text-content-slate tracking-tight">Fix</Text>
          <Text className="text-[41px] font-bold text-app-primary-dark tracking-tight">IT</Text>
        </View>

        {/* Subtitle */}
        <Text className="text-[17px] font-light text-content-slate-light mb-[76px]">Fast & Reliable</Text>

        {/* Buttons */}
        <View className="w-full max-w-[327px] gap-4">
          <Button
            onPress={goToRoleSelection}
            className="flex-row gap-2 shadow-sm"
          >
            <BtnText className="text-[17px]">Get Started</BtnText>
            <ArrowRight size={20} color={Colors.surfaceBase} />
          </Button>
        </View>

        {/* Terms and Privacy */}
        <View className="absolute bottom-[34px] px-8">
          <Text className="text-[10.2px] text-content-slate-dim text-center leading-4">
            By pressing on "Sign Up", you agree to our{" "}
            <Text className="underline">Terms of Service</Text>
            {"\n"}and <Text className="underline">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
