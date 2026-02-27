import type { ReactNode } from "react";
import { Platform, KeyboardAvoidingView, Animated, type ViewStyle } from "react-native";
import { useKeyboardPadding } from "@/src/hooks/useKeyboardPadding";
import { Colors } from "@/src/lib/colors";

interface KeyboardWrapperProps {
  children: ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
}

/**
 * Platform-aware keyboard wrapper:
 * - iOS  → KeyboardAvoidingView with behavior="padding"
 * - Android → Animated.View with dynamic paddingBottom
 */
export default function KeyboardWrapper({
  children,
  backgroundColor = Colors.brandLight,
  style,
}: KeyboardWrapperProps) {
  const keyboardPadding = useKeyboardPadding();

  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView
        className="flex-1"
        style={[{ backgroundColor }, style]}
        behavior="padding"
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <Animated.View
      style={[{ flex: 1, backgroundColor, paddingBottom: keyboardPadding }, style]}
    >
      {children}
    </Animated.View>
  );
}
