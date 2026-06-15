import { z } from "zod";

// Full union of report labels. The valid subset per direction is enforced by the
// UI (REPORT_LABELS) and re-validated server-side (`submit_report`).
export const reportLabelSchema = z.enum([
	// user -> technician
	"no_show",
	"unprofessional",
	"overcharged",
	"poor_quality",
	"safety_concern",
	// technician -> user
	"abusive",
	"refused_payment",
	"unsafe_dishonest",
	// both
	"other",
]);

export type ReportLabel = z.infer<typeof reportLabelSchema>;
