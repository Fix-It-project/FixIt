import { getActiveThemeTokens } from "@/src/constants/design-tokens";

function getAvatarPalette() {
	const tokens = getActiveThemeTokens();
	return [
		tokens.category.blue,
		tokens.category.orange,
		tokens.category.green,
		tokens.category.purple,
		tokens.category.cyan,
		tokens.category.brown,
		tokens.category.indigo,
		tokens.category.red,
	];
}

export function getAvatarColor(name: string | null | undefined): string {
	const avatarPalette = getAvatarPalette();
	if (!name) return avatarPalette[0];
	let hash = 0;
	for (const char of name)
		hash = (char.codePointAt(0) ?? 0) + ((hash << 5) - hash);
	return avatarPalette[Math.abs(hash) % avatarPalette.length];
}
