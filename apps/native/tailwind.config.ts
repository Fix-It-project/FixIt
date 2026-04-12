import { hairlineWidth } from "nativewind/theme";
import type { Config } from "tailwindcss";
import { Colors } from "./src/lib/colors";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ─── shadcn / rn-primitives semantic tokens (HSL CSS vars) ──
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary:     { DEFAULT: "hsl(var(--primary))",     foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))",   foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))",       foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))",      foreground: "hsl(var(--accent-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))",     foreground: "hsl(var(--popover-foreground))" },
        card:        { DEFAULT: "hsl(var(--card))",        foreground: "hsl(var(--card-foreground))" },

        // ─── App colors (all from Colors single source of truth) ──
        "app-primary": { DEFAULT: Colors.primary, light: Colors.primaryLight, dark: Colors.primaryDark },
        content:  { DEFAULT: Colors.textPrimary, secondary: Colors.textSecondary, muted: Colors.textMuted },
        edge:     { DEFAULT: Colors.borderDefault, chip: Colors.borderChip },
        success:  { DEFAULT: Colors.success, alt: Colors.successAlt },
        danger:   { DEFAULT: Colors.danger, light: Colors.dangerLight, soft: Colors.dangerSoft },
        warning:  { DEFAULT: Colors.warning, light: Colors.warningLight },
        surface:  { DEFAULT: Colors.surfaceBase, elevated: Colors.surfaceElevated, muted: Colors.surfaceMuted },
        star:     { DEFAULT: Colors.ratingDefault, light: Colors.ratingLight },
        status: {
          available: Colors.statusAvailable,
          online: Colors.statusOnline,
          unavailable: Colors.statusUnavailable,
          "unavailable-bg": Colors.statusUnavailableBg,
        },
        order:    { bg: Colors.orderBg, text: Colors.orderText },
        "accent-cyan":   Colors.accentCyan,
        "accent-purple": Colors.accentPurple,
        "accent-sky":    Colors.accentSky,
        role: {
          user: Colors.roleUser,
          tech: Colors.roleTech,
          accent: Colors.roleAccent,
          label: Colors.roleLabel,
        },
        overlay: {
          white: Colors.overlayWhite,
          md: Colors.overlayMd,
          sm: Colors.overlaySm,
          sub: Colors.overlaySub,
          dim: Colors.overlayDim,
          bright: Colors.overlayBright,
        },
        gradient: {
          start: Colors.gradientStart,
          mid: Colors.gradientMid,
          end: Colors.gradientEnd,
          "role-start": Colors.gradientRoleStart,
          "role-mid": Colors.gradientRoleMid,
          "role-end": Colors.gradientRoleEnd,
        },
        shadow:   Colors.shadow,
        social:   Colors.socialIcon,
        disabled: Colors.disabledText,
        calendar: Colors.textCalendar,
        contrast: Colors.textContrast,
        category: {
          cyan: Colors.category.cyan,
          indigo: Colors.category.indigo,
          red: Colors.category.red,
          green: Colors.category.green,
          rose: Colors.category.rose,
          purple: Colors.category.purple,
          blue: Colors.category.blue,
          brown: Colors.category.brown,
          orange: Colors.category.orange,
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
