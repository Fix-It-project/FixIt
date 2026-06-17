import { router } from "expo-router";
import { Mail, Phone, User } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "@/src/components/forms/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import LoginLink from "@/src/features/auth/components/shared/LoginLink";
import OAuthDivider from "@/src/features/auth/components/shared/OAuthDivider";
import PasswordInput from "@/src/features/auth/components/shared/PasswordInput";
import { userStep1Schema } from "@/src/features/auth/schemas/form.schema";
import { useUserSignupStore } from "@/src/features/auth/stores/user-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { ROUTES } from "@/src/lib/navigation";

/**
 * Step 1 of user signup — credentials only. Address is collected on step 2.
 * Mirrors the technician two-step pattern (state carried via a zustand store).
 * Tapping "Continue with Google" branches into the OAuth flow, which routes
 * straight to step 2.
 */
export default function SignUpStep1() {
	const { t } = useTranslation("auth");
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const setStep1Data = useUserSignupStore((s) => s.setStep1Data);
	const { fieldErrors, clearFieldError, validate } =
		useFormValidation(userStep1Schema);

	const handleNext = () => {
		const result = validate({
			fullName,
			email,
			phone,
			password,
			confirmPassword,
		});
		if (!result.success) return;

		setStep1Data({
			fullName: result.data.fullName,
			email: result.data.email,
			phone: result.data.phone,
			password: result.data.password,
		});
		router.push(ROUTES.auth.signupStep2);
	};

	const isFormValid =
		fullName.trim().length > 0 &&
		email.trim().length > 0 &&
		phone.trim().length > 0 &&
		password.length > 0 &&
		confirmPassword.length > 0;

	return (
		<AuthPageLayout
			title={t("signup.step1Title")}
			subtitle={t("signup.step1Subtitle")}
		>
			<FormInput
				label={t("form.fullName")}
				value={fullName}
				onChangeText={(text) => {
					setFullName(text);
					clearFieldError("fullName");
				}}
				placeholder={t("form.fullNamePlaceholder")}
				icon={User}
				error={fieldErrors.fullName}
				required
				testID="signup-fullname-input"
			/>

			<FormInput
				label={t("form.emailAddress")}
				value={email}
				onChangeText={(text) => {
					setEmail(text);
					clearFieldError("email");
				}}
				placeholder={t("form.emailPlaceholder")}
				icon={Mail}
				error={fieldErrors.email}
				keyboardType="email-address"
				autoCapitalize="none"
				required
				testID="signup-email-input"
			/>

			<FormInput
				label={t("form.phoneNumber")}
				value={phone}
				onChangeText={(text) => {
					setPhone(text);
					clearFieldError("phone");
				}}
				placeholder={t("form.phonePlaceholder")}
				icon={Phone}
				error={fieldErrors.phone}
				keyboardType="phone-pad"
				required
				testID="signup-phone-input"
			/>

			<PasswordInput
				label={t("form.password")}
				value={password}
				onChangeText={(text) => {
					setPassword(text);
					clearFieldError("password");
				}}
				error={fieldErrors.password}
				required
				testID="signup-password-input"
			/>

			<PasswordInput
				label={t("form.confirmPassword")}
				value={confirmPassword}
				onChangeText={(text) => {
					setConfirmPassword(text);
					clearFieldError("confirmPassword");
				}}
				placeholder={t("form.confirmPasswordPlaceholder")}
				error={fieldErrors.confirmPassword}
				required
				testID="signup-confirm-password-input"
			/>

			<Button
				onPress={handleNext}
				disabled={!isFormValid}
				className="mt-stack-sm"
				testID="signup-next"
			>
				<BtnText variant="buttonLg">{t("form.continue")}</BtnText>
			</Button>

			<OAuthDivider />
			<LoginLink />
		</AuthPageLayout>
	);
}
