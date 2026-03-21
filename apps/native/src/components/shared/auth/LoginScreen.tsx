import { router, type Href } from "expo-router";
import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { Mail } from "lucide-react-native";
import { signInSchema } from "@/src/services/auth/schemas/form.schema";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import AuthPageLayout from "@/src/components/shared/auth/AuthPageLayout";
import FormInput from "@/src/components/shared/auth/FormInput";
import PasswordInput from "@/src/components/shared/auth/PasswordInput";
import ErrorBanner from "@/src/components/shared/auth/ErrorBanner";
import OAuthDivider from "@/src/components/shared/auth/OAuthDivider";
import LoginLink from "@/src/components/shared/auth/LoginLink";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { Colors } from "@/src/lib/colors";

interface LoginMutationResult {
  mutate: (data: { email: string; password: string }) => void;
  isPending: boolean;
  error: Error | null;
  isError: boolean;
}

interface LoginScreenProps {
  subtitle: string;
  loginMutation: LoginMutationResult;
  forgotPasswordUserType: "user" | "technician";
  showOAuth?: boolean;
  signupRoute: Href;
}

export default function LoginScreen({
  subtitle,
  loginMutation,
  forgotPasswordUserType,
  showOAuth = false,
  signupRoute,
}: LoginScreenProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const { fieldErrors, clearFieldError, validate } = useFormValidation(signInSchema);

  const handleLogin = () => {
    const result = validate({ email: emailOrUsername, password });
    if (!result.success) return;

    loginMutation.mutate({ email: result.data.email, password: result.data.password });
  };

  const errorMessage = loginMutation.error ? getErrorMessage(loginMutation.error) : null;
  const isFormValid = emailOrUsername.trim().length > 0 && password.length > 0;

  return (
    <AuthPageLayout
      title="Welcome back"
      subtitle={subtitle}
    >
      <ErrorBanner message={errorMessage} />

      <FormInput
        label="Email"
        value={emailOrUsername}
        onChangeText={(text) => { setEmailOrUsername(text); clearFieldError("email"); }}
        placeholder="Enter your email"
        icon={Mail}
        error={fieldErrors.email}
        disabled={loginMutation.isPending}
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />

      <PasswordInput
        label="Password"
        value={password}
        onChangeText={(text) => { setPassword(text); clearFieldError("password"); }}
        error={fieldErrors.password}
        disabled={loginMutation.isPending}
        required
      />

      {/* Forgot Password */}
      <View className="items-end -mt-3">
        <Pressable onPress={() => router.push(`/(auth)/(forgotpassword)/forgot-password?userType=${forgotPasswordUserType}`)}>
          <Text className="text-[14px] font-medium text-content-forgot">
            Forgot Password?
          </Text>
        </Pressable>
      </View>

      <Button
        onPress={handleLogin}
        disabled={!isFormValid || loginMutation.isPending}
        className="mt-2"
      >
        {loginMutation.isPending ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <BtnText>Log in</BtnText>
        )}
      </Button>

      {showOAuth && <OAuthDivider />}

      <LoginLink route={signupRoute} />
    </AuthPageLayout>
  );
}
