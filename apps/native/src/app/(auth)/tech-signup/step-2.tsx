import { router } from "expo-router";
import { Phone } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "@/src/components/forms/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";
import { techStep2Schema } from "@/src/features/auth/schemas/form.schema";
import { useTechnicianSignupStore } from "@/src/features/auth/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { ROUTES } from "@/src/lib/navigation";

export default function TechnicianSignUpStep2() {
	const { t } = useTranslation("auth");
	const store = useTechnicianSignupStore();
	const [phone, setPhone] = useState(store.phone);
	const { fieldErrors, error, clearFieldError, validate } =
		useFormValidation(techStep2Schema);

	const handleNext = () => {
		const result = validate({ phone });
		if (!result.success) return;

		store.setStep2Data({ phone: result.data.phone });
		router.push(ROUTES.auth.techSignupStep(3));
	};

	return (
		<AuthPageLayout
			title={t("techSignup.step2Title")}
			subtitle={t("techSignup.step2Subtitle")}
		>
			<ErrorBanner message={error} />

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
			/>

			<Button
				onPress={handleNext}
				disabled={phone.trim().length === 0}
				className="mt-stack-sm"
			>
				<BtnText variant="buttonLg">{t("form.next")}</BtnText>
			</Button>
		</AuthPageLayout>
	);
}
