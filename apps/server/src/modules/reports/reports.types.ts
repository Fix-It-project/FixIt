export type ReporterRole = "user" | "technician";

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

/** A report filed by one party (user/technician) against the order's counterparty. */
export interface Report {
	id: string;
	reporter_id: string;
	reporter_role: ReporterRole;
	reported_id: string;
	reported_role: ReporterRole;
	order_id: string;
	label: ReportLabel;
	summary: string;
	status: ReportStatus;
	resolution: ReportResolution | null;
	resolved_by: string | null;
	resolved_at: string | null;
	warned_at: string | null;
	created_at: string;
}

/** Row shape from the `admin_reports` view: the report plus resolved display
 *  names for both parties and the linked order's context. */
export interface AdminReportRow extends Report {
	reporter_name: string;
	reported_name: string;
	order_service_name: string | null;
	order_category_id: string | null;
	order_category_name: string | null;
	order_created_at: string | null;
}

export interface SubmitReportInput {
	reporterId: string;
	reporterRole: ReporterRole;
	orderId: string;
	label: ReportLabel;
	summary: string;
}

export interface SetReportStatusInput {
	status: ReportStatus;
	resolution?: ReportResolution | null;
	resolvedBy?: string | null;
}
