import { useState } from "react";
import { router } from "expo-router";
import { techStep3Schema } from "@/src/schemas/auth-schema";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import FormInput from "@/src/components/auth/FormInput";
import PasswordInput from "@/src/components/auth/PasswordInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";


export default function TechnicianSignUpStep3() {
  const store = useTechnicianSignupStore();
  const [firstName, setFirstName] = useState(store.firstName);
  const [lastName, setLastName] = useState(store.lastName);
  const [password, setPassword] = useState(store.password);
  const [confirmPassword, setConfirmPassword] = useState(store.confirmPassword);
  const { fieldErrors, error, clearFieldError, validate } =
    useFormValidation(techStep3Schema);

  const handleNext = () => {
    const result = validate({ firstName, lastName, password, confirmPassword });
    if (!result.success) return;

    store.setStep3Data(result.data);
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
        icon="person-outline"
        error={fieldErrors.firstName}
      />

      <FormInput
        label="Last Name"
        value={lastName}
        onChangeText={(text) => { setLastName(text); clearFieldError("lastName"); }}
        placeholder="Doe"
        icon="person-outline"
        error={fieldErrors.lastName}
      />

      <PasswordInput
        label="Password"
        value={password}
        onChangeText={(text) => { setPassword(text); clearFieldError("password"); }}
        error={fieldErrors.password}
      />

      <PasswordInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => { setConfirmPassword(text); clearFieldError("confirmPassword"); }}
        placeholder="Re-enter your password"
        error={fieldErrors.confirmPassword}
      />

      <SubmitButton
        label="Next"
        onPress={handleNext}
        disabled={!isFormValid}
      />

    </AuthPageLayout>
  );
}
