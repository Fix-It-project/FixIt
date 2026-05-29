import { Inbox } from "lucide-react";
import { useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { TableToolbar, type ToolbarFilter } from "@/components/TableToolbar";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoryMetaById } from "@/lib/category-icons";
import type { Report, ReportSourceFilter } from "@/types";
import { ReportCardList } from "./ReportCardList";
import { RoleChip } from "./RoleChip";

const FILTER_KEYS: { key: ReportSourceFilter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "customer", label: "From customers" },
	{ key: "technician", label: "From technicians" },
];

interface OpenTabProps {
	reports: Report[];
	onView: (report: Report) => void;
}

function filterBySource(reports: Report[], f: ReportSourceFilter): Report[] {
	if (f === "all") return reports;
	return reports.filter((r) => r.reporterRole === f);
}

export function OpenTab({ reports, onView }: OpenTabProps) {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<ReportSourceFilter>("all");

	const bySource = filterBySource(reports, filter);
	const filtered = bySource.filter((r) => {
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
			<TableToolbar<ReportSourceFilter>
				searchValue={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search reporter, order, summary…"
				filters={FILTER_KEYS.map(({ key, label }): ToolbarFilter<ReportSourceFilter> => ({
					key,
					label,
					count: key === "all" ? reports.length : filterBySource(reports, key).length,
				}))}
				activeFilter={filter}
				onFilterChange={setFilter}
			/>

			{/* Mobile card view */}
			<div className="md:hidden">
				<ReportCardList reports={filtered} onView={onView} emptyLabel="No open reports match these filters." />
			</div>

			{/* Desktop table */}
			<div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
							<TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Reporter</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Order</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Summary</TableHead>
							<TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Against</TableHead>
							<TableHead className="hidden xl:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Filed</TableHead>
							<TableHead className="text-right pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.length === 0 && (
							<TableRow className="hover:bg-transparent">
								<TableCell colSpan={6} className="py-16">
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<Inbox className="h-8 w-8 opacity-50" />
										<p className="text-sm font-medium">No open reports match these filters</p>
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
								<TableCell className="hidden lg:table-cell text-sm py-3">{r.against}</TableCell>
								<TableCell className="hidden xl:table-cell text-xs text-muted-foreground py-3 whitespace-nowrap">{r.filedAt}</TableCell>
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
