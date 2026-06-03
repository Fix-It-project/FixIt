import { AppError } from "../errors/index.js";

const CAIRO_TZ = "Africa/Cairo";
const CAIRO_DATE_FMT = new Intl.DateTimeFormat("en-CA", {
	timeZone: CAIRO_TZ,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});
const CAIRO_TIME_FMT = new Intl.DateTimeFormat("en-US", {
	timeZone: CAIRO_TZ,
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});
const ISO_WITH_OFFSET =
	/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

export const FIXED_SLOT_HOURS_CAIRO = [8, 11, 14, 17, 20] as const;

const FIXED_SLOT_SET = new Set<number>(FIXED_SLOT_HOURS_CAIRO);

export interface FixedSlotValidationArgs {
	dateYmd: string;
	startAt: string | null | undefined;
	requiredCode: string;
	invalidDatetimeCode: string;
	invalidSlotCode: string;
	dateMismatchCode: string;
}

function cairoDate(instant: Date): string {
	return CAIRO_DATE_FMT.format(instant);
}

function cairoHourMinute(instant: Date): { hour: number; minute: number } {
	const parts = CAIRO_TIME_FMT.formatToParts(instant);
	const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "NaN");
	const minute = Number(
		parts.find((p) => p.type === "minute")?.value ?? "NaN",
	);
	return { hour, minute };
}

function parseIsoWallClock(startAt: string): {
	datePart: string;
	hour: number;
	minute: number;
	second: number;
	offset: string;
} | null {
	const match = ISO_WITH_OFFSET.exec(startAt);
	if (!match) return null;
	return {
		datePart: match[1] ?? "",
		hour: Number(match[2]),
		minute: Number(match[3]),
		second: Number(match[4] ?? "0"),
		offset: match[5] ?? "Z",
	};
}

export function assertFixedSlotStartAtInCairo(
	args: FixedSlotValidationArgs,
): void {
	if (!args.startAt) {
		throw AppError.badRequest(args.requiredCode);
	}

	const parsed = new Date(args.startAt);
	if (Number.isNaN(parsed.getTime())) {
		throw AppError.badRequest(args.invalidDatetimeCode);
	}

	const lexical = parseIsoWallClock(args.startAt);
	if (lexical && lexical.offset !== "Z") {
		if (lexical.datePart !== args.dateYmd) {
			throw AppError.badRequest(args.dateMismatchCode);
		}
		if (
			lexical.minute !== 0 ||
			lexical.second !== 0 ||
			!FIXED_SLOT_SET.has(lexical.hour)
		) {
			throw AppError.badRequest(args.invalidSlotCode);
		}
		return;
	}

	if (cairoDate(parsed) !== args.dateYmd) {
		throw AppError.badRequest(args.dateMismatchCode);
	}

	const { hour, minute } = cairoHourMinute(parsed);
	if (minute !== 0 || !FIXED_SLOT_SET.has(hour)) {
		throw AppError.badRequest(args.invalidSlotCode);
	}
}

export function getCairoSlotHourFromIso(isoDatetime: string): number {
	const parsed = new Date(isoDatetime);
	if (Number.isNaN(parsed.getTime())) {
		throw AppError.badRequest("invalid_datetime");
	}
	return cairoHourMinute(parsed).hour;
}
