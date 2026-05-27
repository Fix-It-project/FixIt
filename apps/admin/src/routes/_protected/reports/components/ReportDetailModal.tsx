import { AlertCircle, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { CategoryTag } from "@/components/CategoryTag";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCategoryMetaById } from "@/lib/category-icons";
import type { Report, ReportResolution } from "@/types/domain";
import { RoleChip } from "./RoleChip";

interface ReportDetailModalProps {
	report: Report | null;
	open: boolean;
	onClose: () => void;
	onCloseReport: (id: string, resolution: ReportResolution) => void;
	onReopen: (id: string) => void;
}

function headerStyle(report: Report) {
	if (report.status === "open") {
		return {
			bg: "bg-amber-500/10 border-amber-500/20",
			iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
			Icon: AlertCircle,
			label: "Open",
		};
	}
	if (report.resolution === "resolved") {
		return {
			bg: "bg-emerald-500/10 border-emerald-500/20",
			iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
			Icon: CheckCircle2,
			label: "Resolved",
		};
	}
	return {
		bg: "bg-muted border-border",
		iconBg: "bg-muted-foreground/15 text-muted-foreground",
		Icon: XCircle,
		label: "Dismissed",
	};
}

export function ReportDetailModal({ report, open, onClose, onCloseReport, onReopen }: ReportDetailModalProps) {
	if (!report) return null;

	const style = headerStyle(report);
	const Icon = style.Icon;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
				<div className={`px-6 py-4 border-b ${style.bg}`}>
					<div className="flex items-start gap-3">
						<span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${style.iconBg}`}>
							<Icon className="h-5 w-5" />
						</span>
						<div className="flex-1 min-w-0">
							<DialogHeader>
								<DialogTitle className="text-base font-semibold leading-tight">{report.summary}</DialogTitle>
							</DialogHeader>
							<div className="flex items-center gap-2 mt-1.5 flex-wrap">
								<span className="text-[11px] font-mono text-muted-foreground">{report.id}</span>
								<span className="text-xs text-muted-foreground">·</span>
								<span className="text-[11px] uppercase tracking-widest font-semibold text-foreground">{style.label}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="px-6 py-5 flex flex-col gap-5">
					{/* Reporter block */}
					<div className="flex items-center gap-3">
						<TechAvatar initials={report.reporterInitials} color={report.reporterColor} size="md" />
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<p className="text-sm font-semibold text-foreground truncate">{report.reporterName}</p>
								<RoleChip role={report.reporterRole} />
							</div>
							<p className="text-xs text-muted-foreground">Filed {report.filedAt}</p>
						</div>
					</div>

					{/* Metadata grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
						<div className="flex justify-between gap-3">
							<span className="text-muted-foreground">Against</span>
							<span className="text-foreground font-medium text-right">{report.against}</span>
						</div>
						<div className="flex justify-between gap-3">
							<span className="text-muted-foreground">Order</span>
							<span className="text-foreground font-mono">{report.orderId}</span>
						</div>
						<div className="flex justify-between gap-3 items-center">
							<span className="text-muted-foreground">Category</span>
							<CategoryTag meta={getCategoryMetaById(report.category)} fallbackLabel={report.category} size="sm" />
						</div>
						{report.status === "closed" && (
							<>
								<div className="flex justify-between gap-3">
									<span className="text-muted-foreground">Closed</span>
									<span className="text-foreground">{report.closedAt}</span>
								</div>
								<div className="flex justify-between gap-3 sm:col-span-2">
									<span className="text-muted-foreground">Closed by</span>
									<span className="text-foreground">{report.closedBy}</span>
								</div>
							</>
						)}
					</div>

					{/* Description */}
					<div className="border-t border-border pt-4">
						<p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">Description</p>
						<p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{report.description}</p>
					</div>
				</div>

				<div className="px-6 py-4 bg-muted/30 border-t border-border flex flex-wrap items-center gap-2 justify-end">
					<Button variant="outline" size="sm" onClick={onClose}>Close</Button>
					{report.status === "open" ? (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={() => { onCloseReport(report.id, "dismissed"); onClose(); }}
							>
								<XCircle className="h-4 w-4 mr-1.5" />
								Dismiss
							</Button>
							<Button
								size="sm"
								onClick={() => { onCloseReport(report.id, "resolved"); onClose(); }}
							>
								<CheckCircle2 className="h-4 w-4 mr-1.5" />
								Mark resolved
							</Button>
						</>
					) : (
						<Button
							variant="outline"
							size="sm"
							onClick={() => { onReopen(report.id); onClose(); }}
						>
							<RotateCcw className="h-4 w-4 mr-1.5" />
							Reopen
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
