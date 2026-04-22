import { type Href, router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText, Text } from "@/src/components/ui/text";
import AuthFormScreen from "@/src/features/auth/components/shared/AuthFormScreen";
import InvalidResetLinkView from "@/src/features/auth/components/shared/InvalidResetLinkView";
import PasswordInput from "@/src/features/auth/components/shared/PasswordInput";
import { useResetPasswordMutation } from "@/src/features/auth/hooks/useResetPasswordMutation";
import { resetPasswordSchema } from "@/src/features/auth/schemas/form.schema";
import { getRecoverySession } from "@/src/features/auth/utils/recovery-session";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { ROUTES } from "@/src/lib/routes";
import { useThemeColors } from "@/src/lib/theme";

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
		userType === "technician" ? ROUTES.auth.techLogin : ROUTES.auth.login;

	const isFormValid = newPassword.length > 0 && confirmPassword.length > 0;
	const isButtonActive = isFormValid && !resetMutation.isPending;

	// ─── Invalid Link State ─────────────────────────────────────────────────────
	if (!accessToken || !refreshToken) {
		return <InvalidResetLinkView loginRoute={loginRoute} />;
	}

	// ─── Reset Password Form ────────────────────────────────────────────────────
	return (
		<AuthFormScreen errorMessage={errorMessage}>
			<View style={{ flex: 1 }}>
				{/* ── Header ─────────────────────────────────────────────────── */}
				<View className="mt-2 mb-8 px-screen-x">
					<Text variant="h2" className="mb-2 text-content">
						Reset your password
					</Text>
					<Text variant="body" className="text-content-secondary">
						Enter your new password below
					</Text>
				</View>

				{/* ── New Password Input ──────────────────────────────────────── */}
				<View className="mb-4 px-screen-x">
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
				<View className="px-screen-x">
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
				<View className="mb-4 items-center">
					<Pressable
						onPress={() => router.replace(loginRoute)}
						className="flex-row items-center gap-1 active:opacity-70"
					>
						<ArrowLeft size={16} color={themeColors.textSecondary} />
						<Text variant="label" className="text-content-secondary">
							Back to Login
						</Text>
					</Pressable>
				</View>

				{/* ── Bottom Button ───────────────────────────────────────────── */}
				<View
					className="px-screen-x"
					style={{ paddingBottom: insets.bottom + 16 }}
				>
					<Button onPress={handleResetPassword} disabled={!isButtonActive}>
						{resetMutation.isPending ? (
							<ActivityIndicator color={themeColors.surfaceBase} />
						) : (
							<BtnText>Reset Password</BtnText>
						)}
					</Button>
				</View>
			</View>
		</AuthFormScreen>
	);
}
