import { Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { PAGE_SIZE, Pagination } from "@/components/Pagination";
import { StarRating } from "@/components/StarRating";
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
import type { AdminHomeowner, HomeownerSort } from "@/types";
import { HomeownerCardList } from "./HomeownerCardList";
import { HomeownerSortDropdown } from "./HomeownerSortDropdown";

interface ActiveTabProps {
	homeowners: AdminHomeowner[];
	onView: (homeowner: AdminHomeowner) => void;
}

function sortHomeowners(
	homeowners: AdminHomeowner[],
	sort: HomeownerSort,
): AdminHomeowner[] {
	const arr = [...homeowners];
	switch (sort) {
		case "newest":
			return arr.sort((a, b) => +new Date(b.joinedAt) - +new Date(a.joinedAt));
		case "most_orders":
			return arr.sort((a, b) => b.totalOrders - a.totalOrders);
		case "most_spent":
			return arr.sort((a, b) => b.spendValue - a.spendValue);
		case "recent_order":
			return arr.sort(
				(a, b) =>
					(b.lastOrderAt ? +new Date(b.lastOrderAt) : 0) -
					(a.lastOrderAt ? +new Date(a.lastOrderAt) : 0),
			);
	}
}

function exportToCSV(homeowners: AdminHomeowner[]) {
	const cols = [
		"Name",
		"Phone",
		"Email",
		"City",
		"Joined",
		"Orders",
		"Completed",
		"Cancelled",
		"Spend (EGP k)",
		"Avg rating given",
		"Reports",
		"Last order",
	];
	const rows = homeowners.map((h) =>
		[
			h.name,
			h.phone,
			h.email,
			h.city,
			h.joined,
			h.totalOrders,
			h.completed,
			h.cancelled,
			h.spend,
			h.avgRatingGiven ?? "",
			h.reportCount,
			h.lastOrder,
		]
			.map((v) => `"${v}"`)
			.join(","),
	);
	const csv = [cols.join(","), ...rows].join("\n");
	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
	const a = Object.assign(document.createElement("a"), {
		href: url,
		download: "homeowners.csv",
	});
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export function ActiveTab({ homeowners, onView }: ActiveTabProps) {
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<HomeownerSort>("newest");
	const [page, setPage] = useState(1);

	const sorted = sortHomeowners(homeowners, sort);
	const filtered = sorted.filter(
		(h) =>
			h.name.toLowerCase().includes(search.toLowerCase()) ||
			h.city.toLowerCase().includes(search.toLowerCase()) ||
			h.email.toLowerCase().includes(search.toLowerCase()),
	);

	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	useEffect(() => {
		setPage(1);
	}, [sort, search]);
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
				searchPlaceholder="Search name, city, email…"
				onExport={() => exportToCSV(filtered)}
				trailing={<HomeownerSortDropdown value={sort} onChange={setSort} />}
			/>

			{/* Mobile card view */}
			<div className="md:hidden">
				<HomeownerCardList homeowners={paged} onView={onView} />
			</div>

			{/* Desktop table */}
			<div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
				<Table>
					<TableHeader>
						<TableRow className="border-border border-b bg-muted/40 hover:bg-muted/40">
							<TableHead className="h-11 pl-5 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Customer
							</TableHead>
							<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider lg:table-cell">
								Contact
							</TableHead>
							<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Orders
							</TableHead>
							<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Spend (EGP)
							</TableHead>
							<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider lg:table-cell">
								Rating given
							</TableHead>
							<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Reports
							</TableHead>
							<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider xl:table-cell">
								Last order
							</TableHead>
							<TableHead className="h-11 pr-5 text-right font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								Action
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
											No homeowners match these filters
										</p>
										<p className="text-xs">
											Try adjusting your search or filter selection.
										</p>
									</div>
								</TableCell>
							</TableRow>
						)}
						{paged.map((h) => {
							const cancellationRate =
								h.totalOrders > 0
									? Math.round((h.cancelled / h.totalOrders) * 100)
									: 0;
							return (
								<TableRow
									key={h.id}
									className="group transition-colors hover:bg-muted/30"
								>
									<TableCell className="py-3 pl-5">
										<div className="flex items-center gap-2.5">
											<TechAvatar
												initials={h.initials}
												color={h.color}
												size="sm"
											/>
											<div>
												<p className="font-semibold text-foreground text-sm">
													{h.name}
												</p>
												<p className="text-muted-foreground text-xs">
													{h.city}
												</p>
												{h.blockPending && (
													<span className="mt-0.5 inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 font-semibold text-[10px] text-amber-600 dark:text-amber-400">
														Block scheduled
													</span>
												)}
											</div>
										</div>
									</TableCell>
									<TableCell className="hidden py-3 lg:table-cell">
										<div className="flex flex-col">
											<span className="font-medium text-foreground text-xs">
												{h.phone}
											</span>
											<span className="text-[11px] text-muted-foreground">
												{h.email}
											</span>
										</div>
									</TableCell>
									<TableCell className="py-3">
										<div className="flex flex-col">
											<span className="font-medium text-foreground text-sm tabular-nums">
												{h.totalOrders}
											</span>
											{cancellationRate > 0 && (
												<span className="text-[11px] text-muted-foreground">
													{cancellationRate}% cancelled
												</span>
											)}
										</div>
									</TableCell>
									<TableCell className="py-3 font-medium text-foreground text-sm tabular-nums">
										{h.spend}
									</TableCell>
									<TableCell className="hidden py-3 lg:table-cell">
										{h.avgRatingGiven != null ? (
											<StarRating rating={h.avgRatingGiven} />
										) : (
											<span className="text-muted-foreground text-xs">
												No ratings
											</span>
										)}
									</TableCell>
									<TableCell className="py-3 text-sm tabular-nums">
										{h.reportCount > 0 ? (
											<span className="font-semibold text-destructive">
												{h.reportCount}
											</span>
										) : (
											<span className="text-muted-foreground/60">0</span>
										)}
									</TableCell>
									<TableCell className="hidden whitespace-nowrap py-3 text-muted-foreground text-xs xl:table-cell">
										{h.lastOrder}
									</TableCell>
									<TableCell className="py-3 pr-5 text-right">
										<Button
											size="sm"
											variant="outline"
											onClick={() => onView(h)}
										>
											View
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
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
