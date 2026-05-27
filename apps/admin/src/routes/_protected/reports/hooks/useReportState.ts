import { useState } from "react";
import { REPORTS } from "@/data/mockData";
import type { Report, ReportResolution } from "@/types/domain";

export function useReportState() {
	const [reports, setReports] = useState<Report[]>(REPORTS);

	function closeReport(id: string, resolution: ReportResolution) {
		setReports((prev) =>
			prev.map((r) =>
				r.id === id
					? {
							...r,
							status: "closed",
							resolution,
							closedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
							closedBy: "Ahmed Refaat",
						}
					: r,
			),
		);
	}

	function reopenReport(id: string) {
		setReports((prev) =>
			prev.map((r) =>
				r.id === id
					? { ...r, status: "open", resolution: undefined, closedAt: undefined, closedBy: undefined }
					: r,
			),
		);
	}

	const openReports = reports.filter((r) => r.status === "open");
	const closedReports = reports.filter((r) => r.status === "closed");

	return { openReports, closedReports, closeReport, reopenReport };
}
