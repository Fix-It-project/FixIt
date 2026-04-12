import { useMemo } from "react";
import { Appearance, useColorScheme as useRNColorScheme } from "react-native";
import { vars } from "react-native-css-interop";
import { useThemeStore } from "@/src/stores/theme-store";
import {
  createNavigationTheme,
  getThemeTokens,
  getThemeVariableRecord,
  resolveThemeId,
} from "./resolution";
import type {
  ThemeId,
  ThemePalette,
  ThemePreference,
  ThemeTokens,
} from "./types";

function useResolvedThemeMetaState() {
  const systemColorScheme = useRNColorScheme();
  const preference = useThemeStore((state) => state.preference);

  const themeId = resolveThemeId(preference, systemColorScheme);
  const appearance = getThemeTokens(themeId).appearance;

  return { preference, themeId, appearance };
}

function useResolvedThemeState() {
  const { preference, themeId, appearance } = useResolvedThemeMetaState();
  const tokens = getThemeTokens(themeId);

  return { preference, themeId, appearance, tokens };
}

export function getActiveThemeId(): ThemeId {
  const preference = useThemeStore.getState().preference;
  return resolveThemeId(preference, Appearance.getColorScheme());
}

export function getActiveThemeTokens(): ThemeTokens {
  return getThemeTokens(getActiveThemeId());
}

export function useTheme() {
  const { preference, themeId, appearance, tokens } = useResolvedThemeState();
  const setPreference = useThemeStore((state) => state.setPreference);

  return {
    preference,
    setPreference,
    themeId,
    tokens,
    appearance,
    isDark: appearance === "dark",
  };
}

export function useThemeMeta() {
  const { themeId, appearance } = useResolvedThemeMetaState();

  return {
    themeId,
    appearance,
    isDark: appearance === "dark",
  };
}

export function useThemeTokens(): ThemeTokens {
  return useResolvedThemeState().tokens;
}

export function useThemeColors(): ThemePalette {
  return useThemeTokens();
}

export function useThemeNavigation() {
  const tokens = useThemeTokens();
  return useMemo(() => createNavigationTheme(tokens), [tokens.id]);
}

export function useThemeVariables() {
  const tokens = useThemeTokens();
  return useMemo(() => vars(getThemeVariableRecord(tokens)), [tokens.id]);
}

export type { ThemeId, ThemePreference, ThemeTokens, ThemePalette };
