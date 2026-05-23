/** Shared formatting utilities for booking-related UI. */
import { getActiveThemeTokens } from "@/src/lib/theme";

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

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

/** Format "2026-03-27" → "Mar 27, 2026". */
export function formatDate(dateStr: string): string {
	const [y, m, d] = dateStr.split("-");
	return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

/** Format ISO datetime to local 12h time, e.g. "10:00 AM". */
export function formatTime(iso: string | null | undefined): string | null {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	}).format(d);
}

/** Deterministic avatar background color from a name string. */
export function getAvatarColor(name: string | null | undefined): string {
	const avatarPalette = getAvatarPalette();
	if (!name) return avatarPalette[0];
	let hash = 0;
	for (const char of name)
		hash = (char.codePointAt(0) ?? 0) + ((hash << 5) - hash);
	return avatarPalette[Math.abs(hash) % avatarPalette.length];
}
