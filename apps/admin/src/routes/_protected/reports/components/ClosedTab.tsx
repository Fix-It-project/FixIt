import { Inbox } from "lucide-react";
import { useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar, type ToolbarFilter } from "@/components/TableToolbar";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoryMetaById } from "@/lib/category-icons";
import type { Report, ReportResolution } from "@/types/domain";
import { ReportCardList } from "./ReportCardList";
import { RoleChip } from "./RoleChip";

type ResolutionFilter = "all" | ReportResolution;

const FILTER_KEYS: { key: ResolutionFilter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "resolved", label: "Resolved" },
	{ key: "dismissed", label: "Dismissed" },
];

interface ClosedTabProps {
	reports: Report[];
	onView: (report: Report) => void;
}

function filterByResolution(reports: Report[], f: ResolutionFilter): Report[] {
	if (f === "all") return reports;
	return reports.filter((r) => r.resolution === f);
}

export function ClosedTab({ reports, onView }: ClosedTabProps) {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<ResolutionFilter>("all");

	const byResolution = filterByResolution(reports, filter);
	const filtered = byResolution.filter((r) => {
		const q = search.toLowerCase();
		return (
			r.reporterName.toLowerCase().includes(q) ||
			r.against.toLowerCase().includes(q) ||
			r.orderId.toLowerCase().includes(q) ||
			r.summary.toLowerCase().includes(q)
		);
	});

	return (
		<div className="flex flex-col gap-4">
			<TableToolbar<ResolutionFilter>
				searchValue={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search reporter, order, summary…"
				filters={FILTER_KEYS.map(({ key, label }): ToolbarFilter<ResolutionFilter> => ({
					key,
					label,
					count: key === "all" ? reports.length : filterByResolution(reports, key).length,
				}))}
				activeFilter={filter}
				onFilterChange={setFilter}
			/>

			{/* Mobile card view */}
			<div className="md:hidden">
				<ReportCardList reports={filtered} onView={onView} emptyLabel="No closed reports match these filters." />
			</div>

			{/* Desktop table */}
			<div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
							<TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Reporter</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Order</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Summary</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Resolution</TableHead>
							<TableHead className="hidden xl:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Closed</TableHead>
							<TableHead className="text-right pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.length === 0 && (
							<TableRow className="hover:bg-transparent">
								<TableCell colSpan={6} className="py-16">
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<Inbox className="h-8 w-8 opacity-50" />
										<p className="text-sm font-medium">No closed reports match these filters</p>
										<p className="text-xs">Try adjusting your search or filter selection.</p>
									</div>
								</TableCell>
							</TableRow>
						)}
						{filtered.map((r) => (
							<TableRow key={r.id} className="group transition-colors hover:bg-muted/30 cursor-pointer" onClick={() => onView(r)}>
								<TableCell className="pl-5 py-3">
									<div className="flex items-center gap-2.5">
										<TechAvatar initials={r.reporterInitials} color={r.reporterColor} size="sm" />
										<div className="min-w-0">
											<p className="text-sm font-semibold text-foreground truncate">{r.reporterName}</p>
											<div className="mt-0.5"><RoleChip role={r.reporterRole} /></div>
										</div>
									</div>
								</TableCell>
								<TableCell className="py-3">
									<div className="flex flex-col gap-1">
										<span className="text-xs font-mono text-foreground">{r.orderId}</span>
										<CategoryTag meta={getCategoryMetaById(r.category)} fallbackLabel={r.category} size="sm" hideLabel />
									</div>
								</TableCell>
								<TableCell className="py-3 max-w-[320px]">
									<p className="text-sm text-foreground line-clamp-2">{r.summary}</p>
								</TableCell>
								<TableCell className="py-3">
									{r.resolution && (
										<StatusBadge
											variant={r.resolution === "resolved" ? "success" : "muted"}
											label={r.resolution}
										/>
									)}
								</TableCell>
								<TableCell className="hidden xl:table-cell text-xs text-muted-foreground py-3 whitespace-nowrap">{r.closedAt}</TableCell>
								<TableCell className="text-right pr-5 py-3">
									<Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onView(r); }}>View</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
