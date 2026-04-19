import { View, Text, ActivityIndicator } from "react-native";
import FormInput from "@/src/components/forms/FormInput";
import type { useForgotPasswordMutation } from "@/src/features/auth/hooks/useForgotPasswordMutation";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { Mail } from "lucide-react-native";
import { Colors } from "@/src/lib/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface EmailEntryViewProps {
  readonly email: string;
  readonly setEmail: (text: string) => void;
  readonly fieldErrors: Record<string, string | undefined>;
  readonly clearFieldError: (field: string) => void;
  readonly mutation: ReturnType<typeof useForgotPasswordMutation>;
  readonly onSubmit: () => void;
}

export default function EmailEntryView({
  email,
  setEmail,
  fieldErrors,
  clearFieldError,
  mutation,
  onSubmit,
}: EmailEntryViewProps) {
  const insets = useSafeAreaInsets();
  const isButtonActive = email.trim().length > 0 && !mutation.isPending;

  return (
    <>
      {/* Header */}
      <View className="px-7 mt-2 mb-8">
        <Text className="text-[26px] font-bold text-content mb-2">
          Reset your password
        </Text>
        <Text className="text-[15px] text-content-secondary leading-[22px]">
          Enter your email address and we'll send you a link to reset your
          password
        </Text>
      </View>

      {/* Email Input */}
      <View className="px-7">
        <FormInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearFieldError("email");
            if (mutation.error) mutation.reset();
          }}
          placeholder="Email address"
          icon={Mail}
          error={fieldErrors.email}
          disabled={mutation.isPending}
          variant="outline"
          clearable
          onClear={() => setEmail("")}
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />
      </View>

      {/* Spacer */}
      <View className="flex-1" />

      {/* Bottom Button */}
      <View className="px-7" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button onPress={onSubmit} disabled={!isButtonActive}>
          {mutation.isPending ? (
            <ActivityIndicator color={Colors.surfaceBase} />
          ) : (
            <BtnText>Reset Password</BtnText>
          )}
        </Button>
      </View>
    </>
  );
}
