import { Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { PAGE_SIZE, Pagination } from "@/components/Pagination";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar, type ToolbarFilter } from "@/components/TableToolbar";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import type { ActiveTech, AvailabilityFilter } from "@/types";
import { CompletionPill } from "./CompletionPill";
import { TechCardList } from "./TechCardList";

const FILTER_KEYS: { key: AvailabilityFilter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "online", label: "Online" },
	{ key: "offline", label: "Offline" },
];

interface ActiveTabProps {
	techs: ActiveTech[];
	onView: (tech: ActiveTech) => void;
	onBlock?: (tech: ActiveTech) => void;
}

function exportToCSV(techs: ActiveTech[]) {
	const cols = ["Name", "Category", "City", "Completed", "Rating", "Reviews", "Revenue (EGP k)", "Availability", "Joined"];
	const rows = techs.map((t) =>
		[t.name, t.specialty, t.city, t.completed, t.rating, t.reviews, t.revenue, t.availability, t.joined]
			.map((v) => `"${v}"`).join(","),
	);
	const csv = [cols.join(","), ...rows].join("\n");
	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
	const a = Object.assign(document.createElement("a"), { href: url, download: "technicians.csv" });
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function filterByAvailability(techs: ActiveTech[], f: AvailabilityFilter): ActiveTech[] {
	if (f === "all") return techs;
	return techs.filter((t) => t.availability === f);
}

export function ActiveTab({ techs, onView }: ActiveTabProps) {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<AvailabilityFilter>("all");
	const [page, setPage] = useState(1);

	const byAvailability = filterByAvailability(techs, filter);
	const filtered = byAvailability.filter((t) =>
		t.name.toLowerCase().includes(search.toLowerCase()) ||
		t.specialty.toLowerCase().includes(search.toLowerCase()),
	);

	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	useEffect(() => { setPage(1); }, [filter, search]);
	useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
	const pageStart = (page - 1) * PAGE_SIZE;
	const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

	return (
		<div className="flex flex-col gap-4">
			<TableToolbar<AvailabilityFilter>
				searchValue={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search name, category…"
				filters={FILTER_KEYS.map(({ key, label }): ToolbarFilter<AvailabilityFilter> => ({
					key,
					label,
					count: key === "all" ? techs.length : filterByAvailability(techs, key).length,
				}))}
				activeFilter={filter}
				onFilterChange={setFilter}
				onExport={() => exportToCSV(filtered)}
			/>

			{/* Mobile card view */}
			<div className="md:hidden">
				<TechCardList
					techs={paged}
					onView={onView}
				/>
			</div>

			{/* Desktop table */}
			<div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
							<TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Technician</TableHead>
							<TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Category</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Completed</TableHead>
							<TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Rating</TableHead>
							<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Completion</TableHead>
							<TableHead className="hidden xl:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Availability</TableHead>
							<TableHead className="text-right pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.length === 0 && (
							<TableRow className="hover:bg-transparent">
								<TableCell colSpan={7} className="py-16">
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<Inbox className="h-8 w-8 opacity-50" />
										<p className="text-sm font-medium">No technicians match these filters</p>
										<p className="text-xs">Try adjusting your search or filter selection.</p>
									</div>
								</TableCell>
							</TableRow>
						)}
						{paged.map((tech) => (
							<TableRow key={tech.id} className="group transition-colors hover:bg-muted/30">
								<TableCell className="pl-5 py-3">
									<div className="flex items-center gap-2.5">
										<TechAvatar initials={tech.initials} color={tech.color} size="sm" />
										<div>
											<p className="text-sm font-semibold text-foreground">{tech.name}</p>
											<p className="text-xs text-muted-foreground">{tech.city}</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="hidden lg:table-cell py-3">
									<CategoryTag meta={getCategoryMetaBySpecialty(tech.specialty)} fallbackLabel={tech.specialty} size="sm" />
								</TableCell>
								<TableCell className="text-sm tabular-nums py-3">{tech.completed}</TableCell>
								<TableCell className="hidden lg:table-cell py-3">
									<StarRating rating={tech.rating} reviews={tech.reviews} />
								</TableCell>
								<TableCell className="py-3"><CompletionPill history={tech.history} /></TableCell>
								<TableCell className="hidden xl:table-cell py-3">
									<StatusBadge variant={tech.availability === "online" ? "success" : "muted"} label={tech.availability} />
								</TableCell>
								<TableCell className="text-right pr-5 py-3">
									<Button size="sm" variant="outline" onClick={() => onView(tech)}>View</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Pagination
				page={page}
				pageCount={pageCount}
				pageSize={PAGE_SIZE}
				totalItems={filtered.length}
				onPageChange={setPage}
			/>
		</div>
	);
}
