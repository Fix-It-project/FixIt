import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, AlertCircle } from "lucide-react-native";
import { useState } from "react";
import { resetPasswordSchema } from "@/src/schemas/auth-schema";
import { useResetPasswordMutation } from "@/src/hooks/useResetPasswordMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import KeyboardWrapper from "@/src/components/auth/KeyboardWrapper";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import PasswordInput from "@/src/components/auth/PasswordInput";
import SubmitButton from "@/src/components/auth/SubmitButton";

export default function ResetPassword() {
  const { access_token, refresh_token, userType } = useLocalSearchParams<{
    access_token: string;
    refresh_token: string;
    userType: string;
  }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetMutation = useResetPasswordMutation(userType ?? "user");
  const { fieldErrors, clearFieldError, validate } =
    useFormValidation(resetPasswordSchema);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleResetPassword = () => {
    const result = validate({ newPassword, confirmPassword });
    if (!result.success) return;
    if (!access_token || !refresh_token) return;

    resetMutation.mutate({
      accessToken: access_token,
      refreshToken: refresh_token,
      newPassword: result.data.newPassword,
    });
  };

  const errorMessage = resetMutation.error
    ? getErrorMessage(resetMutation.error)
    : null;

  const loginRoute =
    userType === "technician"
      ? "/(auth)/Technician/login"
      : "/(auth)/User/login";

  const isFormValid = newPassword.length > 0 && confirmPassword.length > 0;
  const isButtonActive = isFormValid && !resetMutation.isPending;

  // ─── Invalid Link State ─────────────────────────────────────────────────────
  if (!access_token || !refresh_token) {
    return (
      <View className="flex-1 bg-[#ebeeff]">
        <StatusBar style="dark" />

        {/* Top Bar */}
        <View className="flex-row items-center px-4 pt-6 pb-2">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          >
            <ArrowLeft size={24} color="#141118" />
          </Pressable>
        </View>

        {/* Header */}
        <View className="px-7 mt-2 mb-6">
          <Text className="text-[26px] font-bold text-[#141118] mb-2">
            Invalid Link
          </Text>
          <Text className="text-[15px] text-[#735f8c] leading-[22px]">
            This password reset link is invalid or has expired
          </Text>
        </View>

        {/* Icon */}
        <View className="items-center mt-6">
          <View className="h-20 w-20 rounded-full bg-red-100 items-center justify-center">
            <AlertCircle size={40} color="#ef4444" />
          </View>
          <Text className="text-[14px] text-[#735f8c] mt-4 text-center px-10 leading-[20px]">
            Please request a new password reset link from the login page.
          </Text>
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Bottom Button */}
        <View className="px-7 pb-10">
          <Pressable
            onPress={() => router.replace(loginRoute as any)}
            className="h-14 rounded-full items-center justify-center border-2 border-[#036ded] active:opacity-90"
          >
            <Text className="text-[16px] font-bold text-[#036ded]">
              Back to Login
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── Reset Password Form ────────────────────────────────────────────────────
  return (
    <KeyboardWrapper>
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* ── Top Bar ────────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-4 pt-6 pb-2">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          >
            <ArrowLeft size={24} color="#141118" />
          </Pressable>
          <View className="h-10 w-10" />
        </View>

        {/* ── Error Banner ───────────────────────────────────────────── */}
        <ErrorBanner message={errorMessage} variant="warning" />

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View className="px-7 mt-2 mb-8">
          <Text className="text-[26px] font-bold text-[#141118] mb-2">
            Reset your password
          </Text>
          <Text className="text-[15px] text-[#735f8c] leading-[22px]">
            Enter your new password below
          </Text>
        </View>

        {/* ── New Password Input ──────────────────────────────────────── */}
        <View className="px-7 mb-4">
          <PasswordInput
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              clearFieldError("newPassword");
              if (resetMutation.error) resetMutation.reset();
            }}
            placeholder="New password"
            error={fieldErrors.newPassword}
            disabled={resetMutation.isPending}
            variant="outline"
          />
        </View>

        {/* ── Confirm Password Input ──────────────────────────────────── */}
        <View className="px-7">
          <PasswordInput
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearFieldError("confirmPassword");
              if (resetMutation.error) resetMutation.reset();
            }}
            placeholder="Confirm password"
            error={fieldErrors.confirmPassword}
            disabled={resetMutation.isPending}
            variant="outline"
          />
        </View>

        {/* ── Spacer ─────────────────────────────────────────────────── */}
        <View className="flex-1" />

        {/* ── Back to Login link ──────────────────────────────────────── */}
        <View className="items-center mb-4">
          <Pressable
            onPress={() => router.replace(loginRoute as any)}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <ArrowLeft size={16} color="#735f8c" />
            <Text className="text-[14px] font-medium text-[#735f8c]">
              Back to Login
            </Text>
          </Pressable>
        </View>

        {/* ── Bottom Button ───────────────────────────────────────────── */}
        <View className="px-7 pb-10">
          <SubmitButton
            label="Reset Password"
            onPress={handleResetPassword}
            isLoading={resetMutation.isPending}
            disabled={!isButtonActive}
          />
        </View>
      </View>
    </KeyboardWrapper>
  );
}
