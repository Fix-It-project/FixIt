/** Shared formatting utilities for booking-related UI. */
import { getAvatarColor } from "@/src/lib/avatar";

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

export { getAvatarColor };
