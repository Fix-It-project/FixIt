import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signUpSchema, type SignUpFormData } from "@/src/schemas/auth-schema";
import { signUp } from "@/src/services/auth/api/auth";

export default function TechnicianSignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});

  const clearFieldError = (field: keyof SignUpFormData) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (error) setError(null);
  };

  const handleSignUp = async () => {
    // Clear previous errors
    setError(null);
    setFieldErrors({});

    // Validate with zod
    const result = signUpSchema.safeParse({ fullName, email, phone, password, confirmPassword });
    if (!result.success) {
      const errors: Partial<Record<keyof SignUpFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignUpFormData;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    // Call API
    setIsLoading(true);
    try {
      const response = await signUp({
        email: result.data.email,
        password: result.data.password,
        fullName: result.data.fullName,
        phone: result.data.phone,
      });

      // Show success and navigate to login
      Alert.alert(
        "Application Submitted!",
        response.message || "Your technician account has been created. Please sign in to continue.",
        [
          {
            text: "Sign In",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;

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
            Join as a Pro.
          </Text>
          <Text className="text-[16px] text-[#735f8c] leading-[24px]">
            Create your technician account and start growing your business.
          </Text>
        </View>

        {/* Form */}
        <View className="px-7 gap-6">
          {/* General Error */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <Text className="text-red-600 text-[14px] text-center">{error}</Text>
            </View>
          )}

          {/* Pro Badge */}
          <View className="flex-row items-center gap-2 bg-[#0066FF]/10 rounded-2xl px-4 py-3">
            <View className="bg-[#0066FF] p-1.5 rounded-lg">
              <Ionicons name="hammer" size={16} color="#ffffff" />
            </View>
            <Text className="text-[13px] font-semibold text-[#0066FF]">
              Technician Account
            </Text>
          </View>

          {/* Full Name */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Full Name
            </Text>
            <View className={`bg-white h-14 rounded-full flex-row items-center px-6 ${fieldErrors.fullName ? 'border border-red-400' : ''}`}>
              <TextInput
                value={fullName}
                onChangeText={(text) => { setFullName(text); clearFieldError("fullName"); }}
                placeholder="John Doe"
                placeholderTextColor="#99a1af"
                editable={!isLoading}
                className="flex-1 text-[16px] text-[#141118]"
              />
              <Ionicons name="person-outline" size={20} color="#99a1af" />
            </View>
            {fieldErrors.fullName && (
              <Text className="text-red-500 text-[12px] ml-4">{fieldErrors.fullName}</Text>
            )}
          </View>

          {/* Email Address */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Email Address
            </Text>
            <View className={`bg-white h-14 rounded-full flex-row items-center px-6 ${fieldErrors.email ? 'border border-red-400' : ''}`}>
              <TextInput
                value={email}
                onChangeText={(text) => { setEmail(text); clearFieldError("email"); }}
                placeholder="john@example.com"
                placeholderTextColor="#99a1af"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                className="flex-1 text-[16px] text-[#141118]"
              />
              <Ionicons name="mail-outline" size={20} color="#99a1af" />
            </View>
            {fieldErrors.email && (
              <Text className="text-red-500 text-[12px] ml-4">{fieldErrors.email}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Phone Number
            </Text>
            <View className={`bg-white h-14 rounded-full flex-row items-center px-6 ${fieldErrors.phone ? 'border border-red-400' : ''}`}>
              <TextInput
                value={phone}
                onChangeText={(text) => { setPhone(text); clearFieldError("phone"); }}
                placeholder="(555) 123-4567"
                placeholderTextColor="#99a1af"
                keyboardType="phone-pad"
                editable={!isLoading}
                className="flex-1 text-[16px] text-[#141118]"
              />
              <Ionicons name="call-outline" size={20} color="#99a1af" />
            </View>
            {fieldErrors.phone && (
              <Text className="text-red-500 text-[12px] ml-4">{fieldErrors.phone}</Text>
            )}
          </View>

          {/* Password */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Password
            </Text>
            <View className={`bg-white h-14 rounded-full flex-row items-center px-6 ${fieldErrors.password ? 'border border-red-400' : ''}`}>
              <TextInput
                value={password}
                onChangeText={(text) => { setPassword(text); clearFieldError("password"); }}
                placeholder="Enter your password"
                placeholderTextColor="#99a1af"
                secureTextEntry={!showPassword}
                editable={!isLoading}
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
            {fieldErrors.password && (
              <Text className="text-red-500 text-[12px] ml-4">{fieldErrors.password}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View className="gap-3">
            <Text className="text-[14px] font-semibold text-[#141118]">
              Confirm Password
            </Text>
            <View className={`bg-white h-14 rounded-full flex-row items-center px-6 ${fieldErrors.confirmPassword ? 'border border-red-400' : ''}`}>
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); clearFieldError("confirmPassword"); }}
                placeholder="Re-enter your password"
                placeholderTextColor="#99a1af"
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
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
            {fieldErrors.confirmPassword && (
              <Text className="text-red-500 text-[12px] ml-4">{fieldErrors.confirmPassword}</Text>
            )}
          </View>

          {/* Sign Up Button */}
          <Pressable 
            className={`h-14 rounded-full items-center justify-center mt-2 ${
              isFormValid && !isLoading ? 'bg-[#0066FF] active:opacity-90' : 'bg-[#0066FF]/50'
            }`}
            onPress={handleSignUp}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-[16px] font-bold">
                Apply as Technician
              </Text>
            )}
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
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text className="text-[14px] text-[#0066FF] font-bold">
                Log In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
