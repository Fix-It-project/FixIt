import { useState } from "react";
import { router } from "expo-router";
import { techStep1Schema } from "@/src/schemas/auth-schema";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import FormInput from "@/src/components/auth/FormInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";
import OAuthDivider from "@/src/components/auth/OAuthDivider";
import LoginLink from "@/src/components/auth/LoginLink";

export default function TechnicianSignUpStep1() {
  const store = useTechnicianSignupStore();
  const [email, setEmail] = useState(store.email);
  const { fieldErrors, error, clearFieldError, validate } =
    useFormValidation(techStep1Schema);

  const handleNext = () => {
    const result = validate({ email });
    if (!result.success) return;

    store.setStep1Data({ email: result.data.email });
    router.push("/(auth)/Technician/signup-step2");
  };

  return (
    <AuthPageLayout
      title="Join as a Technician."
      subtitle="Enter your email to get started with your technician account."
    >
      <ErrorBanner message={error} />

      <FormInput
        label="Email Address"
        value={email}
        onChangeText={(text) => { setEmail(text); clearFieldError("email"); }}
        placeholder="john@example.com"
        icon="mail-outline"
        error={fieldErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <SubmitButton
        label="Next"
        onPress={handleNext}
        disabled={email.trim().length === 0}
      />

      <OAuthDivider variant="signup" />
      <LoginLink route="/(auth)/Technician/login" />
    </AuthPageLayout>
  );
}
