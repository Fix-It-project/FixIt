import apiClient from "@/src/config/api-client";
import type { ReportViewer } from "../constants/labels";
import type { ReportLabel } from "../schemas/report.schema";

export interface SubmitReportInput {
	orderId: string;
	label: ReportLabel;
	summary: string;
}

/** File a report. The counterparty is inferred server-side from the order; the
 *  endpoint differs by who is reporting (user -> tech vs tech -> user). */
export async function submitReport(
	viewer: ReportViewer,
	input: SubmitReportInput,
): Promise<void> {
	const url =
		viewer === "technician" ? "/api/technicians/me/reports" : "/api/reports";
	await apiClient.post(url, input);
}
