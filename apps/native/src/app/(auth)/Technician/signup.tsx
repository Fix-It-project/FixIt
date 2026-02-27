import { useState } from "react";
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { techStep1Schema } from "@/src/schemas/auth-schema";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { technicianCheckEmail } from "@/src/services/auth/api/technician-auth";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import FormInput from "@/src/components/auth/FormInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";
import LoginLink from "@/src/components/auth/LoginLink";

export default function TechnicianSignUpStep1() {
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
      const { exists } = await technicianCheckEmail({ email: result.data.email });
      if (exists) {
        setError("A technician with this email already exists. Please sign in instead.");
        return;
      }

      store.setStep1Data({ email: result.data.email });
      router.push("/(auth)/Technician/signup-step2");
    } catch {
      setError("Could not verify email. Please try again.");
    } finally {
      setIsChecking(false);
    }
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
        icon={Mail}
        error={fieldErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={isChecking}
      />

      <SubmitButton
        label="Next"
        onPress={handleNext}
        isLoading={isChecking}
        disabled={email.trim().length === 0}
      />

      <LoginLink route="/(auth)/Technician/login" />
    </AuthPageLayout>
  );
}
