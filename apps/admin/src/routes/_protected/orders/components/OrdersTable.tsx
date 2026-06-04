import { Eye, Inbox, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { PAGE_SIZE, Pagination } from "@/components/Pagination";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar } from "@/components/TableToolbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
	ReviewView,
} from "@/types";
import { OrdersFilters } from "./OrdersFilters";
import { StatusDropdown } from "./StatusDropdown";

const FILTER_KEYS: { key: OrdersPageFilter; label: string }[] = [
	{ key: "all", label: "All statuses" },
	{ key: "pending", label: "Pending" },
	{ key: "accepted", label: "Accepted" },
	{ key: "active", label: "Active" },
	{ key: "completed", label: "Completed" },
	{ key: "cancelled", label: "Cancelled" },
];

function exportToCSV(orders: AdminOrder[]) {
	const cols = ["Order ID", "Date", "Customer", "Technician", "Service", "Status", "Amount (EGP)", "Rating", "Review"];
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
	const a = Object.assign(document.createElement("a"), { href: url, download: "orders.csv" });
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

interface OrdersTableProps {
	orders: AdminOrder[];
	isLoading?: boolean;
}

function toReviewView(order: AdminOrder): ReviewView | null {
	const r = order.review;
	if (!r || !r.comment) return null;
	return { rating: r.rating, comment: r.comment, customer: r.customer, date: r.date, orderId: order.id };
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
	const [filter, setFilter] = useState<OrdersPageFilter>("all");
	const [search, setSearch] = useState("");
	const [datePreset, setDatePreset] = useState<DateRangePreset>("all");
	const [amountBucket, setAmountBucket] = useState<AmountBucket>("all");
	const [expandedReason, setExpandedReason] = useState<string | null>(null);
	const [reviewView, setReviewView] = useState<ReviewView | null>(null);
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
		return matchesDatePreset(o.createdAt, datePreset) && matchesAmountBucket(o.amount, amountBucket);
	});
	const visible = base.filter((o) => matchesOrderFilter(o.status, filter));

	const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
	useEffect(() => { setPage(1); }, [filter, search, datePreset, amountBucket]);
	useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
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
									count: key === "all" ? base.length : base.filter((o) => matchesOrderFilter(o.status, key)).length,
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
							<TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
								<TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Order</TableHead>
								<TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Date</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Customer</TableHead>
								<TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Technician</TableHead>
								<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Category</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Status</TableHead>
								<TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Review</TableHead>
								<TableHead className="text-right pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && (
								<TableRow className="hover:bg-transparent">
									<TableCell colSpan={8} className="py-16 text-center text-muted-foreground text-sm">Loading orders…</TableCell>
								</TableRow>
							)}
							{!isLoading && visible.length === 0 && (
								<TableRow className="hover:bg-transparent">
									<TableCell colSpan={8} className="py-16">
										<div className="flex flex-col items-center gap-2 text-muted-foreground">
											<Inbox className="h-8 w-8 opacity-50" />
											<p className="text-sm font-medium">No orders match these filters</p>
											<p className="text-xs">Try adjusting your search or filter selection.</p>
										</div>
									</TableCell>
								</TableRow>
							)}
							{paged.map((order) => {
								const reviewItem = toReviewView(order);
								return (
									<TableRow key={order.id} className="group transition-colors hover:bg-muted/30">
										<TableCell className="pl-5 py-3">
											<p className="text-xs font-mono font-semibold text-foreground">{order.id.slice(0, 8)}</p>
											<p className="text-[11px] text-muted-foreground md:hidden mt-0.5">{order.when}</p>
										</TableCell>
										<TableCell className="hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap py-3">
											{order.when}
										</TableCell>
										<TableCell className="text-sm font-medium py-3">{order.customer}</TableCell>
										<TableCell className="hidden lg:table-cell py-3">
											<span className="text-xs text-foreground font-medium">{order.tech}</span>
										</TableCell>
										<TableCell className="hidden sm:table-cell py-3">
											<CategoryTag meta={getCategoryMetaBySpecialty(order.category)} fallbackLabel={order.category} size="sm" />
										</TableCell>
										<TableCell className="py-3">
											<div className="flex items-center gap-1.5 whitespace-nowrap">
												<StatusBadge variant={statusVariant(order.status)} label={humanizeStatus(order.status)} />
												{order.cancelReason && (
													<button
														type="button"
														onClick={() => setExpandedReason(order.cancelReason ?? null)}
														className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
														aria-label="View cancellation reason"
														title="View cancellation reason"
													>
														<Eye className="h-3.5 w-3.5" />
													</button>
												)}
											</div>
										</TableCell>
										<TableCell className="hidden md:table-cell py-3">
											{order.review ? (
												<div className="flex items-center gap-1.5">
													<StarRating rating={order.review.rating} />
													{reviewItem && (
														<button
															type="button"
															onClick={() => setReviewView(reviewItem)}
															className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
															aria-label="View review comment"
															title="View review comment"
														>
															<MessageSquare className="h-3.5 w-3.5" />
														</button>
													)}
												</div>
											) : (
												<span className="text-xs text-muted-foreground/60">—</span>
											)}
										</TableCell>
										<TableCell className="text-right pr-5 text-sm font-semibold tabular-nums py-3">
											{order.amount > 0 ? (
												<span className="text-foreground">EGP {order.amount.toLocaleString()}</span>
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

			<Dialog open={!!expandedReason} onOpenChange={() => setExpandedReason(null)}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Cancellation Reason</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground leading-relaxed">{expandedReason}</p>
				</DialogContent>
			</Dialog>

			<Dialog open={!!reviewView} onOpenChange={() => setReviewView(null)}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Customer Review</DialogTitle>
					</DialogHeader>
					{reviewView && (
						<div className="flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<StarRating rating={reviewView.rating} />
								<span className="text-[11px] font-mono text-muted-foreground">{reviewView.orderId.slice(0, 8)}</span>
							</div>
							<p className="text-sm text-foreground leading-relaxed bg-muted/40 rounded-lg p-3 border-l-2 border-primary">
								"{reviewView.comment}"
							</p>
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span className="font-medium text-foreground">{reviewView.customer}</span>
								<span>{reviewView.date}</span>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
