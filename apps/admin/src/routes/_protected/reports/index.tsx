import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Report } from "@/types";
import { ClosedTab } from "./components/ClosedTab";
import { OpenTab } from "./components/OpenTab";
import { ReportDetailModal } from "./components/ReportDetailModal";
import { useReportState } from "./hooks/useReportState";

export const Route = createFileRoute("/_protected/reports/")({
	component: ReportsPage,
});

function ReportsPage() {
	const { openReports, closedReports, closeReport, reopenReport } = useReportState();
	const [viewing, setViewing] = useState<Report | null>(null);

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			{/* Header */}
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Reports</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Complaints filed by customers and technicians about orders. {openReports.length} open · {closedReports.length} closed.
				</p>
			</div>

			<Tabs defaultValue="open">
				<TabsList className="w-full sm:w-auto">
					<TabsTrigger value="open" className="flex-1 sm:flex-none">
						Open
						{openReports.length > 0 && (
							<span className="ml-1.5 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-semibold px-1.5 py-0.5">
								{openReports.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger value="closed" className="flex-1 sm:flex-none">
						Closed
						<span className="ml-1.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold px-1.5 py-0.5">
							{closedReports.length}
						</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="open" className="mt-4">
					<OpenTab reports={openReports} onView={setViewing} />
				</TabsContent>

				<TabsContent value="closed" className="mt-4">
					<ClosedTab reports={closedReports} onView={setViewing} />
				</TabsContent>
			</Tabs>

			<ReportDetailModal
				report={viewing}
				open={!!viewing}
				onClose={() => setViewing(null)}
				onCloseReport={closeReport}
				onReopen={reopenReport}
			/>
		</div>
	);
}
