import { useState } from "react";
import { signUpSchema, type SignUpFormData } from "@/src/schemas/auth-schema";
import { useSignUpMutation } from "@/src/hooks/useSignUpMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import FormInput from "@/src/components/auth/FormInput";
import PasswordInput from "@/src/components/auth/PasswordInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";
import OAuthDivider from "@/src/components/auth/OAuthDivider";
import LoginLink from "@/src/components/auth/LoginLink";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signUpMutation = useSignUpMutation();
  const { fieldErrors, clearFieldError, validate } =
    useFormValidation(signUpSchema);

  const handleSignUp = () => {
    const result = validate({ fullName, email, phone, password, confirmPassword });
    if (!result.success) return;

    signUpMutation.mutate({
      email: result.data.email,
      password: result.data.password,
      fullName: result.data.fullName,
      phone: result.data.phone,
    });
  };

  const errorMessage = signUpMutation.error ? getErrorMessage(signUpMutation.error) : null;

  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;

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
        icon="person-outline"
        error={fieldErrors.fullName}
        disabled={signUpMutation.isPending}
      />

      <FormInput
        label="Email Address"
        value={email}
        onChangeText={(text) => { setEmail(text); clearFieldError("email"); }}
        placeholder="john@example.com"
        icon="mail-outline"
        error={fieldErrors.email}
        disabled={signUpMutation.isPending}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormInput
        label="Phone Number"
        value={phone}
        onChangeText={(text) => { setPhone(text); clearFieldError("phone"); }}
        placeholder="(555) 123-4567"
        icon="call-outline"
        error={fieldErrors.phone}
        disabled={signUpMutation.isPending}
        keyboardType="phone-pad"
      />

      <PasswordInput
        label="Password"
        value={password}
        onChangeText={(text) => { setPassword(text); clearFieldError("password"); }}
        error={fieldErrors.password}
        disabled={signUpMutation.isPending}
      />

      <PasswordInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => { setConfirmPassword(text); clearFieldError("confirmPassword"); }}
        placeholder="Re-enter your password"
        error={fieldErrors.confirmPassword}
        disabled={signUpMutation.isPending}
      />

      <SubmitButton
        label="Sign Up"
        onPress={handleSignUp}
        isLoading={signUpMutation.isPending}
        disabled={!isFormValid}
      />

      <OAuthDivider />
      <LoginLink route="/(auth)/User/login" />
    </AuthPageLayout>
  );
}
