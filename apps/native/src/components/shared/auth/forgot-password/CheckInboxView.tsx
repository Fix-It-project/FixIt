import { View, Text, Pressable, Linking } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";

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
        <Text className="text-[26px] font-bold text-content mb-2">
          Check your inbox
        </Text>
        <Text className="text-[15px] text-content-secondary leading-[22px]">
          A link to reset your password was sent to{"\n"}
          <Text className="font-semibold text-content">{email}</Text>
        </Text>
      </View>

      {/* Empty Space */}
      <View className="flex-1" />

      {/* Resend Section */}
      <View className="items-center mb-5">
        {cooldown > 0 ? (
          <Text className="text-[15px] text-content-secondary">
            Didn't get an email?{" "}
            <Text className="font-semibold">
              Resend in {cooldown}
            </Text>
          </Text>
        ) : (
          <View className="flex-row items-center">
            <Text className="text-[15px] text-content-secondary">
              Didn't get an email?{" "}
            </Text>
            <Pressable
              onPress={onResend}
              disabled={isResending}
              className="active:opacity-70"
            >
              <Text className="text-[15px] font-bold text-brand underline">
                {isResending ? "Sending..." : "Resend"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Open Email App Button */}
      <View className="px-7 pb-10">
        <Button onPress={() => Linking.openURL("mailto:")}>
          <BtnText>Open email app</BtnText>
        </Button>
      </View>
    </>
  );
}
