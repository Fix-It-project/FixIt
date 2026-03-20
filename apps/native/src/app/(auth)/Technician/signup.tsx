import { useState } from "react";
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { techStep1Schema } from "@/src/schemas/auth-schema";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { technicianCheckEmail } from "@/src/services/auth/api/technician-auth";
import { ActivityIndicator } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/components/shared/auth/AuthPageLayout";
import FormInput from "@/src/components/shared/auth/FormInput";
import ErrorBanner from "@/src/components/shared/auth/ErrorBanner";
import LoginLink from "@/src/components/shared/auth/LoginLink";
import { Colors } from "@/src/lib/colors";

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
        required
      />

      <Button
        onPress={handleNext}
        disabled={email.trim().length === 0 || isChecking}
        className="mt-2"
      >
        {isChecking ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <BtnText>Next</BtnText>
        )}
      </Button>

      <LoginLink route="/(auth)/Technician/login" />
    </AuthPageLayout>
  );
}
