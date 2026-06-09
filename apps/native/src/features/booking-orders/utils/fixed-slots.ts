const CAIRO_TZ = "Africa/Cairo";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const BOOKING_SLOT_HOURS = [8, 11, 14, 17, 20] as const;
export type BookingSlotHour = (typeof BOOKING_SLOT_HOURS)[number];

export interface BookingSlotOption {
	readonly hour: BookingSlotHour;
	readonly value: string;
	readonly label: string;
}

export const BOOKING_SLOT_OPTIONS: ReadonlyArray<BookingSlotOption> =
	BOOKING_SLOT_HOURS.map((hour) => ({
		hour,
		value: `${String(hour).padStart(2, "0")}:00`,
		label: hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`,
	}));

function cairoMidnightUtc(dateStr: string): Date {
	if (!ISO_DATE.test(dateStr)) {
		throw new Error("Invalid date format. Use YYYY-MM-DD.");
	}

	const [yStr, mStr, dStr] = dateStr.split("-");
	const y = Number(yStr);
	const m = Number(mStr);
	const d = Number(dStr);

	const guess = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
	const cairoParts = new Intl.DateTimeFormat("en-US", {
		timeZone: CAIRO_TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).formatToParts(new Date(guess));

	const get = (t: string) =>
		Number(cairoParts.find((p) => p.type === t)?.value ?? 0);
	const cairoHour = get("hour") === 24 ? 0 : get("hour");
	const cairoMinute = get("minute");
	const cairoSecond = get("second");
	const offsetMs = ((cairoHour * 60 + cairoMinute) * 60 + cairoSecond) * 1000;

	return new Date(guess - offsetMs);
}

function cairoOffsetString(dateStr: string): string {
	if (!ISO_DATE.test(dateStr)) {
		throw new Error("Invalid date format. Use YYYY-MM-DD.");
	}

	const [yStr, mStr, dStr] = dateStr.split("-");
	const y = Number(yStr);
	const m = Number(mStr);
	const d = Number(dStr);
	const utcMidnight = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
	const cairoMidnight = cairoMidnightUtc(dateStr).getTime();
	const offsetMinutes = Math.round((utcMidnight - cairoMidnight) / 60_000);
	const sign = offsetMinutes >= 0 ? "+" : "-";
	const absoluteMinutes = Math.abs(offsetMinutes);
	const hours = Math.floor(absoluteMinutes / 60);
	const minutes = absoluteMinutes % 60;

	return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function buildCairoSlotIsoUtc(
	dateYmd: string,
	slotHour: BookingSlotHour,
): string {
	return `${dateYmd}T${String(slotHour).padStart(2, "0")}:00:00${cairoOffsetString(dateYmd)}`;
}