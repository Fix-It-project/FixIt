import {
	GoogleSans_400Regular,
	GoogleSans_500Medium,
	GoogleSans_600SemiBold,
	GoogleSans_700Bold,
} from "@expo-google-fonts/google-sans";
import type { TextStyle } from "react-native";
import { fontFamily } from "./fonts";

export const fontAssets = {
	[fontFamily.regular]: GoogleSans_400Regular,
	[fontFamily.medium]: GoogleSans_500Medium,
	[fontFamily.semibold]: GoogleSans_600SemiBold,
	[fontFamily.bold]: GoogleSans_700Bold,
} as const;

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

/**
 * Semantic text variants — bundle fontSize + lineHeight + fontFamily so
 * consumers never mix `text-[20px]` + inline `fontFamily: "GoogleSans_..."`.
 *
 * Line heights are stored as absolute pixel values to match React Native's
 * `TextStyle.lineHeight` expectation (RN does not support unitless multipliers).
 */
export const typography = {
	display: { fontSize: 36, lineHeight: 42, fontFamily: fontFamily.bold },
	h1: { fontSize: 30, lineHeight: 36, fontFamily: fontFamily.bold },
	h2: { fontSize: 24, lineHeight: 30, fontFamily: fontFamily.semibold },
	h3: { fontSize: 20, lineHeight: 26, fontFamily: fontFamily.semibold },
	bodyLg: { fontSize: 18, lineHeight: 27, fontFamily: fontFamily.regular },
	body: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular },
	input: {
		fontSize: 16,
		lineHeight: 24,
		fontFamily: fontFamily.regular,
		includeFontPadding: false,
		textAlignVertical: "center",
	},
	bodySm: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular },
	label: { fontSize: 14, lineHeight: 18, fontFamily: fontFamily.medium },
	caption: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular },
	buttonLg: { fontSize: 16, lineHeight: 20, fontFamily: fontFamily.semibold },
	buttonMd: { fontSize: 14, lineHeight: 18, fontFamily: fontFamily.semibold },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
