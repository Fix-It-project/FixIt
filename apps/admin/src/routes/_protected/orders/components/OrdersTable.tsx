import { Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { PAGE_SIZE, Pagination } from "@/components/Pagination";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusDropdown } from "@/components/StatusDropdown";
import { TableToolbar } from "@/components/TableToolbar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import {
	humanizeStatus,
	matchesAmountBucket,
	matchesDatePreset,
	matchesOrderFilter,
	statusVariant,
} from "@/lib/order-status";
import type {
	AdminOrder,
	AmountBucket,
	DateRangePreset,
	OrdersPageFilter,
} from "@/types";
import { OrdersFilters } from "./OrdersFilters";

const FILTER_KEYS: { key: OrdersPageFilter; label: string }[] = [
	{ key: "all", label: "All statuses" },
	{ key: "pending", label: "Pending" },
	{ key: "accepted", label: "Accepted" },
	{ key: "active", label: "Active" },
	{ key: "completed", label: "Completed" },
	{ key: "cancelled", label: "Cancelled" },
];

function exportToCSV(orders: AdminOrder[]) {
	const cols = [
		"Order ID",
		"Date",
		"Customer",
		"Technician",
		"Service",
		"Status",
		"Amount (EGP)",
		"Rating",
		"Review",
	];
	const rows = orders.map((o) =>
		[
			o.id,
			o.when,
			o.customer,
			o.tech,
			o.category,
			humanizeStatus(o.status),
			o.amount,
			o.review?.rating ?? "",
			(o.review?.comment ?? "").replace(/"/g, '""'),
		]
			.map((v) => `"${v}"`)
			.join(","),
	);
	const csv = [cols.join(","), ...rows].join("\n");
	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
	const a = Object.assign(document.createElement("a"), {
		href: url,
		download: "orders.csv",
	});
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

interface OrdersTableProps {
	orders: AdminOrder[];
	isLoading?: boolean;
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
	const [filter, setFilter] = useState<OrdersPageFilter>("all");
	const [search, setSearch] = useState("");
	const [datePreset, setDatePreset] = useState<DateRangePreset>("all");
	const [amountBucket, setAmountBucket] = useState<AmountBucket>("all");
	const [detailId, setDetailId] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	// base = everything except the status chip (so chip counts reflect the other filters)
	const base = orders.filter((o) => {
		if (search) {
			const q = search.toLowerCase();
			const hit =
				o.id.toLowerCase().includes(q) ||
				o.customer.toLowerCase().includes(q) ||
				o.tech.toLowerCase().includes(q);
			if (!hit) return false;
		}
		return (
			matchesDatePreset(o.createdAt, datePreset) &&
			matchesAmountBucket(o.amount, amountBucket)
		);
	});
	const visible = base.filter((o) => matchesOrderFilter(o.status, filter));

	const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
	useEffect(() => {
		setPage(1);
	}, [filter, search, datePreset, amountBucket]);
	useEffect(() => {
		if (page > pageCount) setPage(pageCount);
	}, [page, pageCount]);
	const pageStart = (page - 1) * PAGE_SIZE;
	const paged = visible.slice(pageStart, pageStart + PAGE_SIZE);

	return (
		<>
			<div className="flex flex-col gap-4">
				<TableToolbar<OrdersPageFilter>
					searchValue={search}
					onSearchChange={setSearch}
					searchPlaceholder="Search ID, customer, technician…"
					onExport={() => exportToCSV(visible)}
					trailing={
						<>
							<StatusDropdown
								value={filter}
								options={FILTER_KEYS.map(({ key, label }) => ({
									key,
									label,
									count:
										key === "all"
											? base.length
											: base.filter((o) => matchesOrderFilter(o.status, key))
													.length,
								}))}
								onChange={setFilter}
							/>
							<OrdersFilters
								datePreset={datePreset}
								onDatePreset={setDatePreset}
								amountBucket={amountBucket}
								onAmountBucket={setAmountBucket}
							/>
						</>
					}
				/>

				{/* Table */}
				<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
					<Table>
						<TableHeader>
							<TableRow className="border-border border-b bg-muted/40 hover:bg-muted/40">
								<TableHead className="h-11 pl-5 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									Order
								</TableHead>
								<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider md:table-cell">
									Date
								</TableHead>
								<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									Customer
								</TableHead>
								<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider lg:table-cell">
									Technician
								</TableHead>
								<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider sm:table-cell">
									Category
								</TableHead>
								<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									Status
								</TableHead>
								<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider md:table-cell">
									Review
								</TableHead>
								<TableHead className="h-11 pr-5 text-right font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									Amount
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && (
								<TableRow className="hover:bg-transparent">
									<TableCell
										colSpan={8}
										className="py-16 text-center text-muted-foreground text-sm"
									>
										Loading orders…
									</TableCell>
								</TableRow>
							)}
							{!isLoading && visible.length === 0 && (
								<TableRow className="hover:bg-transparent">
									<TableCell colSpan={8} className="py-16">
										<div className="flex flex-col items-center gap-2 text-muted-foreground">
											<Inbox className="h-8 w-8 opacity-50" />
											<p className="font-medium text-sm">
												No orders match these filters
											</p>
											<p className="text-xs">
												Try adjusting your search or filter selection.
											</p>
										</div>
									</TableCell>
								</TableRow>
							)}
							{paged.map((order) => {
								return (
									<TableRow
										key={order.id}
										onClick={() => setDetailId(order.id)}
										className="group cursor-pointer transition-colors hover:bg-muted/30"
									>
										<TableCell className="py-3 pl-5">
											<p className="font-mono font-semibold text-foreground text-xs">
												{order.id.slice(0, 8)}
											</p>
											<p className="mt-0.5 text-[11px] text-muted-foreground md:hidden">
												{order.when}
											</p>
										</TableCell>
										<TableCell className="hidden whitespace-nowrap py-3 text-muted-foreground text-xs md:table-cell">
											{order.when}
										</TableCell>
										<TableCell className="py-3 font-medium text-sm">
											{order.customer}
										</TableCell>
										<TableCell className="hidden py-3 lg:table-cell">
											<span className="font-medium text-foreground text-xs">
												{order.tech}
											</span>
										</TableCell>
										<TableCell className="hidden py-3 sm:table-cell">
											<CategoryTag
												meta={getCategoryMetaBySpecialty(order.category)}
												fallbackLabel={order.category}
												size="sm"
											/>
										</TableCell>
										<TableCell className="py-3">
											<StatusBadge
												variant={statusVariant(order.status)}
												label={humanizeStatus(order.status)}
											/>
										</TableCell>
										<TableCell className="hidden py-3 md:table-cell">
											{order.review ? (
												<StarRating rating={order.review.rating} />
											) : (
												<span className="text-muted-foreground/60 text-xs">
													—
												</span>
											)}
										</TableCell>
										<TableCell className="py-3 pr-5 text-right font-semibold text-sm tabular-nums">
											{order.amount > 0 ? (
												<span className="text-foreground">
													EGP {order.amount.toLocaleString()}
												</span>
											) : (
												<span className="text-muted-foreground/60">—</span>
											)}
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
					totalItems={visible.length}
					onPageChange={setPage}
				/>
			</div>

			<OrderDetailModal
				orderId={detailId}
				open={!!detailId}
				onClose={() => setDetailId(null)}
			/>
		</>
	);
}
