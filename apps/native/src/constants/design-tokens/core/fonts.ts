export const fontFamily = {
	regular: "GoogleSans_400Regular",
	medium: "GoogleSans_500Medium",
	semibold: "GoogleSans_600SemiBold",
	bold: "GoogleSans_700Bold",
} as const;

/**
 * Arabic font family primitives (Cairo). Google Sans has weak Arabic coverage,
 * so when the active layout is RTL the `Text` component swaps each Latin family
 * for its Cairo weight-equivalent via `arabicFamilyByLatin`.
 */
export const arabicFontFamily = {
	regular: "Cairo_400Regular",
	medium: "Cairo_500Medium",
	semibold: "Cairo_600SemiBold",
	bold: "Cairo_700Bold",
} as const;

export const arabicFamilyByLatin: Record<string, string> = {
	[fontFamily.regular]: arabicFontFamily.regular,
	[fontFamily.medium]: arabicFontFamily.medium,
	[fontFamily.semibold]: arabicFontFamily.semibold,
	[fontFamily.bold]: arabicFontFamily.bold,
};

export type FontFamilyToken = keyof typeof fontFamily;
