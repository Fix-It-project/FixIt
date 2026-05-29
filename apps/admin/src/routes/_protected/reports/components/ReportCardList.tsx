import { CategoryTag } from "@/components/CategoryTag";
import { StatusBadge } from "@/components/StatusBadge";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import { getCategoryMetaById } from "@/lib/category-icons";
import type { Report } from "@/types";
import { RoleChip } from "./RoleChip";

interface ReportCardListProps {
	reports: Report[];
	onView: (report: Report) => void;
	emptyLabel: string;
}

export function ReportCardList({ reports, onView, emptyLabel }: ReportCardListProps) {
	if (reports.length === 0) {
		return <p className="text-center text-muted-foreground py-8 text-sm">{emptyLabel}</p>;
	}
	return (
		<div className="flex flex-col gap-3">
			{reports.map((r) => (
				<div
					key={r.id}
					className="text-left rounded-lg border border-border bg-card p-3"
				>
					<div className="flex items-start gap-3">
						<TechAvatar initials={r.reporterInitials} color={r.reporterColor} size="md" />
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<p className="text-sm font-semibold text-foreground truncate">{r.reporterName}</p>
								<RoleChip role={r.reporterRole} />
							</div>
							<p className="text-xs text-muted-foreground mt-0.5">vs {r.against} · {r.filedAt}</p>
							<p className="text-sm text-foreground mt-1.5 line-clamp-2">{r.summary}</p>
							<div className="flex items-center gap-2 mt-2 flex-wrap">
								<span className="text-[11px] font-mono text-muted-foreground">{r.orderId}</span>
								<CategoryTag meta={getCategoryMetaById(r.category)} fallbackLabel={r.category} size="sm" hideLabel />
								{r.status === "closed" && r.resolution && (
									<StatusBadge
										variant={r.resolution === "resolved" ? "success" : "muted"}
										label={r.resolution}
									/>
								)}
							</div>
						</div>
						<Button size="sm" variant="outline" onClick={() => onView(r)}>View</Button>
					</div>
				</div>
			))}
		</div>
	);
}
