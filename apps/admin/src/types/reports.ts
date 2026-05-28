export type ReportSource = "customer" | "technician";
export type ReportStatus = "open" | "closed";
export type ReportResolution = "resolved" | "dismissed";

export interface Report {
	id: string;
	orderId: string;
	reporterName: string;
	reporterInitials: string;
	reporterColor: string;
	reporterRole: ReportSource;
	against: string;
	category: string;
	filedAt: string;
	summary: string;
	description: string;
	status: ReportStatus;
	resolution?: ReportResolution;
	closedAt?: string;
	closedBy?: string;
}

export type ReportSourceFilter = "all" | ReportSource;
export type ReportResolutionFilter = "all" | ReportResolution;
