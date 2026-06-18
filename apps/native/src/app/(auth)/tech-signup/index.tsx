import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import FormInput from "@/src/components/forms/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { technicianCheckEmail } from "@/src/features/auth/api/technician-auth";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";
import LoginLink from "@/src/features/auth/components/shared/LoginLink";
import { techStep1Schema } from "@/src/features/auth/schemas/form.schema";
import { useTechnicianSignupStore } from "@/src/features/auth/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { ROUTES } from "@/src/lib/navigation";

export default function TechnicianSignUpStep1() {
	const { t } = useTranslation("auth");
	const themeColors = useThemeColors();
	const store = useTechnicianSignupStore();
	const [email, setEmail] = useState(store.email);
	const [isChecking, setIsChecking] = useState(false);
	const { fieldErrors, error, setError, clearFieldError, validate } =
		useFormValidation(techStep1Schema);

	const handleNext = async () => {
		const result = validate({ email });
		if (!result.success) return;

		// Check if the email is already taken
		setIsChecking(true);
		try {
			const { exists } = await technicianCheckEmail({
				email: result.data.email,
			});
			if (exists) {
				setError(t("techSignup.emailExists"));
				return;
			}

			store.setStep1Data({ email: result.data.email });
			router.push(ROUTES.auth.techSignupStep(2));
		} catch {
			setError(t("techSignup.emailCheckFailed"));
		} finally {
			setIsChecking(false);
		}
	};

	return (
		<AuthPageLayout
			title={t("techSignup.step1Title")}
			subtitle={t("techSignup.step1Subtitle")}
		>
			<ErrorBanner message={error} />

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
				disabled={isChecking}
				required
			/>

			<Button
				onPress={handleNext}
				disabled={email.trim().length === 0 || isChecking}
				className="mt-stack-sm"
			>
				{isChecking ? (
					<ActivityIndicator color={themeColors.surfaceOnPrimary} />
				) : (
					<BtnText variant="buttonLg">{t("form.next")}</BtnText>
				)}
			</Button>

			<LoginLink route={ROUTES.auth.techLogin} />
		</AuthPageLayout>
	);
}
