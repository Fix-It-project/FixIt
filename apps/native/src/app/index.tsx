import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#ecefff', '#dbe2ff', '#ecefff']}
      locations={[0, 0.5, 1]}
      className="flex-1"
    >
      <StatusBar style="dark" />

      {/* Main Content */}
      <View className="flex-1 items-center pt-[189px] px-8">
        {/* Logo Container */}
        <View className="mb-[33px]">
          <View className="w-28 h-28 bg-white rounded-3xl items-center justify-center shadow-lg shadow-blue-100">
            <Ionicons name="construct" size={64} color="#135bec" />
          </View>
        </View>

        {/* App Name */}
        <View className="flex-row items-center mb-2">
          <Text className="text-[41px] font-bold text-[#0f172a] tracking-tight">Fix</Text>
          <Text className="text-[41px] font-bold text-[#135bec] tracking-tight">IT</Text>
        </View>

        {/* Subtitle */}
        <Text className="text-[17px] font-light text-[#64748b] mb-[76px]">Fast & Reliable</Text>

        {/* Buttons */}
        <View className="w-full max-w-[327px] gap-4">
          <Pressable
            className="flex-row items-center justify-center bg-[#036ded] h-14 rounded-full px-6 gap-2 active:opacity-70 shadow-sm"
            onPress={() => router.push("/(main)/(auth)/role-selection")}
          >
            <Text className="text-[17px] font-bold text-white">Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </Pressable>
        </View>

        {/* Terms and Privacy */}
        <View className="absolute bottom-[34px] px-8">
          <Text className="text-[10.2px] text-[#94a3b8] text-center leading-4">
            By pressing on "Sign Up", you agree to our{" "}
            <Text className="underline">Terms of Service</Text>
            {"\n"}and <Text className="underline">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
