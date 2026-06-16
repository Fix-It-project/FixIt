import type { ReportLabel } from "../schemas/report.schema";

/** Who is filing the report — determines the allowed label set + endpoint. */
export type ReportViewer = "user" | "technician";

/** Predefined labels per direction (each ends with `other`). The display text
 *  lives in i18n under `reports.labels.<label>`. */
export const REPORT_LABELS: Record<ReportViewer, ReportLabel[]> = {
	// A user reporting their technician.
	user: [
		"no_show",
		"unprofessional",
		"overcharged",
		"poor_quality",
		"safety_concern",
		"other",
	],
	// A technician reporting their customer.
	technician: ["abusive", "refused_payment", "unsafe_dishonest", "other"],
};

/** Labels that signal a safety/severe issue — rendered with the danger tint so
 *  the accent actually means something. */
export const DANGER_LABELS: ReadonlySet<ReportLabel> = new Set<ReportLabel>([
	"safety_concern",
	"unsafe_dishonest",
]);
