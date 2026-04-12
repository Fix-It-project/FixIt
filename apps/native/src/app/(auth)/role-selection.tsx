import { router } from "expo-router";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { HelpCircle, Hammer } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, useThemeColors } from "@/src/lib/theme";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RoleSelectionScreen() {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const goToUserSignup = useDebounce(() => router.push("/(auth)/User/signup"));
  const goToTechSignup = useDebounce(() =>
    router.push("/(auth)/Technician/signup"),
  );
  const goToLogin = useDebounce(() => router.push("/(auth)/User/login"));

  return (
    <LinearGradient
      colors={[
        themeColors.gradientRoleStart,
        themeColors.gradientRoleMid,
        themeColors.gradientRoleEnd,
      ]}
      locations={[0, 0.5, 1]}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="items-center px-6 pt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Header */}
        <View className="w-full flex items-center mt-6 mb-6">
          <View className="flex-row items-center gap-2">
            <Image
              source={require("../../assets/images/fixit.png")}
              style={{ width: 40, height: 40, borderRadius: 10 }}
              resizeMode="contain"
            />
            <View className="flex-row">
              <Text className="text-[24px] font-extrabold text-content tracking-tight">
                Fix
              </Text>
              <Text className="text-[24px] font-extrabold text-app-primary tracking-tight">
                IT
              </Text>
            </View>
          </View>
        </View>

        {/* Subtitle */}
        <View className="w-full max-w-sm mb-4">
          <Text className="text-[22px] font-extrabold text-content">
            Select Role{" "}
          </Text>
        </View>

        {/* Role Cards Container */}
        <View className="w-full max-w-sm flex-1 justify-center gap-6 pb-8">
          {/* User Card - Light Blue */}
          <Pressable
            className="relative w-full h-[250px] bg-role-user rounded-3xl p-8 active:opacity-90 overflow-hidden border-2 border-blue-200/50"
            style={{
              shadowColor: Colors.roleAccent,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10,
            }}
            onPress={goToUserSignup}
          >
            {/* Profile Icon - Top Right */}
            <View className="absolute top-4 right-4 w-32 h-32">
              <View className="w-full h-full rounded-full border-2 border-blue-300/30 shadow-lg overflow-hidden bg-role-accent items-center justify-center">
                <Image
                  source={require("../../assets/avatars/business-man-user-icon-vector-4333097-removebg-preview.png")}
                  style={{ width: 128, height: 160 }}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Content - Bottom Left */}
            <View className="absolute bottom-6 left-6 right-6">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="bg-white/80 p-1.5 rounded-lg">
                  <HelpCircle size={16} color={Colors.primary} />
                </View>
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-role-label">
                  I NEED HELP
                </Text>
              </View>
              <Text className="text-[24px] font-extrabold text-content leading-tight">
                Sign up as{"\n"}a User
              </Text>
              <Text className="mt-1 text-[12px] text-role-label font-medium">
                Find trusted experts for repairs & cleaning instantly.
              </Text>
            </View>
          </Pressable>

          {/* Technician Card - Primary Blue */}
          <Pressable
            className="relative w-full h-[250px] bg-role-tech rounded-3xl p-8 active:opacity-90 overflow-hidden"
            style={{
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
            onPress={goToTechSignup}
          >
            {/* Background blur effect */}
            <View
              className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/10 rounded-full"
              style={{ opacity: 0.3 }}
            />

            {/* Profile Icon - Top Left */}
            <View className="absolute top-4 left-4 w-32 h-32">
              <View className="w-full h-full rounded-full border-2 border-blue-300/30 shadow-lg overflow-hidden bg-role-accent items-center justify-center">
                <Image
                  source={require("../../assets/avatars/technician.png")}
                  style={{ width: 128, height: 128 }}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Content - Bottom Right */}
            <View className="absolute bottom-6 right-6 left-6 items-end">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">
                  I AM A PRO
                </Text>
                <View className="bg-white/20 p-1.5 rounded-lg">
                  <Hammer size={16} color={themeColors.surfaceBase} />
                </View>
              </View>
              <Text className="text-[24px] font-extrabold text-white leading-tight text-right">
                Apply as a{"\n"}Technician
              </Text>
              <Text className="mt-1 text-[12px] text-blue-100 font-medium text-right max-w-[85%]">
                Grow your business and connect with local customers.
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Login Section */}
        <View className="w-full max-w-sm mb-6">
          <Pressable
            className="w-full py-4 px-6 flex-row items-center justify-center active:opacity-70"
            onPress={goToLogin}
          >
            <Text className="text-[14px] font-medium text-content-secondary">
              Already have an account?{" "}
            </Text>
            <Text className="text-[14px] font-bold text-app-primary">
              Log in
            </Text>
          </Pressable>
        </View>

        {/* Terms of Service */}
        <View className="w-full max-w-sm mb-8 px-4">
          <Text className="text-[11px] text-center text-content-muted leading-4">
            By signing up, you agree to our{" "}
            <Text className="text-app-primary font-semibold">
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text className="text-app-primary font-semibold">
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
