import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/src/schemas/auth-schema";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import PasswordInput from "@/src/components/auth/PasswordInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import SubmitButton from "@/src/components/auth/SubmitButton";
import { supabase } from "@/src/lib/supabase";

export default function ResetPassword() {
  const { userType } = useLocalSearchParams<{
    userType: string;
  }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ResetPasswordFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const clearFieldError = (field: keyof ResetPasswordFormData) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (error) setError(null);
  };

  const handleResetPassword = async () => {
    setFieldErrors({});
    setError(null);

    const result = resetPasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ResetPasswordFormData;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ 
        password: result.data.newPassword 
      });

      if (updateError) throw updateError;
      
      if (data) {
        const loginRoute = userType === "technician" ? "/(auth)/Technician/login" : "/(auth)/User/login";
        router.replace(loginRoute as any);
      }
    } catch (err: any) {
      setError(err.message || "There was an error updating your password.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginRoute =
    userType === "technician" ? "/(auth)/Technician/login" : "/(auth)/User/login";

  const isFormValid = newPassword.length > 0 && confirmPassword.length > 0;

  // ─── Missing tokens = invalid link ────────────────────────────────────────
  if (!isRecoveryMode) {
    return (
      <AuthPageLayout title="Invalid Link" subtitle="This password reset link is invalid or has expired">
        <View className="items-center mt-4 mb-6">
          <View className="h-20 w-20 rounded-full bg-red-100 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          </View>
        </View>

        <Text className="text-[15px] text-[#5f738c] text-center leading-6">
          Please request a new password reset link from the login page.
        </Text>

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

  // ─── Reset Password Form ──────────────────────────────────────────────────
  return (
    <AuthPageLayout title="Reset Password" subtitle="Enter your new password below">
      <ErrorBanner message={error} />

      <PasswordInput
        label="New Password"
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          clearFieldError("newPassword");
        }}
        error={fieldErrors.newPassword}
        disabled={isLoading}
      />

      <PasswordInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          clearFieldError("confirmPassword");
        }}
        error={fieldErrors.confirmPassword}
        disabled={isLoading}
      />

      <SubmitButton
        label="Reset Password"
        onPress={handleResetPassword}
        isLoading={isLoading}
        disabled={!isFormValid}
      />

      {/* Back to login */}
      <View className="flex-row items-center justify-center mt-4">
        <Pressable
          onPress={() => router.replace(loginRoute as any)}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={16} color="#5f738c" />
          <Text className="text-[14px] font-medium text-[#5f738c]">Back to Login</Text>
        </Pressable>
      </View>
    </AuthPageLayout>
  );
}
