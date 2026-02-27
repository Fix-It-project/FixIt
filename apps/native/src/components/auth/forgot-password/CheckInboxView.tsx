import { View, Text, Pressable, Linking } from "react-native";
import SubmitButton from "@/src/components/auth/SubmitButton";

interface CheckInboxViewProps {
  email: string;
  cooldown: number;
  isResending: boolean;
  onResend: () => void;
}

export default function CheckInboxView({
  email,
  cooldown,
  isResending,
  onResend,
}: CheckInboxViewProps) {
  return (
    <>
      {/* Header */}
      <View className="px-7 mt-2 mb-4">
        <Text className="text-[26px] font-bold text-[#141118] mb-2">
          Check your inbox
        </Text>
        <Text className="text-[15px] text-[#735f8c] leading-[22px]">
          A link to reset your password was sent to{"\n"}
          <Text className="font-semibold text-[#141118]">{email}</Text>
        </Text>
      </View>

      {/* Empty Space */}
      <View className="flex-1" />

      {/* Resend Section */}
      <View className="items-center mb-5">
        {cooldown > 0 ? (
          <Text className="text-[15px] text-[#735f8c]">
            Didn't get an email?{" "}
            <Text className="font-semibold">
              Resend in {cooldown}
            </Text>
          </Text>
        ) : (
          <View className="flex-row items-center">
            <Text className="text-[15px] text-[#735f8c]">
              Didn't get an email?{" "}
            </Text>
            <Pressable
              onPress={onResend}
              disabled={isResending}
              className="active:opacity-70"
            >
              <Text className="text-[15px] font-bold text-[#036ded] underline">
                {isResending ? "Sending..." : "Resend"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Open Email App Button */}
      <View className="px-7 pb-10">
        <SubmitButton
          label="Open email app"
          onPress={() => Linking.openURL("mailto:")}
        />
      </View>
    </>
  );
}
