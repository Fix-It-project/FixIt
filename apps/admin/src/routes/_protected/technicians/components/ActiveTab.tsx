import { Inbox } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { PAGE_SIZE, Pagination } from "@/components/Pagination";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar } from "@/components/TableToolbar";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import type {
	AdminTechnician,
	AvailabilityFilter,
	TechnicianSort,
} from "@/types";
import { AvailabilityFilterDropdown } from "./AvailabilityFilterDropdown";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import { CompletionPill } from "./CompletionPill";
import { TechCardList } from "./TechCardList";
import { TechnicianSortDropdown } from "./TechnicianSortDropdown";

interface ActiveTabProps {
	techs: AdminTechnician[];
	onView: (tech: AdminTechnician) => void;
}

function exportToCSV(techs: AdminTechnician[]) {
	const cols = [
		"Name",
		"Category",
		"City",
		"Completed",
		"Rating",
		"Reviews",
		"Reports",
		"Revenue (EGP)",
		"Availability",
		"Joined",
	];
	const rows = techs.map((t) =>
		[
			t.name,
			t.specialty,
			t.city,
			t.completed,
			t.rating ?? "",
			t.reviews,
			t.reportCount,
			t.revenue,
			t.availability,
			t.joined,
		]
			.map((v) => `"${v}"`)
			.join(","),
	);
	const csv = [cols.join(","), ...rows].join("\n");
	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
	const a = Object.assign(document.createElement("a"), {
		href: url,
		download: "technicians.csv",
	});
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function filterByAvailability(
	techs: AdminTechnician[],
	f: AvailabilityFilter,
): AdminTechnician[] {
	if (f === "all") return techs;
	return techs.filter((t) => t.availability === f);
}

function sortTechs(
	techs: AdminTechnician[],
	sort: TechnicianSort,
): AdminTechnician[] {
	const copy = [...techs];
	switch (sort) {
		case "newest":
			return copy.sort((a, b) => +new Date(b.joinedAt) - +new Date(a.joinedAt));
		case "most_completed":
			return copy.sort((a, b) => b.completed - a.completed);
		case "highest_rating":
			return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
		case "most_revenue":
			return copy.sort((a, b) => b.revenueValue - a.revenueValue);
	}
}

export function ActiveTab({ techs, onView }: ActiveTabProps) {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<AvailabilityFilter>("all");
	const [category, setCategory] = useState("all");
	const [sort, setSort] = useState<TechnicianSort>("most_completed");
	const [page, setPage] = useState(1);

	const categoryOptions = useMemo(
		() => [...new Set(techs.map((t) => t.specialty).filter(Boolean))].sort(),
		[techs],
	);

	const byAvailability = filterByAvailability(techs, filter);
	const byCategory =
		category === "all"
			? byAvailability
			: byAvailability.filter((t) => t.specialty === category);
	const searched = byCategory.filter(
		(t) =>
			t.name.toLowerCase().includes(search.toLowerCase()) ||
			t.specialty.toLowerCase().includes(search.toLowerCase()),
	);
	const filtered = sortTechs(searched, sort);

	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	useEffect(() => {
		setPage(1);
	}, [filter, search, category, sort]);
	useEffect(() => {
		if (page > pageCount) setPage(pageCount);
	}, [page, pageCount]);
	const pageStart = (page - 1) * PAGE_SIZE;
	const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

	return (
		<div className="flex flex-col gap-4">
			<TableToolbar
				searchValue={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search name, category…"
				onExport={() => exportToCSV(filtered)}
				trailing={
					<>
						<AvailabilityFilterDropdown value={filter} onChange={setFilter} />
						<CategoryFilterDropdown
							value={category}
							options={categoryOptions}
							onChange={setCategory}
						/>
						<TechnicianSortDropdown value={sort} onChange={setSort} />
					</>
				}
			/>

			{/* Mobile card view */}
			<div className="md:hidden">
				<TechCardList techs={paged} onView={onView} />
			</div>

			{/* Desktop table */}
			<div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
				<Table>
					<TableHeader>
						<TableRow className="border-border border-b bg-muted/40 hover:bg-muted/40">
							<TableHead className="h-11 pl-5 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Technician
							</TableHead>
							<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider lg:table-cell">
								Category
							</TableHead>
							<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Completed
							</TableHead>
							<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider lg:table-cell">
								Rating
							</TableHead>
							<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Completion
							</TableHead>
							<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Reports
							</TableHead>
							<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider xl:table-cell">
								Availability
							</TableHead>
							<TableHead className="h-11 pr-5 text-right font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.length === 0 && (
							<TableRow className="hover:bg-transparent">
								<TableCell colSpan={8} className="py-16">
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<Inbox className="h-8 w-8 opacity-50" />
										<p className="font-medium text-sm">
											No technicians match these filters
										</p>
										<p className="text-xs">
											Try adjusting your search or filter selection.
										</p>
									</div>
								</TableCell>
							</TableRow>
						)}
						{paged.map((tech) => (
							<TableRow
								key={tech.id}
								className="group transition-colors hover:bg-muted/30"
							>
								<TableCell className="py-3 pl-5">
									<div className="flex items-center gap-2.5">
										<TechAvatar
											initials={tech.initials}
											color={tech.color}
											size="sm"
										/>
										<div>
											<p className="font-semibold text-foreground text-sm">
												{tech.name}
											</p>
											<p className="text-muted-foreground text-xs">
												{tech.city}
											</p>
											{tech.blockPending && (
												<span className="mt-0.5 inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 font-semibold text-[10px] text-amber-600 dark:text-amber-400">
													Block scheduled
												</span>
											)}
										</div>
									</div>
								</TableCell>
								<TableCell className="hidden py-3 lg:table-cell">
									<CategoryTag
										meta={getCategoryMetaBySpecialty(tech.specialty)}
										fallbackLabel={tech.specialty}
										size="sm"
									/>
								</TableCell>
								<TableCell className="py-3 text-sm tabular-nums">
									{tech.completed}
								</TableCell>
								<TableCell className="hidden py-3 lg:table-cell">
									{tech.rating != null ? (
										<StarRating rating={tech.rating} reviews={tech.reviews} />
									) : (
										<span className="text-muted-foreground/60 text-xs">
											No ratings
										</span>
									)}
								</TableCell>
								<TableCell className="py-3">
									<CompletionPill
										completed={tech.completed}
										total={tech.totalOrders}
									/>
								</TableCell>
								<TableCell className="py-3 text-sm tabular-nums">
									{tech.reportCount > 0 ? (
										<span className="font-semibold text-destructive">
											{tech.reportCount}
										</span>
									) : (
										<span className="text-muted-foreground/60">0</span>
									)}
								</TableCell>
								<TableCell className="hidden py-3 xl:table-cell">
									<StatusBadge
										variant={
											tech.availability === "online" ? "success" : "muted"
										}
										label={tech.availability}
									/>
								</TableCell>
								<TableCell className="py-3 pr-5 text-right">
									<Button
										size="sm"
										variant="outline"
										onClick={() => onView(tech)}
									>
										View
									</Button>
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
