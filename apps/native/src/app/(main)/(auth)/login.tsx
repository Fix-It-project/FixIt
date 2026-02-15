import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInSchema, type SignInFormData } from "@/src/schemas/auth-schema";
import { signIn } from "@/src/services/auth/api/auth";
import { useAuthStore } from "@/src/stores/auth-store";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignInFormData, string>>>({});

  const { setSession } = useAuthStore();

  const handleLogin = async () => {
    // Clear previous errors
    setError(null);
    setFieldErrors({});

    // Validate with zod
    const result = signInSchema.safeParse({ email: emailOrUsername, password });
    console.log("[Login] Zod validation:", result.success ? "PASSED" : "FAILED", result.success ? {} : result.error.issues);
    if (!result.success) {
      const errors: Partial<Record<keyof SignInFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignInFormData;
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
      console.log("[Login] Calling signIn API with email:", result.data.email);
      const response = await signIn({ email: result.data.email, password: result.data.password });
      console.log("[Login] API response:", { user: response.user, hasSession: !!response.session });

      // Store session in zustand + SecureStore
      await setSession(
        response.user,
        response.session.accessToken,
        response.session.refreshToken
      );

      // Navigate to main app
      router.replace("/(app)");
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Please try again.";
      console.log("[Login] Error:", message, err.response?.status);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = emailOrUsername.trim().length > 0 && password.length > 0;

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
          {/* General Error */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-[14px] text-center">{error}</Text>
            </View>
          )}

          {/* Email or Username */}
          <View className="mb-6">
            <Text className="text-[14px] font-medium text-[#111418] mb-2">
              Email or Username
            </Text>
            <View className={`bg-white h-14 rounded-full flex-row items-center px-6 ${fieldErrors.email ? 'border border-red-400' : ''}`}>
              <TextInput
                value={emailOrUsername}
                onChangeText={(text) => {
                  setEmailOrUsername(text);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  if (error) setError(null);
                }}
                placeholder="Enter your email or username"
                placeholderTextColor="#99a1af"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                className="flex-1 text-[16px] text-[#111418]"
              />
              <Ionicons name="mail-outline" size={24} color="#5f738c" />
            </View>
            {fieldErrors.email && (
              <Text className="text-red-500 text-[12px] mt-1 ml-4">{fieldErrors.email}</Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-3">
            <Text className="text-[14px] font-medium text-[#111418] mb-2">
              Password
            </Text>
            <View className={`bg-white h-14 rounded-full flex-row items-center px-6 ${fieldErrors.password ? 'border border-red-400' : ''}`}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  if (error) setError(null);
                }}
                placeholder="Enter your password"
                placeholderTextColor="#99a1af"
                secureTextEntry={!showPassword}
                editable={!isLoading}
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
            {fieldErrors.password && (
              <Text className="text-red-500 text-[12px] mt-1 ml-4">{fieldErrors.password}</Text>
            )}
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
            className={`h-14 rounded-full items-center justify-center mb-6 ${
              isFormValid && !isLoading ? 'bg-[#036ded] active:opacity-90' : 'bg-[#036ded]/50'
            }`}
            onPress={handleLogin}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-[16px] font-bold">
                Log in
              </Text>
            )}
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
            <Pressable onPress={() => router.push("../role-selection")}>
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
