import { useState } from "react";
import { View } from "react-native";
import { forgotPasswordSchema } from "@/src/features/auth/schemas/form.schema";
import { useForgotPasswordMutation } from "@/src/hooks/auth/useForgotPasswordMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { useCooldownTimer } from "@/src/hooks/auth/useCooldownTimer";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import AuthFormScreen from "@/src/features/auth/components/shared/AuthFormScreen";
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
    <AuthFormScreen errorMessage={errorMessage}>
      <View style={{ flex: 1 }}>
        {emailSent ? (
          <CheckInboxView
            email={email}
            cooldown={cooldown}
            isResending={forgotMutation.isPending}
            onResend={handleResend}
          />
        ) : (
          <EmailEntryView
            email={email}
            setEmail={setEmail}
            fieldErrors={fieldErrors}
            clearFieldError={clearFieldError}
            mutation={forgotMutation}
            onSubmit={handleSendLink}
          />
        )}
      </View>
    </AuthFormScreen>
  );
}
