import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/src/schemas/auth-schema";
import { useForgotPasswordMutation } from "@/src/hooks/useForgotPasswordMutation";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import FormInput from "@/src/components/auth/FormInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";

const COOLDOWN_SECONDS = 60;

export default function ForgotPassword() {
  const { userType } = useLocalSearchParams<{ userType: string }>();
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const forgotMutation = useForgotPasswordMutation();

  // Manage the cooldown timer
  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const clearFieldError = (field: keyof ForgotPasswordFormData) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (forgotMutation.error) forgotMutation.reset();
  };

  const handleSendLink = () => {
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const errors: Partial<Record<keyof ForgotPasswordFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ForgotPasswordFormData;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    forgotMutation.mutate(
      { email: result.data.email },
      {
        onSuccess: () => {
          setEmailSent(true);
          startCooldown();
        },
      },
    );
  };

  const handleResend = () => {
    forgotMutation.reset();
    forgotMutation.mutate(
      { email },
      {
        onSuccess: () => {
          startCooldown();
        },
      },
    );
  };

  const errorMessage = forgotMutation.error ? getErrorMessage(forgotMutation.error) : null;

  const loginRoute =
    userType === "technician" ? "/(auth)/Technician/login" : "/(auth)/User/login";

  // ─── Success State ─────────────────────────────────────────────────────────
  if (emailSent) {
    return (
      <AuthPageLayout title="Check Your Email" subtitle="We've sent a password reset link to your email">
        {/* Success icon */}
        <View className="items-center mt-4 mb-6">
          <View className="h-20 w-20 rounded-full bg-[#036ded]/10 items-center justify-center">
            <Ionicons name="mail-open-outline" size={40} color="#036ded" />
          </View>
        </View>

        <Text className="text-[15px] text-[#5f738c] text-center leading-6">
          We sent a reset link to{" "}
          <Text className="font-bold text-[#111418]">{email}</Text>.
          {"\n"}Check your inbox and tap the link to reset your password.
        </Text>

        {/* Resend section */}
        <View className="items-center mt-6">
          {cooldown > 0 ? (
            <Text className="text-[14px] text-[#5f738c]">
              Resend available in {cooldown}s
            </Text>
          ) : (
            <Pressable
              onPress={handleResend}
              disabled={forgotMutation.isPending}
              className="active:opacity-70"
            >
              <Text className="text-[14px] font-bold text-[#036ded]">
                {forgotMutation.isPending ? "Sending..." : "Resend Email"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Error on resend */}
        {errorMessage && (
          <View className="mt-4">
            <ErrorBanner message={errorMessage} />
          </View>
        )}

        {/* Back to login */}
        <View className="mt-8">
          <Pressable
            onPress={() => router.replace(loginRoute as any)}
            className="h-14 rounded-full items-center justify-center border-2 border-[#036ded]"
          >
            <Text className="text-[16px] font-bold text-[#036ded]">Back to Login</Text>
          </Pressable>
        </View>
      </AuthPageLayout>
    );
  }

  // ─── Email Form State ──────────────────────────────────────────────────────
  return (
    <AuthPageLayout title="Forgot Password?" subtitle="Enter your email and we'll send you a reset link">
      <ErrorBanner message={errorMessage} />

      <FormInput
        label="Email Address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          clearFieldError("email");
        }}
        placeholder="Enter your email"
        icon="mail-outline"
        error={fieldErrors.email}
        disabled={forgotMutation.isPending}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <SubmitButton
        label="Send Reset Link"
        onPress={handleSendLink}
        isLoading={forgotMutation.isPending}
        disabled={email.trim().length === 0}
      />

      {/* Back to login */}
      <View className="flex-row items-center justify-center mt-4">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={16} color="#5f738c" />
          <Text className="text-[14px] font-medium text-[#5f738c]">Back to Login</Text>
        </Pressable>
      </View>
    </AuthPageLayout>
  );
}
