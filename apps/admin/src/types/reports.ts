export type ReportRole = "user" | "technician";

export type ReportLabel =
	| "no_show"
	| "unprofessional"
	| "overcharged"
	| "poor_quality"
	| "safety_concern"
	| "abusive"
	| "refused_payment"
	| "unsafe_dishonest"
	| "other";

export type ReportStatus = "open" | "closed";
export type ReportResolution = "resolved" | "dismissed";

/** A report as returned by GET /api/admin/reports (the `admin_reports` view,
 *  mapped server-side with both parties' display fields + order context). */
export interface AdminReport {
	id: string;
	reporterId: string;
	reporterRole: ReportRole;
	reporterName: string;
	reporterInitials: string;
	reporterColor: string;
	reportedId: string;
	reportedRole: ReportRole;
	reportedName: string;
	reportedInitials: string;
	reportedColor: string;
	orderId: string;
	orderServiceName: string | null;
	orderCategoryId: string | null;
	orderCategoryName: string | null;
	orderCreatedAt: string | null;
	label: ReportLabel;
	labelText: string;
	summary: string;
	status: ReportStatus;
	resolution: ReportResolution | null;
	resolvedBy: string | null;
	resolvedAt: string | null;
	warnedAt: string | null;
	createdAt: string;
}

export type ReportSourceFilter = "all" | ReportRole;
