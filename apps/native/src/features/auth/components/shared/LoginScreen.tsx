import { type Href, router } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import ErrorBanner from "@/src/components/feedback/ErrorBanner";
import FormInput from "@/src/components/forms/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText, Text } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import LoginLink from "@/src/features/auth/components/shared/LoginLink";
import OAuthDivider from "@/src/features/auth/components/shared/OAuthDivider";
import PasswordInput from "@/src/features/auth/components/shared/PasswordInput";
import { signInSchema } from "@/src/features/auth/schemas/form.schema";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { ROUTES } from "@/src/lib/routes";
import { useThemeColors } from "@/src/lib/theme";

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
}

export default function LoginScreen({
	subtitle,
	loginMutation,
	forgotPasswordUserType,
	showOAuth = false,
	signupRoute,
	signupPrefixText,
	signupActionText,
}: LoginScreenProps) {
	const themeColors = useThemeColors();
	const [emailOrUsername, setEmailOrUsername] = useState("");
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
		<AuthPageLayout title="Welcome back" subtitle={subtitle}>
			<ErrorBanner message={errorMessage} />

			<FormInput
				label="Email"
				value={emailOrUsername}
				onChangeText={(text) => {
					setEmailOrUsername(text);
					clearFieldError("email");
				}}
				placeholder="Enter your email"
				icon={Mail}
				error={fieldErrors.email}
				disabled={loginMutation.isPending}
				keyboardType="email-address"
				autoCapitalize="none"
				required
			/>

			<PasswordInput
				label="Password"
				value={password}
				onChangeText={(text) => {
					setPassword(text);
					clearFieldError("password");
				}}
				error={fieldErrors.password}
				disabled={loginMutation.isPending}
				required
			/>

			{/* Forgot Password */}
			<View className="-mt-stack-md items-end">
				<Pressable onPress={goToForgotPassword}>
					<Text variant="label" className="text-app-primary">
						Forgot Password?
					</Text>
				</Pressable>
			</View>

			<Button
				onPress={handleLogin}
				disabled={!isFormValid || loginMutation.isPending}
				className="mt-stack-sm"
			>
				{loginMutation.isPending ? (
					<ActivityIndicator color={themeColors.surfaceBase} />
				) : (
					<BtnText variant="buttonLg">Log in</BtnText>
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
