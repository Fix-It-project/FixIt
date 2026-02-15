import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signUpSchema, type SignUpFormData } from "@/src/schemas/auth-schema";
import { useSignUpMutation } from "@/src/hooks/useSignUpMutation";
import FormInput from "@/src/components/auth/FormInput";
import PasswordInput from "@/src/components/auth/PasswordInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";
import SocialLoginButtons from "@/src/components/auth/SocialLoginButtons";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});

  const signUpMutation = useSignUpMutation();

  const clearFieldError = (field: keyof SignUpFormData) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (signUpMutation.error) signUpMutation.reset();
  };

  const handleSignUp = () => {
    setFieldErrors({});

    const result = signUpSchema.safeParse({ fullName, email, phone, password, confirmPassword });
    if (!result.success) {
      const errors: Partial<Record<keyof SignUpFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignUpFormData;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    signUpMutation.mutate({
      email: result.data.email,
      password: result.data.password,
      fullName: result.data.fullName,
      phone: result.data.phone,
    });
  };

  const errorMessage = signUpMutation.error
    ? (signUpMutation.error as any).response?.data?.error ||
      signUpMutation.error.message ||
      "Something went wrong. Please try again."
    : null;

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
            Let's get it fixed.
          </Text>
          <Text className="text-[16px] text-[#735f8c] leading-[24px]">
            Create an account to connect with top-rated technicians nearby.
          </Text>
        </View>

        {/* Form */}
        <View className="px-7 gap-6">
          <ErrorBanner message={errorMessage} />

          <FormInput
            label="Full Name"
            value={fullName}
            onChangeText={(text) => { setFullName(text); clearFieldError("fullName"); }}
            placeholder="John Doe"
            icon="person-outline"
            error={fieldErrors.fullName}
            disabled={signUpMutation.isPending}
          />

          <FormInput
            label="Email Address"
            value={email}
            onChangeText={(text) => { setEmail(text); clearFieldError("email"); }}
            placeholder="john@example.com"
            icon="mail-outline"
            error={fieldErrors.email}
            disabled={signUpMutation.isPending}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormInput
            label="Phone Number"
            value={phone}
            onChangeText={(text) => { setPhone(text); clearFieldError("phone"); }}
            placeholder="(555) 123-4567"
            icon="call-outline"
            error={fieldErrors.phone}
            disabled={signUpMutation.isPending}
            keyboardType="phone-pad"
          />

          <PasswordInput
            label="Password"
            value={password}
            onChangeText={(text) => { setPassword(text); clearFieldError("password"); }}
            error={fieldErrors.password}
            disabled={signUpMutation.isPending}
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); clearFieldError("confirmPassword"); }}
            placeholder="Re-enter your password"
            error={fieldErrors.confirmPassword}
            disabled={signUpMutation.isPending}
          />

          <SubmitButton
            label="Sign Up"
            onPress={handleSignUp}
            isLoading={signUpMutation.isPending}
            disabled={!isFormValid}
          />

          {/* Divider */}
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-[1px] bg-[#d1d5dc]" />
            <Text className="px-4 text-[12px] text-[#6a7282]">Or continue with</Text>
            <View className="flex-1 h-[1px] bg-[#d1d5dc]" />
          </View>

          <SocialLoginButtons variant="compact" />

          {/* Login Link */}
          <View className="flex-row items-center justify-center mt-4 mb-8">
            <Text className="text-[14px] text-[#735f8c]">
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text className="text-[14px] text-[#6c04ec] font-bold">Log In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
