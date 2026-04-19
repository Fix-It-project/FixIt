import { useState } from "react";
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { techStep1Schema } from "@/src/features/auth/schemas/form.schema";
import { useTechnicianSignupStore } from "@/src/features/auth/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { technicianCheckEmail } from "@/src/features/auth/api/technician-auth";
import { ActivityIndicator } from "react-native";
import ErrorBanner from "@/src/components/feedback/ErrorBanner";
import FormInput from "@/src/components/forms/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import LoginLink from "@/src/features/auth/components/shared/LoginLink";
import { useThemeColors } from "@/src/lib/theme";
import { ROUTES } from "@/src/lib/routes";

export default function TechnicianSignUpStep1() {
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
      const { exists } = await technicianCheckEmail({ email: result.data.email });
      if (exists) {
        setError("A technician with this email already exists. Please sign in instead.");
        return;
      }

      store.setStep1Data({ email: result.data.email });
      router.push(ROUTES.auth.techSignupStep(2));
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
        required
      />

      <Button
        onPress={handleNext}
        disabled={email.trim().length === 0 || isChecking}
        className="mt-2"
      >
        {isChecking ? (
          <ActivityIndicator color={themeColors.surfaceBase} />
        ) : (
          <BtnText>Next</BtnText>
        )}
      </Button>

      <LoginLink route={ROUTES.auth.techLogin} />
    </AuthPageLayout>
  );
}
