import { useState } from "react";
import { router } from "expo-router";
import { techStep2Schema } from "@/src/schemas/auth-schema";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import FormInput from "@/src/components/auth/FormInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";


export default function TechnicianSignUpStep2() {
  const store = useTechnicianSignupStore();
  const [phone, setPhone] = useState(store.phone);
  const { fieldErrors, error, clearFieldError, validate } =
    useFormValidation(techStep2Schema);

  const handleNext = () => {
    const result = validate({ phone });
    if (!result.success) return;

    store.setStep2Data({ phone: result.data.phone });
    router.push("/(auth)/Technician/signup-step3");
  };

  return (
    <AuthPageLayout
      title="Your phone number."
      subtitle="We'll use this to reach you about service requests and updates."
    >
      <ErrorBanner message={error} />

      <FormInput
        label="Phone Number"
        value={phone}
        onChangeText={(text) => { setPhone(text); clearFieldError("phone"); }}
        placeholder="(555) 123-4567"
        icon="call-outline"
        error={fieldErrors.phone}
        keyboardType="phone-pad"
      />

      <SubmitButton
        label="Next"
        onPress={handleNext}
        disabled={phone.trim().length === 0}
      />

    </AuthPageLayout>
  );
}
