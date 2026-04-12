import { router, type Href } from "expo-router";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { resetPasswordSchema } from "@/src/features/auth/schemas/form.schema";
import { useResetPasswordMutation } from "@/src/hooks/auth/useResetPasswordMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { useThemeColors } from "@/src/lib/theme";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";
import InvalidResetLinkView from "@/src/features/auth/components/shared/InvalidResetLinkView";
import PasswordInput from "@/src/features/auth/components/shared/PasswordInput";
import { getRecoverySession } from "@/src/lib/auth/recovery-session";

export default function ResetPassword() {
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();
	const recoverySession = getRecoverySession();
	const accessToken = recoverySession?.accessToken;
	const refreshToken = recoverySession?.refreshToken;
	const userType = recoverySession?.userType ?? "user";

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

  const resetMutation = useResetPasswordMutation(userType ?? "user");
  const { fieldErrors, clearFieldError, validate } =
    useFormValidation(resetPasswordSchema);

  // ─── Handlers ───────────────────────────────────────────────────────────────
	const handleResetPassword = () => {
		const result = validate({ newPassword, confirmPassword });
		if (!result.success) return;
		if (!accessToken || !refreshToken) return;

		resetMutation.mutate({
			accessToken,
			refreshToken,
			newPassword: result.data.newPassword,
		});
	};

  const errorMessage = resetMutation.error
    ? getErrorMessage(resetMutation.error)
    : null;

  const loginRoute: Href =
    userType === "technician"
      ? "/(auth)/Technician/login"
      : "/(auth)/User/login";

  const isFormValid = newPassword.length > 0 && confirmPassword.length > 0;
  const isButtonActive = isFormValid && !resetMutation.isPending;

  // ─── Invalid Link State ─────────────────────────────────────────────────────
	if (!accessToken || !refreshToken) {
		return <InvalidResetLinkView loginRoute={loginRoute} />;
	}

  // ─── Reset Password Form ────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-app-primary-light"
    >
      <View style={{ flex: 1 }}>
        {/* ── Top Bar ────────────────────────────────────────────────── */}
        <View
          className="flex-row items-center justify-between px-4 pb-2"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          >
            <ArrowLeft size={24} color={themeColors.textPrimary} />
          </Pressable>
          <View className="h-10 w-10" />
        </View>

        {/* ── Error Banner ───────────────────────────────────────────── */}
        <ErrorBanner message={errorMessage} variant="warning" />

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View className="px-7 mt-2 mb-8">
          <Text className="text-[26px] font-bold text-content mb-2">
            Reset your password
          </Text>
          <Text className="text-[15px] text-content-secondary leading-[22px]">
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
            required
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
            required
          />
        </View>

        {/* ── Spacer ─────────────────────────────────────────────────── */}
        <View style={{ flex: 1 }} />

        {/* ── Back to Login link ──────────────────────────────────────── */}
        <View className="items-center mb-4">
          <Pressable
            onPress={() => router.replace(loginRoute)}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <ArrowLeft size={16} color={themeColors.textSecondary} />
            <Text className="text-[14px] font-medium text-content-secondary">
              Back to Login
            </Text>
          </Pressable>
        </View>

        {/* ── Bottom Button ───────────────────────────────────────────── */}
        <View className="px-7" style={{ paddingBottom: insets.bottom + 16 }}>
          <Button onPress={handleResetPassword} disabled={!isButtonActive}>
            {resetMutation.isPending ? (
              <ActivityIndicator color={themeColors.surfaceBase} />
            ) : (
              <BtnText>Reset Password</BtnText>
            )}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
