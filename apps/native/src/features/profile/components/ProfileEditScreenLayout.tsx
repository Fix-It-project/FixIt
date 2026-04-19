import type { ReactNode } from "react";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import PageHeader from "@/src/components/PageHeader";
import ErrorBanner from "@/src/components/feedback/ErrorBanner";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

interface ProfileEditScreenLayoutProps {
  readonly children: ReactNode;
  readonly errorMessage: string | null;
  readonly isPending: boolean;
  readonly isSaveDisabled: boolean;
  readonly onBackPress: () => void;
  readonly onSavePress: () => void;
}

export default function ProfileEditScreenLayout({
  children,
  errorMessage,
  isPending,
  isSaveDisabled,
  onBackPress,
  onSavePress,
}: ProfileEditScreenLayoutProps) {
  const themeColors = useThemeColors();
  const { width } = useWindowDimensions();
  const horizontalPadding = Math.min(Math.max(width * 0.05, 16), 28);

  return (
    <SafeAreaView className="flex-1 bg-surface-elevated" edges={["top"]}>
      <PageHeader title="Edit Profile" variant="surface" onBackPress={onBackPress} />

      <KeyboardAwareScrollView
        className="flex-1"
        style={{ paddingHorizontal: horizontalPadding }}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 32,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={20}
      >
        <View className="w-full gap-4" style={{ maxWidth: 560 }}>
          <ErrorBanner message={errorMessage} />
          {children}

          <View className="mt-2">
            <Button onPress={onSavePress} disabled={isSaveDisabled}>
              {isPending ? (
                <ActivityIndicator color={themeColors.surfaceBase} />
              ) : (
                <Text>Save Changes</Text>
              )}
            </Button>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
