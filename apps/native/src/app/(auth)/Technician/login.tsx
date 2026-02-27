import { router } from "expo-router";
import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { Mail } from "lucide-react-native";
import { signInSchema } from "@/src/schemas/auth-schema";
import { useTechnicianLoginMutation } from "@/src/hooks/auth/useTechnicianLoginMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import FormInput from "@/src/components/auth/FormInput";
import PasswordInput from "@/src/components/auth/PasswordInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";

import LoginLink from "@/src/components/auth/LoginLink";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { Colors } from "@/src/lib/colors";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useTechnicianLoginMutation();
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
      subtitle="Sign in to your technician account"
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
        <Pressable onPress={() => router.push("/(auth)/(forgotpassword)/forgot-password?userType=technician")}>
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

      <LoginLink route="/(auth)/role-selection" />
    </AuthPageLayout>
  );
}
