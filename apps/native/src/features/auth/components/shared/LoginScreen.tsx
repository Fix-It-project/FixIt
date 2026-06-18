import { type Href, router } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import FormInput from "@/src/components/forms/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";
import LoginLink from "@/src/features/auth/components/shared/LoginLink";
import OAuthDivider from "@/src/features/auth/components/shared/OAuthDivider";
import PasswordInput from "@/src/features/auth/components/shared/PasswordInput";
import { signInSchema } from "@/src/features/auth/schemas/form.schema";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/errors";
import { ROUTES } from "@/src/lib/navigation";

interface LoginMutationResult {
	mutate: (data: { email: string; password: string }) => void;
	isPending: boolean;
	error: Error | null;
	isError: boolean;
}

interface LoginScreenProps {
	readonly subtitle: string;
	readonly loginMutation: LoginMutationResult;
	readonly forgotPasswordUserType: "user" | "technician";
	readonly showOAuth?: boolean;
	readonly signupRoute: Href;
	readonly signupPrefixText?: string;
	readonly signupActionText?: string;
	readonly initialEmail?: string;
}

export default function LoginScreen({
	subtitle,
	loginMutation,
	forgotPasswordUserType,
	showOAuth = false,
	signupRoute,
	signupPrefixText,
	signupActionText,
	initialEmail,
}: LoginScreenProps) {
	const { t } = useTranslation("auth");
	const themeColors = useThemeColors();
	const [emailOrUsername, setEmailOrUsername] = useState(initialEmail ?? "");
	const [password, setPassword] = useState("");

	const { fieldErrors, clearFieldError, validate } =
		useFormValidation(signInSchema);

	const handleLogin = () => {
		const result = validate({ email: emailOrUsername, password });
		if (!result.success) return;

		loginMutation.mutate({
			email: result.data.email,
			password: result.data.password,
		});
	};

	const goToForgotPassword = useDebounce(() =>
		router.push({
			pathname: ROUTES.auth.forgotPassword,
			params: { userType: forgotPasswordUserType },
		}),
	);

	const errorMessage = loginMutation.error
		? getErrorMessage(loginMutation.error)
		: null;
	const isFormValid = emailOrUsername.trim().length > 0 && password.length > 0;

	return (
		<AuthPageLayout title={t("login.title")} subtitle={subtitle}>
			<ErrorBanner message={errorMessage} />

			<FormInput
				label={t("login.emailLabel")}
				value={emailOrUsername}
				onChangeText={(text) => {
					setEmailOrUsername(text);
					clearFieldError("email");
				}}
				placeholder={t("login.emailPlaceholder")}
				icon={Mail}
				error={fieldErrors.email}
				disabled={loginMutation.isPending}
				keyboardType="email-address"
				autoCapitalize="none"
				required
				testID="login-email-input"
			/>

			<PasswordInput
				label={t("login.passwordLabel")}
				value={password}
				onChangeText={(text) => {
					setPassword(text);
					clearFieldError("password");
				}}
				error={fieldErrors.password}
				disabled={loginMutation.isPending}
				required
				testID="login-password-input"
			/>

			{/* Forgot Password */}
			<View className="-mt-stack-md items-end">
				<Button variant="link" size="sm" onPress={goToForgotPassword}>
					{t("login.forgotPassword")}
				</Button>
			</View>

			<Button
				onPress={handleLogin}
				disabled={!isFormValid || loginMutation.isPending}
				className="mt-stack-sm"
				testID="login-submit"
			>
				{loginMutation.isPending ? (
					<ActivityIndicator color={themeColors.surfaceOnPrimary} />
				) : (
					<BtnText variant="buttonLg">{t("login.submit")}</BtnText>
				)}
			</Button>

			{showOAuth && <OAuthDivider />}

			<LoginLink
				route={signupRoute}
				prefixText={signupPrefixText}
				actionText={signupActionText}
			/>
		</AuthPageLayout>
	);
}
