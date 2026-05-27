export const fontFamily = {
	regular:
		"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	medium:
		"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	semibold:
		"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	bold: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
} as const;

export type FontFamilyToken = keyof typeof fontFamily;
