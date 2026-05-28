export const fontFamily = {
	regular: "GoogleSans_400Regular",
	medium: "GoogleSans_500Medium",
	semibold: "GoogleSans_600SemiBold",
	bold: "GoogleSans_700Bold",
} as const;

export type FontFamilyToken = keyof typeof fontFamily;
