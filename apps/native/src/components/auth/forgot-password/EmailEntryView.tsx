import { View, Text } from "react-native";
import type { useForgotPasswordMutation } from "@/src/hooks/useForgotPasswordMutation";
import FormInput from "@/src/components/auth/FormInput";
import SubmitButton from "@/src/components/auth/SubmitButton";
import { Mail } from "lucide-react-native";

interface EmailEntryViewProps {
  email: string;
  setEmail: (text: string) => void;
  fieldErrors: Record<string, string | undefined>;
  clearFieldError: (field: string) => void;
  mutation: ReturnType<typeof useForgotPasswordMutation>;
  onSubmit: () => void;
}

export default function EmailEntryView({
  email,
  setEmail,
  fieldErrors,
  clearFieldError,
  mutation,
  onSubmit,
}: EmailEntryViewProps) {
  const isButtonActive = email.trim().length > 0 && !mutation.isPending;

  return (
    <>
      {/* Header */}
      <View className="px-7 mt-2 mb-8">
        <Text className="text-[26px] font-bold text-[#141118] mb-2">
          Reset your password
        </Text>
        <Text className="text-[15px] text-[#735f8c] leading-[22px]">
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
        />
      </View>

      {/* Spacer */}
      <View className="flex-1" />

      {/* Bottom Button */}
      <View className="px-7 pb-10">
        <SubmitButton
          label="Reset Password"
          onPress={onSubmit}
          isLoading={mutation.isPending}
          disabled={!isButtonActive}
        />
      </View>
    </>
  );
}
