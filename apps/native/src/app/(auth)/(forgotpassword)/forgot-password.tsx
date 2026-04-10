import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { forgotPasswordSchema } from "@/src/features/auth/schemas/form.schema";
import { useForgotPasswordMutation } from "@/src/hooks/auth/useForgotPasswordMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { useCooldownTimer } from "@/src/hooks/auth/useCooldownTimer";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { Colors } from "@/src/lib/colors";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";
import EmailEntryView from "@/src/features/auth/components/shared/EmailEntryView";
import CheckInboxView from "@/src/features/auth/components/shared/CheckInboxView";

const COOLDOWN_SECONDS = 30;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const forgotMutation = useForgotPasswordMutation();
  const { fieldErrors, clearFieldError, validate } =
    useFormValidation(forgotPasswordSchema);
  const { cooldown, startCooldown } = useCooldownTimer(COOLDOWN_SECONDS);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSendLink = () => {
    const result = validate({ email });
    if (!result.success) return;

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

  const errorMessage = forgotMutation.error
    ? getErrorMessage(forgotMutation.error)
    : null;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: Colors.primaryLight }}
    >
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {/* ── Top Bar ────────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-4 pt-6 pb-2">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          >
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <View className="h-10 w-10" />
        </View>

        {/* ── Error Banner ───────────────────────────────────────────── */}
        <ErrorBanner message={errorMessage} variant="warning" />

        {!emailSent ? (
          <EmailEntryView
            email={email}
            setEmail={setEmail}
            fieldErrors={fieldErrors}
            clearFieldError={clearFieldError}
            mutation={forgotMutation}
            onSubmit={handleSendLink}
          />
        ) : (
          <CheckInboxView
            email={email}
            cooldown={cooldown}
            isResending={forgotMutation.isPending}
            onResend={handleResend}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
