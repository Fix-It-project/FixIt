import { useState } from "react";
import { router } from "expo-router";
import { Phone } from "lucide-react-native";
import { techStep2Schema } from "@/src/features/auth/schemas/form.schema";
import { useTechnicianSignupStore } from "@/src/features/auth/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import ErrorBanner from "@/src/components/feedback/ErrorBanner";
import FormInput from "@/src/components/forms/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import { ROUTES } from "@/src/lib/routes";


export default function TechnicianSignUpStep2() {
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
      title="Your phone number."
      subtitle="We'll use this to reach you about service requests and updates."
    >
      <ErrorBanner message={error} />

      <FormInput
        label="Phone Number"
        value={phone}
        onChangeText={(text) => { setPhone(text); clearFieldError("phone"); }}
        placeholder="(555) 123-4567"
        icon={Phone}
        error={fieldErrors.phone}
        keyboardType="phone-pad"
        required
      />

      <Button
        onPress={handleNext}
        disabled={phone.trim().length === 0}
        className="mt-2"
      >
        <BtnText>Next</BtnText>
      </Button>

    </AuthPageLayout>
  );
}
