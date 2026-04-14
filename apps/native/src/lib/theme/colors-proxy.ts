import { getActiveThemeTokens } from "./runtime";
import type { ThemePalette } from "./types";

type ThemeColorKey = keyof ThemePalette;

const categoryProxy = new Proxy({} as ThemePalette["category"], {
  get(_target, property: string | symbol) {
    if (typeof property !== "string") {
      return undefined;
    }

    return getActiveThemeTokens().category[property as keyof ThemePalette["category"]];
  },
});

export const Colors = new Proxy({ category: categoryProxy } as ThemePalette, {
  get(_target, property: string | symbol) {
    if (property === "category") {
      return categoryProxy;
    }

    if (typeof property !== "string") {
      return undefined;
    }

    return getActiveThemeTokens()[property as ThemeColorKey];
  },
});

export type AppColors = ThemePalette;
