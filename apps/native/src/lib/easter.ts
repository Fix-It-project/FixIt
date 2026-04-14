import { Leaf, type LucideIcon } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import type { ThemePreference } from "@/src/lib/theme";

const JUNGLE_TRIGGER_THEME = "forest";
const LIGHT_MODE_VALUE: ThemePreference = "light";
const REQUIRED_LIGHT_TAPS = 10;
const MESSAGE_LIGHT_TAP_THRESHOLD = 5;
const TAP_WINDOW_MS = 1000;

type PreferenceSetter = (preference: ThemePreference) => Promise<void> | void;

export interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
  readonly Icon: LucideIcon;
}

const JUNGLE_OPTION: ThemeOption = {
  value: JUNGLE_TRIGGER_THEME,
  label: "Jungle",
  Icon: Leaf,
};

export function useThemeEasterEgg(
  setPreference: PreferenceSetter,
  baseOptions: ThemeOption[],
) {
  const lastLightTapAtRef = useRef<number | null>(null);
  const lightTapStreakRef = useRef(0);
  const [isJungleUnlocked, setIsJungleUnlocked] = useState(false);

  const options = useMemo(
    () => (isJungleUnlocked ? [...baseOptions, JUNGLE_OPTION] : baseOptions),
    [baseOptions, isJungleUnlocked],
  );

  const handlePreferencePress = useCallback(
    (nextPreference: ThemePreference) => {
      if (nextPreference !== LIGHT_MODE_VALUE) {
        lastLightTapAtRef.current = null;
        lightTapStreakRef.current = 0;
        void setPreference(nextPreference);
        return;
      }

      const now = Date.now();
      const previousTapAt = lastLightTapAtRef.current;
      const isContinuingStreak =
        previousTapAt !== null && now - previousTapAt <= TAP_WINDOW_MS;

      lightTapStreakRef.current = isContinuingStreak
        ? lightTapStreakRef.current + 1
        : 1;
      lastLightTapAtRef.current = now;

      if (lightTapStreakRef.current >= REQUIRED_LIGHT_TAPS) {
        lastLightTapAtRef.current = null;
        lightTapStreakRef.current = 0;
        setIsJungleUnlocked(true);
        Toast.show({
          type: "info",
          text1: "WELCOME TO THE JUNGLE",
        });
        return;
      }

      if (lightTapStreakRef.current >= MESSAGE_LIGHT_TAP_THRESHOLD) {
        const tapsRemaining = REQUIRED_LIGHT_TAPS - lightTapStreakRef.current;
        Toast.show({
          type: "info",
          text1: `You hear the african music! Knock ${tapsRemaining} more times....`,
        });
      }

      void setPreference(nextPreference);
    },
    [setPreference],
  );

  return {
    options,
    handlePreferencePress,
  };
}
