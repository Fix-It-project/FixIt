import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function RoleSelectionScreen() {
  return (
    <LinearGradient
      colors={['#f0f4ff', '#dbe2ff', '#f0f5ff']}
      locations={[0, 0.5, 1]}
      className="flex-1"
    >
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1" contentContainerClassName="items-center px-6 py-6">
        {/* Header */}
        <View className="w-full flex items-center mt-6 mb-6">
          <View className="flex-row items-center gap-2">
            <View className="w-10 h-10 bg-[#0066FF] rounded-xl items-center justify-center shadow-lg shadow-blue-500/30">
              <Ionicons name="construct" size={24} color="#ffffff" />
            </View>
            <View className="flex-row">
              <Text className="text-[24px] font-extrabold text-[#0f172a] tracking-tight">Fix</Text>
              <Text className="text-[24px] font-extrabold text-[#0066FF] tracking-tight">IT</Text>
            </View>
          </View>
        </View>

        {/* Subtitle */}
        <View className="w-full max-w-sm mb-4">
          <Text className="text-[22px] font-extrabold text-[#0f172a]">Select Role </Text>
        </View>

        {/* Role Cards Container */}
        <View className="w-full max-w-sm flex-1 justify-center gap-6 pb-8">
          {/* User Card - Light Blue */}
          <Pressable
            className="relative w-full h-[250px] bg-[#DBEAFE] rounded-3xl p-8 active:opacity-90 overflow-hidden border-2 border-blue-200/50"
            style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10,
            }}
            onPress={() => router.push("./User/signup")}
          >


            {/* Profile Icon - Top Right */}
            <View className="absolute top-4 right-4 w-32 h-32">
              <View className="w-full h-full rounded-full border-2 border-blue-300/30 shadow-lg overflow-hidden bg-[#3380FF] items-center justify-center">
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
                  <Ionicons name="help-circle" size={16} color="#0066FF" />
                </View>
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-[#1E40AF]">
                  I NEED HELP
                </Text>
              </View>
              <Text className="text-[24px] font-extrabold text-[#0f172a] leading-tight">
                Sign up as{'\n'}a User
              </Text>
              <Text className="mt-1 text-[12px] text-[#1E40AF] font-medium">
                Find trusted experts for repairs & cleaning instantly.
              </Text>
            </View>
          </Pressable>

          {/* Technician Card - Primary Blue */}
          <Pressable
            className="relative w-full h-[250px] bg-[#0066FF] rounded-3xl p-8 active:opacity-90 overflow-hidden"
            style={{
              shadowColor: '#0066FF',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
            onPress={() => router.push("./Technician/signup")}
          >
            {/* Background blur effect */}
            <View className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/10 rounded-full" style={{ opacity: 0.3 }} />
            
            {/* Profile Icon - Top Left */}
            <View className="absolute top-4 left-4 w-32 h-32">
              <View className="w-full h-full rounded-full border-2 border-blue-300/30 shadow-lg overflow-hidden bg-[#3380FF] items-center justify-center">
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
                  <Ionicons name="hammer" size={16} color="#ffffff" />
                </View>
              </View>
              <Text className="text-[24px] font-extrabold text-white leading-tight text-right">
                Apply as a{'\n'}Technician
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
            onPress={() => router.push("/(auth)/User/login")}
          >
            <Text className="text-[14px] font-medium text-[#64748b]">Already have an account? </Text>
            <Text className="text-[14px] font-bold text-[#0066FF]">Log in</Text>
          </Pressable>
        </View>

        {/* Terms of Service */}
        <View className="w-full max-w-sm mb-8 px-4">
          <Text className="text-[11px] text-center text-[#94a3b8] leading-4">
            By signing up, you agree to our{' '}
            <Text className="text-[#0066FF] font-semibold">Terms of Service</Text>
            {' '}and{' '}
            <Text className="text-[#0066FF] font-semibold">Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
