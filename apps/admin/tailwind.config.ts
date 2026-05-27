import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import { radius as radiusTokens } from "./src/lib/design-tokens/radius";
import { space, spacing } from "./src/lib/design-tokens/spacing";
import { fontSize, lineHeight } from "./src/lib/design-tokens/typography";

const tailwindSpacing = Object.fromEntries(
	Object.entries(space).map(([k, v]) => [
		k,
		typeof v === "number" ? `${v}px` : v,
	]),
);

const tailwindFontSize = Object.fromEntries(
	Object.entries(fontSize).map(([k, v]) => [k, `${v}px`]),
);

const tailwindRadius = Object.fromEntries(
	Object.entries(radiusTokens).map(([k, v]) => [
		k,
		typeof v === "number" ? `${v}px` : v,
	]),
);

export default {
	darkMode: ["class", '[data-theme="dark"]'],
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			spacing: tailwindSpacing,
			fontSize: tailwindFontSize,
			lineHeight: {
				tight: String(lineHeight.tight),
				snug: String(lineHeight.snug),
				normal: String(lineHeight.normal),
				relaxed: String(lineHeight.relaxed),
			},
			borderRadius: {
				...tailwindRadius,
				DEFAULT: "var(--radius)",
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--primary-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
				},
			},
			// semantic spacing tokens — expose dashboard/screen scaffolding values
			gap: {
				section: `${spacing.section.gap}px`,
				"section-compact": `${spacing.section.gapCompact}px`,
			},
		},
	},
	plugins: [animate],
} satisfies Config;
