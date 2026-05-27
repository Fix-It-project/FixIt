import { fontFamily } from "./fonts";

export const fontSize = {
	xs: 12,
	sm: 14,
	base: 16,
	md: 17,
	lg: 18,
	xl: 20,
	"2xl": 24,
	"3xl": 30,
	"4xl": 36,
} as const;

export const lineHeight = {
	tight: 1.15,
	snug: 1.25,
	normal: 1.4,
	relaxed: 1.6,
} as const;

export const fontWeight = {
	regular: 400,
	medium: 500,
	semibold: 600,
	bold: 700,
} as const;

export const typography = {
	display: {
		fontSize: 36,
		lineHeight: 42,
		fontWeight: fontWeight.bold,
		fontFamily: fontFamily.bold,
	},
	h1: {
		fontSize: 30,
		lineHeight: 36,
		fontWeight: fontWeight.bold,
		fontFamily: fontFamily.bold,
	},
	h2: {
		fontSize: 24,
		lineHeight: 30,
		fontWeight: fontWeight.semibold,
		fontFamily: fontFamily.semibold,
	},
	h3: {
		fontSize: 20,
		lineHeight: 26,
		fontWeight: fontWeight.semibold,
		fontFamily: fontFamily.semibold,
	},
	bodyLg: {
		fontSize: 18,
		lineHeight: 27,
		fontWeight: fontWeight.regular,
		fontFamily: fontFamily.regular,
	},
	body: {
		fontSize: 16,
		lineHeight: 24,
		fontWeight: fontWeight.regular,
		fontFamily: fontFamily.regular,
	},
	bodySm: {
		fontSize: 14,
		lineHeight: 20,
		fontWeight: fontWeight.regular,
		fontFamily: fontFamily.regular,
	},
	label: {
		fontSize: 14,
		lineHeight: 18,
		fontWeight: fontWeight.medium,
		fontFamily: fontFamily.medium,
	},
	caption: {
		fontSize: 12,
		lineHeight: 16,
		fontWeight: fontWeight.regular,
		fontFamily: fontFamily.regular,
	},
	buttonLg: {
		fontSize: 16,
		lineHeight: 20,
		fontWeight: fontWeight.semibold,
		fontFamily: fontFamily.semibold,
	},
	buttonMd: {
		fontSize: 14,
		lineHeight: 18,
		fontWeight: fontWeight.semibold,
		fontFamily: fontFamily.semibold,
	},
} as const;

export type TypographyVariant = keyof typeof typography;
