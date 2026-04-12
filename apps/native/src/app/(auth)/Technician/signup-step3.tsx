import { useState } from "react";
import { router } from "expo-router";
import { User as UserIcon } from "lucide-react-native";
import { techStep3Schema } from "@/src/features/auth/schemas/form.schema";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import FormInput from "@/src/features/auth/components/shared/FormInput";
import PasswordInput from "@/src/features/auth/components/shared/PasswordInput";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";


export default function TechnicianSignUpStep3() {
  const store = useTechnicianSignupStore();
  const [firstName, setFirstName] = useState(store.firstName);
  const [lastName, setLastName] = useState(store.lastName);
  const [password, setPassword] = useState(store.password);
  const [confirmPassword, setConfirmPassword] = useState("");
  const { fieldErrors, error, clearFieldError, validate } =
    useFormValidation(techStep3Schema);

  const handleNext = () => {
    const result = validate({ firstName, lastName, password, confirmPassword });
    if (!result.success) return;

    store.setStep3Data({ firstName: result.data.firstName, lastName: result.data.lastName, password: result.data.password });
    router.push("/(auth)/Technician/signup-step4");
  };

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;

  return (
    <AuthPageLayout
      title="About you."
      subtitle="Tell us your name and create a secure password for your account."
    >
      <ErrorBanner message={error} />

      <FormInput
        label="First Name"
        value={firstName}
        onChangeText={(text) => { setFirstName(text); clearFieldError("firstName"); }}
        placeholder="John"
        icon={UserIcon}
        error={fieldErrors.firstName}
        required
      />

      <FormInput
        label="Last Name"
        value={lastName}
        onChangeText={(text) => { setLastName(text); clearFieldError("lastName"); }}
        placeholder="Doe"
        icon={UserIcon}
        error={fieldErrors.lastName}
        required
      />

      <PasswordInput
        label="Password"
        value={password}
        onChangeText={(text) => { setPassword(text); clearFieldError("password"); }}
        error={fieldErrors.password}
        required
      />

      <PasswordInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => { setConfirmPassword(text); clearFieldError("confirmPassword"); }}
        placeholder="Re-enter your password"
        error={fieldErrors.confirmPassword}
        required
      />

      <Button
        onPress={handleNext}
        disabled={!isFormValid}
        className="mt-2"
      >
        <BtnText>Next</BtnText>
      </Button>

    </AuthPageLayout>
  );
}
