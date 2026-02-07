import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#ebeeff]"
    >
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 mt-24 mb-8">
          <Text className="text-[32px] font-bold text-[#111418] text-center mb-3">
            Welcome back
          </Text>
          <Text className="text-[16px] text-[#5f738c] text-center">
            Sign in to book your next repair
          </Text>
        </View>

        {/* Form */}
        <View className="px-6">
          {/* Email or Username */}
          <View className="mb-6">
            <Text className="text-[14px] font-medium text-[#111418] mb-2">
              Email or Username
            </Text>
            <View className="bg-white h-14 rounded-full flex-row items-center px-6">
              <TextInput
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                placeholder="Enter your email or username"
                placeholderTextColor="#99a1af"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-[16px] text-[#111418]"
              />
              <Ionicons name="mail-outline" size={24} color="#5f738c" />
            </View>
          </View>

          {/* Password */}
          <View className="mb-3">
            <Text className="text-[14px] font-medium text-[#111418] mb-2">
              Password
            </Text>
            <View className="bg-white h-14 rounded-full flex-row items-center px-6">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#99a1af"
                secureTextEntry={!showPassword}
                className="flex-1 text-[16px] text-[#111418]"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#5f738c" 
                />
              </Pressable>
            </View>
          </View>

          {/* Forgot Password */}
          <View className="items-end mb-6">
            <Pressable onPress={() => {/* Handle forgot password */}}>
              <Text className="text-[14px] font-medium text-[#5f738c]">
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          {/* Log In Button */}
          <Pressable 
            className="bg-[#036ded] h-14 rounded-full items-center justify-center mb-6 active:opacity-90"
            onPress={() => {
              // Handle login
              console.log({ emailOrUsername, password });
              router.push("/(main)/(tabs)");
            }}
          >
            <Text className="text-white text-[16px] font-bold">
              Log in
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-[#5982b3]" />
            <Text className="px-4 text-[14px] text-[#5f738c]">
              Or continue with
            </Text>
            <View className="flex-1 h-[1px] bg-[#5982b3]" />
          </View>

          {/* Social Login Buttons */}
          <View className="gap-4 mb-6">
            <Pressable className="bg-white border border-[#5982b3] rounded-full h-14 flex-row items-center justify-center gap-3 active:opacity-70">
              <Ionicons name="logo-google" size={24} color="#111418" />
              <Text className="text-[#111418] text-[16px] font-medium">
                Login with Google
              </Text>
            </Pressable>

            <Pressable className="bg-[#111418] rounded-full h-14 flex-row items-center justify-center gap-3 active:opacity-70">
              <Ionicons name="logo-apple" size={24} color="#ffffff" />
              <Text className="text-white text-[16px] font-medium">
                Login with Apple
              </Text>
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center mt-4 mb-8">
            <Text className="text-[14px] text-[#5f738c]">
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(main)/(auth)/signup")}>
              <Text className="text-[14px] text-[#036ded] font-bold">
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
