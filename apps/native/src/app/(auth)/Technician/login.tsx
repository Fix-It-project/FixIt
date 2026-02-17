import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { signInSchema, type SignInFormData } from "@/src/schemas/auth-schema";
import { useLoginMutation } from "@/src/hooks/useLoginMutation";
import FormInput from "@/src/components/auth/FormInput";
import PasswordInput from "@/src/components/auth/PasswordInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignInFormData, string>>>({});

  const loginMutation = useLoginMutation();

  const clearFieldError = (field: keyof SignInFormData) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (loginMutation.error) loginMutation.reset();
  };

  const handleLogin = () => {
    setFieldErrors({});

    const result = signInSchema.safeParse({ email: emailOrUsername, password });
    if (!result.success) {
      const errors: Partial<Record<keyof SignInFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignInFormData;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    loginMutation.mutate({ email: result.data.email, password: result.data.password });
  };

  const errorMessage = loginMutation.error ? getErrorMessage(loginMutation.error) : null;

  const isFormValid = emailOrUsername.trim().length > 0 && password.length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      className="flex-1 bg-[#ebeeff]"
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="px-6 mt-24 mb-8">
          <Text className="text-[32px] font-bold text-[#111418] text-center mb-3">
            Welcome back
          </Text>
          <Text className="text-[16px] text-[#5f738c] text-center">
            Sign in to your technician account
          </Text>
        </View>

        {/* Form */}
        <View className="px-6 gap-6">
          <ErrorBanner message={errorMessage} />

          <FormInput
            label="Email or Username"
            value={emailOrUsername}
            onChangeText={(text) => { setEmailOrUsername(text); clearFieldError("email"); }}
            placeholder="Enter your email or username"
            icon="mail-outline"
            error={fieldErrors.email}
            disabled={loginMutation.isPending}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PasswordInput
            label="Password"
            value={password}
            onChangeText={(text) => { setPassword(text); clearFieldError("password"); }}
            error={fieldErrors.password}
            disabled={loginMutation.isPending}
          />

          {/* Forgot Password */}
          <View className="items-end -mt-3">
            <Pressable onPress={() => router.push("/(auth)/(forgotpassword)/forgot-password?userType=technician")}>
              <Text className="text-[14px] font-medium text-[#5f738c]">
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          <SubmitButton
            label="Log in"
            onPress={handleLogin}
            isLoading={loginMutation.isPending}
            disabled={!isFormValid}
          />

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center mt-4 mb-8">
            <Text className="text-[14px] text-[#5f738c]">
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/role-selection")}>
              <Text className="text-[14px] text-[#036ded] font-bold">Sign up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
