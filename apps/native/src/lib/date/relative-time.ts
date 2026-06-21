function formatArabicRelative(value: number, unit: string): string {
	if (value === 0) return "الآن";
	return `منذ ${value} ${unit}`;
}

function formatEnglishRelative(value: number, unit: string): string {
	if (value === 0) return "just now";
	return `${value}${unit} ago`;
}

/** Format `seconds` ago using a native `Intl.RelativeTimeFormat` instance. */
function formatWithIntl(
	formatter: Intl.RelativeTimeFormat,
	seconds: number,
): string {
	if (seconds < 60) return formatter.format(0, "second");
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return formatter.format(-minutes, "minute");
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return formatter.format(-hours, "hour");
	const days = Math.floor(hours / 24);
	if (days < 30) return formatter.format(-days, "day");
	const months = Math.floor(days / 30);
	if (months < 12) return formatter.format(-months, "month");
	return formatter.format(-Math.floor(days / 365), "year");
}

/** Fallback formatter for runtimes without `Intl.RelativeTimeFormat`. */
function formatWithUnits(
	format: (value: number, unit: string) => string,
	seconds: number,
	isArabic: boolean,
): string {
	if (seconds < 60) return format(0, "s");
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return format(minutes, isArabic ? "د" : "m");
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return format(hours, isArabic ? "س" : "h");
	const days = Math.floor(hours / 24);
	if (days < 30) return format(days, isArabic ? "ي" : "d");
	const months = Math.floor(days / 30);
	if (months < 12) return format(months, isArabic ? "ش" : "mo");
	return format(Math.floor(days / 365), isArabic ? "سنة" : "y");
}

/** Format an ISO timestamp as a human-readable relative duration. */
export function formatRelativeTime(
	iso: string,
	now: Date = new Date(),
	language?: string,
): string {
	const then = Date.parse(iso);
	if (Number.isNaN(then)) return "";
	const seconds = Math.floor((now.getTime() - then) / 1000);
	const isArabic = language?.startsWith("ar") ?? false;
	const locale = isArabic ? "ar-EG" : "en-US";

	if (typeof Intl.RelativeTimeFormat === "function") {
		return formatWithIntl(
			new Intl.RelativeTimeFormat(locale, {
				numeric: "auto",
				style: "narrow",
			}),
			seconds,
		);
	}

	const format = isArabic ? formatArabicRelative : formatEnglishRelative;
	return formatWithUnits(format, seconds, isArabic);
}
