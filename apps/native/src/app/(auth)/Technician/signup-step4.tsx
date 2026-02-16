import { useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { techStep4Schema, type TechStep4Data } from "@/src/schemas/auth-schema";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { signUp } from "@/src/services/auth/api/auth";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import FormInput from "@/src/components/auth/FormInput";
import DocumentUploadField from "@/src/components/auth/DocumentUploadField";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";


export default function TechnicianSignUpStep4() {
  const store = useTechnicianSignupStore();
  const [nationalId, setNationalId] = useState(store.nationalId);
  const [criminalRecord, setCriminalRecord] = useState(store.criminalRecord);
  const [certificate, setCertificate] = useState(store.certificate);
  const [city, setCity] = useState(store.city);
  const [address, setAddress] = useState(store.address);
  const [isLoading, setIsLoading] = useState(false);
  const { fieldErrors, error, setError, clearFieldError, validate } =
    useFormValidation(techStep4Schema);

  const pickImage = async (
    setter: (uri: string) => void,
    field: keyof TechStep4Data
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
      clearFieldError(field);
    }
  };

  const handleSubmit = async () => {
    const result = validate({ nationalId, criminalRecord, certificate, city, address });
    if (!result.success) return;

    store.setStep4Data(result.data);

    const { firstName, lastName, email, phone, password } =
      useTechnicianSignupStore.getState();

    setIsLoading(true);
    try {
      const response = await signUp({
        email,
        password,
        fullName: `${firstName} ${lastName}`,
        phone,
        address: `${city}, ${address}`,
      });

      store.reset();

      Alert.alert(
        "Application Submitted!",
        response.message ||
          "Your technician account has been created. Please sign in to continue.",
        [{ text: "Sign In", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    nationalId.length > 0 &&
    criminalRecord.length > 0 &&
    certificate.length > 0 &&
    city.trim().length > 0 &&
    address.trim().length > 0;

  return (
    <AuthPageLayout
      title="Required Documents"
      subtitle="Please upload the following documents and provide your location details."
    >
      <ErrorBanner message={error} />

      <DocumentUploadField
        label="National ID"
        value={nationalId}
        onPick={() => pickImage(setNationalId, "nationalId")}
        error={fieldErrors.nationalId}
      />

      <DocumentUploadField
        label="Criminal Record"
        value={criminalRecord}
        onPick={() => pickImage(setCriminalRecord, "criminalRecord")}
        error={fieldErrors.criminalRecord}
      />

      <DocumentUploadField
        label="Certificate"
        value={certificate}
        onPick={() => pickImage(setCertificate, "certificate")}
        error={fieldErrors.certificate}
      />

      <FormInput
        label="City"
        value={city}
        onChangeText={(text) => { setCity(text); clearFieldError("city"); }}
        placeholder="e.g. Cairo"
        icon="location-outline"
        error={fieldErrors.city}
        disabled={isLoading}
      />

      <FormInput
        label="Address"
        value={address}
        onChangeText={(text) => { setAddress(text); clearFieldError("address"); }}
        placeholder="Street address or area"
        icon="navigate-outline"
        error={fieldErrors.address}
        disabled={isLoading}
      />

      <SubmitButton
        label="Apply as Technician"
        onPress={handleSubmit}
        isLoading={isLoading}
        disabled={!isFormValid}
      />

    </AuthPageLayout>
  );
}
