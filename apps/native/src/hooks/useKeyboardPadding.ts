import { useEffect, useRef } from "react";
import { Platform, Keyboard, Animated } from "react-native";

/**
 * Returns an Animated.Value that tracks the keyboard height on Android.
 * On iOS the value stays at 0 (iOS uses KeyboardAvoidingView instead).
 */
export function useKeyboardPadding(): Animated.Value {
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(keyboardPadding, {
        toValue: e.endCoordinates.height,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardPadding]);

  return keyboardPadding;
}
