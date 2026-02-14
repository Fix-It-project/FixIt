import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#ebeeff]"
    >
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <Pressable 
          onPress={() => router.back()}
          className="ml-4 mt-6 w-10 h-10 rounded-full items-center justify-center active:opacity-70"
        >
          <Ionicons name="arrow-back" size={24} color="#141118" />
        </Pressable>

        {/* Header */}
        <View className="px-7 mt-5 mb-10">
          <Text className="text-[32px] font-bold text-[#141118] leading-[48px] mb-2">
            Let's get it fixed.
          </Text>
          <Text className="text-[16px] text-[#735f8c] leading-[24px]">
            Create an account to connect with top-rated technicians nearby.
          </Text>
        </View>

        {/* Form */}
        <View className="px-7 gap-6">
          {/* Full Name */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Full Name
            </Text>
            <View className="bg-white h-14 rounded-full flex-row items-center px-6">
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
                placeholderTextColor="#99a1af"
                className="flex-1 text-[16px] text-[#141118]"
              />
              <Ionicons name="person-outline" size={20} color="#99a1af" />
            </View>
          </View>

          {/* Email Address */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Email Address
            </Text>
            <View className="bg-white h-14 rounded-full flex-row items-center px-6">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                placeholderTextColor="#99a1af"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-[16px] text-[#141118]"
              />
              <Ionicons name="mail-outline" size={20} color="#99a1af" />
            </View>
          </View>

          {/* Phone Number */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Phone Number
            </Text>
            <View className="bg-white h-14 rounded-full flex-row items-center px-6">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="(555) 123-4567"
                placeholderTextColor="#99a1af"
                keyboardType="phone-pad"
                className="flex-1 text-[16px] text-[#141118]"
              />
              <Ionicons name="call-outline" size={20} color="#99a1af" />
            </View>
          </View>

          {/* Password */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Password
            </Text>
            <View className="bg-white h-14 rounded-full flex-row items-center px-6">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#99a1af"
                secureTextEntry={!showPassword}
                className="flex-1 text-[16px] text-[#141118]"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#99a1af" 
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Confirm Password
            </Text>
            <View className="bg-white h-14 rounded-full flex-row items-center px-6">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor="#99a1af"
                secureTextEntry={!showConfirmPassword}
                className="flex-1 text-[16px] text-[#141118]"
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#99a1af" 
                />
              </Pressable>
            </View>
          </View>

          {/* Sign Up Button */}
          <Pressable 
            className="bg-[#036ded] h-14 rounded-full items-center justify-center mt-2 active:opacity-90"
            onPress={() => {
              // Handle signup
              console.log({ fullName, email, phone, password, confirmPassword });
            }}
          >
            <Text className="text-white text-[16px] font-bold">
              Sign Up
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-[1px] bg-[#d1d5dc]" />
            <Text className="px-4 text-[12px] text-[#6a7282]">
              Or continue with
            </Text>
            <View className="flex-1 h-[1px] bg-[#d1d5dc]" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row gap-6 justify-center">
            <Pressable className="bg-white border border-[#e5e7eb] rounded-[30px] h-11 px-6 flex-row items-center gap-3 active:opacity-70 shadow-sm">
              <Ionicons name="logo-google" size={20} color="#364153" />
              <Text className="text-[#364153] text-[12px] font-medium">
                Google
              </Text>
            </Pressable>

            <Pressable className="bg-white border border-[#e5e7eb] rounded-[30px] h-11 px-6 flex-row items-center gap-3 active:opacity-70 shadow-sm">
              <Ionicons name="logo-apple" size={20} color="#364153" />
              <Text className="text-[#364153] text-[12px] font-medium">
                Apple
              </Text>
            </Pressable>
          </View>

          {/* Login Link */}
          <View className="flex-row items-center justify-center mt-4 mb-8">
            <Text className="text-[14px] text-[#735f8c]">
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(main)/(auth)/login")}>
              <Text className="text-[14px] text-[#6c04ec] font-bold">
                Log In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
