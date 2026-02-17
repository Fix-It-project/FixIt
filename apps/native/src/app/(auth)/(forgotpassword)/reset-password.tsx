import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/src/schemas/auth-schema";
import { useResetPasswordMutation } from "@/src/hooks/useResetPasswordMutation";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import PasswordInput from "@/src/components/auth/PasswordInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";

export default function ResetPassword() {
  const { access_token, refresh_token, userType } = useLocalSearchParams<{
    access_token: string;
    refresh_token: string;
    userType: string;
  }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ResetPasswordFormData, string>>>({});

  const resetMutation = useResetPasswordMutation(userType ?? "user");

  const clearFieldError = (field: keyof ResetPasswordFormData) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (resetMutation.error) resetMutation.reset();
  };

  const handleResetPassword = () => {
    setFieldErrors({});

    const result = resetPasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ResetPasswordFormData;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    if (!access_token || !refresh_token) {
      return;
    }

    resetMutation.mutate({
      accessToken: access_token,
      refreshToken: refresh_token,
      newPassword: result.data.newPassword,
    });
  };

  const errorMessage = resetMutation.error ? getErrorMessage(resetMutation.error) : null;

  const loginRoute =
    userType === "technician" ? "/(auth)/Technician/login" : "/(auth)/User/login";

  const isFormValid = newPassword.length > 0 && confirmPassword.length > 0;

  // ─── Missing tokens = invalid link ────────────────────────────────────────
  if (!access_token || !refresh_token) {
    return (
      <AuthPageLayout title="Invalid Link" subtitle="This password reset link is invalid or has expired">
        <View className="items-center mt-4 mb-6">
          <View className="h-20 w-20 rounded-full bg-red-100 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          </View>
        </View>

        <Text className="text-[15px] text-[#5f738c] text-center leading-6">
          Please request a new password reset link from the login page.
        </Text>

        <View className="mt-8">
          <Pressable
            onPress={() => router.replace(loginRoute as any)}
            className="h-14 rounded-full items-center justify-center border-2 border-[#036ded]"
          >
            <Text className="text-[16px] font-bold text-[#036ded]">Back to Login</Text>
          </Pressable>
        </View>
      </AuthPageLayout>
    );
  }

  // ─── Reset Password Form ──────────────────────────────────────────────────
  return (
    <AuthPageLayout title="Reset Password" subtitle="Enter your new password below">
      <ErrorBanner message={errorMessage} />

      <PasswordInput
        label="New Password"
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          clearFieldError("newPassword");
        }}
        error={fieldErrors.newPassword}
        disabled={resetMutation.isPending}
      />

      <PasswordInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          clearFieldError("confirmPassword");
        }}
        error={fieldErrors.confirmPassword}
        disabled={resetMutation.isPending}
      />

      <SubmitButton
        label="Reset Password"
        onPress={handleResetPassword}
        isLoading={resetMutation.isPending}
        disabled={!isFormValid}
      />

      {/* Back to login */}
      <View className="flex-row items-center justify-center mt-4">
        <Pressable
          onPress={() => router.replace(loginRoute as any)}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={16} color="#5f738c" />
          <Text className="text-[14px] font-medium text-[#5f738c]">Back to Login</Text>
        </Pressable>
      </View>
    </AuthPageLayout>
  );
}
