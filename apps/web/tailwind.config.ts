import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class", '[data-theme="dark"]'],
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				display: ['"Google Sans"', "system-ui", "sans-serif"],
				sans: [
					"Figtree",
					"system-ui",
					"-apple-system",
					"Segoe UI",
					"Roboto",
					"sans-serif",
				],
				mono: ["ui-monospace", "monospace"],
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					dark: "hsl(var(--primary-dark))",
					light: "hsl(var(--primary-light))",
					foreground: "hsl(var(--primary-foreground))",
				},
				surface: {
					DEFAULT: "hsl(var(--surface))",
					muted: "hsl(var(--surface-muted))",
				},
				ink: "hsl(var(--ink))",
				muted: {
					foreground: "hsl(var(--muted-foreground))",
				},
				border: "hsl(var(--border))",
				cyan: "hsl(var(--accent-cyan))",
				success: "hsl(var(--success))",
				warning: "hsl(var(--warning))",
				danger: "hsl(var(--danger))",
			},
			borderRadius: {
				DEFAULT: "var(--radius)",
				xl: "calc(var(--radius) + 4px)",
				"2xl": "calc(var(--radius) + 8px)",
				lg: "var(--radius)",
				md: "calc(var(--radius) - 4px)",
				sm: "calc(var(--radius) - 6px)",
			},
			boxShadow: {
				glow: "0 24px 70px -20px hsl(var(--primary) / 0.45)",
				lift: "0 18px 50px -24px hsl(var(--foreground) / 0.30)",
			},
			backgroundImage: {
				hero: "linear-gradient(160deg, hsl(var(--hero-start)) 0%, hsl(var(--hero-mid)) 52%, hsl(var(--hero-end)) 100%)",
			},
			keyframes: {
				marquee: {
					from: { transform: "translateX(0)" },
					to: { transform: "translateX(-50%)" },
				},
				/* Organic drift — GPU-only transforms (translate3d + rotate), with a
				   gentle off-axis sway and tilt so it reads as a hovering object
				   rather than a flat up/down bob. */
				float: {
					"0%": { transform: "translate3d(0, 0, 0) rotate(-0.6deg)" },
					"33%": {
						transform: "translate3d(6px, -16px, 0) rotate(0.5deg)",
					},
					"66%": {
						transform: "translate3d(-5px, -8px, 0) rotate(-0.3deg)",
					},
					"100%": { transform: "translate3d(0, 0, 0) rotate(-0.6deg)" },
				},
			},
			animation: {
				marquee: "marquee 32s linear infinite",
				float: "float 9s cubic-bezier(0.45, 0, 0.55, 1) infinite",
			},
		},
	},
	plugins: [animate],
} satisfies Config;
