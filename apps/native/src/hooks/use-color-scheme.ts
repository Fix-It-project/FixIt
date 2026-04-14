import { useThemeMeta } from "@/src/lib/theme";
import { useThemeStore } from "@/src/stores/theme-store";

export function useColorScheme() {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const { appearance, isDark, themeId } = useThemeMeta();

  return {
    colorScheme: appearance,
    isDarkColorScheme: isDark,
    preference,
    setPreference,
    themeId,
  };
}

export type { ThemePreference } from "@/src/lib/theme";
