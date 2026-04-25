import { hairlineWidth } from "nativewind/theme";
import type { Config } from "tailwindcss";
import {
	tailwindBorderRadius,
	tailwindBorderWidth,
	tailwindFontFamily,
	tailwindGap,
	tailwindHeight,
	tailwindMinHeight,
	tailwindPadding,
	tailwindSpacing,
	tailwindWidth,
} from "./src/lib/design-tokens/tailwind";

const config: Config = {
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
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},

				// ─── App colors (all from runtime theme variables) ──
				"app-primary": {
					DEFAULT: "var(--app-primary)",
					light: "var(--app-primary-light)",
					dark: "var(--app-primary-dark)",
				},
				content: {
					DEFAULT: "var(--text-primary)",
					secondary: "var(--text-secondary)",
					muted: "var(--text-muted)",
				},
				edge: { DEFAULT: "var(--border-default)", chip: "var(--border-chip)" },
				success: { DEFAULT: "var(--success)", alt: "var(--success-alt)" },
				danger: {
					DEFAULT: "var(--danger)",
					light: "var(--danger-light)",
					soft: "var(--danger-soft)",
				},
				warning: { DEFAULT: "var(--warning)", light: "var(--warning-light)" },
				surface: {
					DEFAULT: "var(--surface-base)",
					elevated: "var(--surface-elevated)",
					muted: "var(--surface-muted)",
					"on-primary": "var(--surface-on-primary)",
				},
				star: {
					DEFAULT: "var(--rating-default)",
					light: "var(--rating-light)",
				},
				status: {
					available: "var(--status-available)",
					online: "var(--status-online)",
					unavailable: "var(--status-unavailable)",
					"unavailable-bg": "var(--status-unavailable-bg)",
				},
				order: { bg: "var(--order-bg)", text: "var(--order-text)" },
				"accent-cyan": "var(--accent-cyan)",
				"accent-purple": "var(--accent-purple)",
				"accent-sky": "var(--accent-sky)",
				role: {
					user: "var(--role-user)",
					tech: "var(--role-tech)",
					accent: "var(--role-accent)",
					label: "var(--role-label)",
				},
				overlay: {
					white: "var(--overlay-white)",
					md: "var(--overlay-md)",
					sm: "var(--overlay-sm)",
					sub: "var(--overlay-sub)",
					dim: "var(--overlay-dim)",
					bright: "var(--overlay-bright)",
				},
				backdrop: "var(--backdrop)",
				gradient: {
					start: "var(--gradient-start)",
					mid: "var(--gradient-mid)",
					end: "var(--gradient-end)",
					"role-start": "var(--gradient-role-start)",
					"role-mid": "var(--gradient-role-mid)",
					"role-end": "var(--gradient-role-end)",
				},
				shadow: "var(--shadow)",
				social: "var(--social-icon)",
				disabled: "var(--disabled-text)",
				calendar: "var(--text-calendar)",
				contrast: "var(--text-contrast)",
				category: {
					cyan: "var(--category-cyan)",
					indigo: "var(--category-indigo)",
					red: "var(--category-red)",
					green: "var(--category-green)",
					rose: "var(--category-rose)",
					purple: "var(--category-purple)",
					blue: "var(--category-blue)",
					brown: "var(--category-brown)",
					orange: "var(--category-orange)",
				},
			},
			fontFamily: tailwindFontFamily,
			borderRadius: {
				// var-backed shadcn radii (preserve — do not rename)
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				// fixed-pixel semantic radii from src/lib/design-tokens/radius.ts
				...tailwindBorderRadius,
			},
			height: tailwindHeight,
			width: tailwindWidth,
			minHeight: tailwindMinHeight,
			spacing: tailwindSpacing,
			padding: tailwindPadding,
			gap: tailwindGap,
			borderWidth: {
				hairline: hairlineWidth(),
				...tailwindBorderWidth,
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
