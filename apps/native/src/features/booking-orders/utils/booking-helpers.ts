/** Shared formatting utilities for booking-related UI. */
import { getAvatarColor } from "@/src/lib/avatar";

export function getDateLocale(language?: string): string {
	return language?.startsWith("ar") ? "ar-EG" : "en-US";
}

/** Format "2026-03-27" for the active app locale. */
export function formatDate(dateStr: string, language?: string): string {
	const parsed = new Date(`${dateStr}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return dateStr;
	return new Intl.DateTimeFormat(getDateLocale(language), {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(parsed);
}

/** Format ISO datetime for the active app locale. */
export function formatTime(
	iso: string | null | undefined,
	language?: string,
): string | null {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return new Intl.DateTimeFormat(getDateLocale(language), {
		hour: "numeric",
		minute: "2-digit",
	}).format(d);
}

export { getAvatarColor };
