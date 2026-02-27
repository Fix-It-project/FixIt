import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { MapPin, Navigation, Building2, Home } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { techStep5Schema, type TechStep5Data } from "@/src/schemas/auth-schema";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { useTechnicianSignUpMutation } from "@/src/hooks/auth/useTechnicianSignUpMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import FormInput from "@/src/components/auth/FormInput";
import DocumentUploadField from "@/src/components/auth/DocumentUploadField";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { Colors } from "@/src/lib/colors";


export default function TechnicianSignUpStep5() {
  const store = useTechnicianSignupStore();
  const [nationalId, setNationalId] = useState(store.nationalId);
  const [criminalRecord, setCriminalRecord] = useState(store.criminalRecord);
  const [certificate, setCertificate] = useState(store.certificate);
  const [city, setCity] = useState(store.city);
  const [address, setAddress] = useState(store.address);
  const [buildingNumber, setBuildingNumber] = useState(store.buildingNumber);
  const [apartmentNumber, setApartmentNumber] = useState(store.apartmentNumber);

  const signUpMutation = useTechnicianSignUpMutation();
  const { fieldErrors, error, clearFieldError, validate } =
    useFormValidation(techStep5Schema);

  const pickImage = async (
    setter: (uri: string) => void,
    field: keyof TechStep5Data
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

  const handleSubmit = () => {
    const result = validate({ nationalId, criminalRecord, certificate, city, address, buildingNumber, apartmentNumber });
    if (!result.success) return;

    store.setStep5Data(result.data);

    const { firstName, lastName, email, phone, password, categories } =
      useTechnicianSignupStore.getState();

    signUpMutation.mutate({
      email,
      password,
      firstName,
      lastName,
      phone,
      categoryId: categories[0] ?? "",
      city,
      street: address,
      buildingNumber,
      apartmentNumber,
      nationalIdUri: nationalId,
      criminalRecordUri: criminalRecord,
      certificateUri: certificate,
    });
  };

  const errorMessage = signUpMutation.error
    ? getErrorMessage(signUpMutation.error)
    : error;

  const isFormValid =
    nationalId.length > 0 &&
    criminalRecord.length > 0 &&
    certificate.length > 0 &&
    city.trim().length > 0 &&
    address.trim().length > 0 &&
    buildingNumber.trim().length > 0 &&
    apartmentNumber.trim().length > 0;

  return (
    <AuthPageLayout
      title="Required Documents"
      subtitle="Please upload the following documents and provide your location details."
    >
      <ErrorBanner message={errorMessage} />

      <DocumentUploadField
        label="National ID"
        value={nationalId}
        onPick={() => pickImage(setNationalId, "nationalId")}
        error={fieldErrors.nationalId}
        required
      />

      <DocumentUploadField
        label="Criminal Record"
        value={criminalRecord}
        onPick={() => pickImage(setCriminalRecord, "criminalRecord")}
        error={fieldErrors.criminalRecord}
        required
      />

      <DocumentUploadField
        label="Certificate"
        value={certificate}
        onPick={() => pickImage(setCertificate, "certificate")}
        error={fieldErrors.certificate}
        required
      />

      <FormInput
        label="City"
        value={city}
        onChangeText={(text) => { setCity(text); clearFieldError("city"); }}
        placeholder="e.g. Cairo"
        icon={MapPin}
        error={fieldErrors.city}
        disabled={signUpMutation.isPending}
        required
      />

      <FormInput
        label="Address"
        value={address}
        onChangeText={(text) => { setAddress(text); clearFieldError("address"); }}
        placeholder="Street address or area"
        icon={Navigation}
        error={fieldErrors.address}
        disabled={signUpMutation.isPending}
        required
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormInput
            label="Building No."
            value={buildingNumber}
            onChangeText={(text) => { setBuildingNumber(text); clearFieldError("buildingNumber"); }}
            placeholder="e.g. 12"
            icon={Building2}
            error={fieldErrors.buildingNumber}
            disabled={signUpMutation.isPending}
            keyboardType="numeric"
            required
          />
        </View>
        <View className="flex-1">
          <FormInput
            label="Apartment No."
            value={apartmentNumber}
            onChangeText={(text) => { setApartmentNumber(text); clearFieldError("apartmentNumber"); }}
            placeholder="e.g. 5A"
            icon={Home}
            error={fieldErrors.apartmentNumber}
            disabled={signUpMutation.isPending}
            required
          />
        </View>
      </View>

      <Button
        onPress={handleSubmit}
        disabled={!isFormValid || signUpMutation.isPending}
        className="mt-2"
      >
        {signUpMutation.isPending ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <BtnText>Apply as Technician</BtnText>
        )}
      </Button>

    </AuthPageLayout>
  );
}
