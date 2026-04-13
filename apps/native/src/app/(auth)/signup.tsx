import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { User, Mail, Phone } from "lucide-react-native";
import { signUpSchema } from "@/src/features/auth/schemas/form.schema";
import { useSignUpMutation } from "@/src/hooks/auth/useSignUpMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { useLocationStore } from "@/src/stores/location-store";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import FormInput from "@/src/features/auth/components/shared/FormInput";
import AddressFormSection from "@/src/components/AddressFormSection";
import PasswordInput from "@/src/features/auth/components/shared/PasswordInput";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";

import OAuthDivider from "@/src/features/auth/components/shared/OAuthDivider";
import LoginLink from "@/src/features/auth/components/shared/LoginLink";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { useThemeColors } from "@/src/lib/theme";

export default function SignUp() {
  const themeColors = useThemeColors();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");

  const { location } = useLocationStore();

  const signUpMutation = useSignUpMutation();
  const { fieldErrors, clearFieldError, validate } =
    useFormValidation(signUpSchema);

  const handleSignUp = () => {
    const result = validate({ 
      fullName, email, phone, password, confirmPassword,
      city, street, buildingNumber, apartmentNumber,
    });
    if (!result.success) return;

    signUpMutation.mutate({
      fullName: result.data.fullName,
      email: result.data.email,
      phone: result.data.phone,
      password: result.data.password,
      city: result.data.city,
      street: result.data.street,
      building_no: result.data.buildingNumber ?? "",
      apartment_no: result.data.apartmentNumber ?? "",
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    });
  };

  const errorMessage = signUpMutation.error ? getErrorMessage(signUpMutation.error) : null;

  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    city.trim().length > 0 &&
    street.trim().length > 0;

  return (
    <AuthPageLayout
      title="Let's get it fixed."
      subtitle="Create an account to connect with top-rated technicians nearby."
    >
      <ErrorBanner message={errorMessage} />

      <FormInput
        label="Full Name"
        value={fullName}
        onChangeText={(text) => { setFullName(text); clearFieldError("fullName"); }}
        placeholder="John Doe"
        icon={User}
        error={fieldErrors.fullName}
        disabled={signUpMutation.isPending}
        required
      />

      <FormInput
        label="Email Address"
        value={email}
        onChangeText={(text) => { setEmail(text); clearFieldError("email"); }}
        placeholder="john@example.com"
        icon={Mail}
        error={fieldErrors.email}
        disabled={signUpMutation.isPending}
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />

      <FormInput
        label="Phone Number"
        value={phone}
        onChangeText={(text) => { setPhone(text); clearFieldError("phone"); }}
        placeholder="(555) 123-4567"
        icon={Phone}
        error={fieldErrors.phone}
        disabled={signUpMutation.isPending}
        keyboardType="phone-pad"
        required
      />

      <PasswordInput
        label="Password"
        value={password}
        onChangeText={(text) => { setPassword(text); clearFieldError("password"); }}
        error={fieldErrors.password}
        disabled={signUpMutation.isPending}
        required
      />

      <PasswordInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => { setConfirmPassword(text); clearFieldError("confirmPassword"); }}
        placeholder="Re-enter your password"
        error={fieldErrors.confirmPassword}
        disabled={signUpMutation.isPending}
        required
      />

      <AddressFormSection
        city={city}
        onCityChange={(text) => { setCity(text); clearFieldError("city"); }}
        street={street}
        onStreetChange={(text) => { setStreet(text); clearFieldError("street"); }}
        buildingNumber={buildingNumber}
        onBuildingNumberChange={(text) => { setBuildingNumber(text); clearFieldError("buildingNumber"); }}
        apartmentNumber={apartmentNumber}
        onApartmentNumberChange={(text) => { setApartmentNumber(text); clearFieldError("apartmentNumber"); }}
        errors={{
          city: fieldErrors.city,
          street: fieldErrors.street,
          buildingNumber: fieldErrors.buildingNumber,
          apartmentNumber: fieldErrors.apartmentNumber,
        }}
        disabled={signUpMutation.isPending}
      />

      <Button
        onPress={handleSignUp}
        disabled={!isFormValid || signUpMutation.isPending}
        className="mt-2"
      >
        {signUpMutation.isPending ? (
          <ActivityIndicator color={themeColors.surfaceBase} />
        ) : (
          <BtnText>Sign Up</BtnText>
        )}
      </Button>

      <OAuthDivider />
      <LoginLink />
    </AuthPageLayout>
  );
}
