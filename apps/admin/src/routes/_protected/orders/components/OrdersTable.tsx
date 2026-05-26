import { Eye, Inbox, MessageSquare } from "lucide-react";
import { useState } from "react";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar, type ToolbarFilter } from "@/components/TableToolbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CATEGORY_MAP, STATUS_META } from "@/data/mockData";
import type { Order, OrderReview } from "@/types/domain";

type Filter = "all" | "pending" | "active" | "completed" | "cancelled";

const FILTER_KEYS: { key: Filter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "pending", label: "Pending" },
	{ key: "active", label: "Active" },
	{ key: "completed", label: "Completed" },
	{ key: "cancelled", label: "Cancelled" },
];

function filterByStatus(orders: Order[], f: Filter): Order[] {
	if (f === "all") return orders;
	if (f === "active") return orders.filter((o) => o.status === "in_progress" || o.status === "accepted");
	return orders.filter((o) => o.status === f);
}

function exportToCSV(orders: Order[]) {
	const cols = ["Order ID", "Date", "Customer", "Technician", "Service", "Status", "Amount (EGP)", "Rating", "Review"];
	const rows = orders.map((o) =>
		[
			o.id,
			o.when,
			o.customer,
			o.tech,
			CATEGORY_MAP[o.category]?.name ?? o.category,
			o.status,
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
	orders: Order[];
}

interface ReviewView {
	rating: number;
	comment: string;
	customer: string;
	date: string;
	orderId: string;
}

function toReviewView(order: Order): ReviewView | null {
	const r: OrderReview | null | undefined = order.review;
	if (!r || !r.comment) return null;
	return { rating: r.rating, comment: r.comment, customer: r.customer, date: r.date, orderId: order.id };
}

export function OrdersTable({ orders }: OrdersTableProps) {
	const [filter, setFilter] = useState<Filter>("all");
	const [search, setSearch] = useState("");
	const [expandedReason, setExpandedReason] = useState<string | null>(null);
	const [reviewView, setReviewView] = useState<ReviewView | null>(null);

	const byStatus = filterByStatus(orders, filter);
	const visible = byStatus.filter((o) => {
		if (!search) return true;
		const q = search.toLowerCase();
		return (
			o.id.toLowerCase().includes(q) ||
			o.customer.toLowerCase().includes(q) ||
			o.tech.toLowerCase().includes(q)
		);
	});

	return (
		<>
			<div className="flex flex-col gap-4">
				<TableToolbar<Filter>
					searchValue={search}
					onSearchChange={setSearch}
					searchPlaceholder="Search ID, customer, technician…"
					filters={FILTER_KEYS.map(({ key, label }): ToolbarFilter<Filter> => ({
						key,
						label,
						count: key === "all" ? orders.length : filterByStatus(orders, key).length,
					}))}
					activeFilter={filter}
					onFilterChange={setFilter}
					onExport={() => exportToCSV(visible)}
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
								<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Service</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Status</TableHead>
								<TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Review</TableHead>
								<TableHead className="text-right pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{visible.length === 0 && (
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
							{visible.map((order) => {
								const meta = STATUS_META[order.status];
								const cat = CATEGORY_MAP[order.category];
								const reviewItem = toReviewView(order);
								return (
									<TableRow key={order.id} className="group transition-colors hover:bg-muted/30">
										<TableCell className="pl-5 py-3">
											<p className="text-xs font-mono font-semibold text-foreground">{order.id}</p>
											<p className="text-[11px] text-muted-foreground md:hidden mt-0.5">{order.when}</p>
										</TableCell>
										<TableCell className="hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap py-3">
											{order.when}
										</TableCell>
										<TableCell className="text-sm font-medium py-3">{order.customer}</TableCell>
										<TableCell className="hidden lg:table-cell py-3">
											<span className="text-xs text-foreground font-medium">{order.tech}</span>
										</TableCell>
										<TableCell className="hidden sm:table-cell text-xs text-foreground py-3">
											{cat && (
												<span className="inline-flex items-center gap-1.5">
													<span
														className="h-1.5 w-1.5 rounded-full flex-shrink-0"
														style={{ backgroundColor: cat.color }}
													/>
													{cat.name}
												</span>
											)}
											{!cat && <span>{order.category}</span>}
										</TableCell>
										<TableCell className="py-3">
											<div className="flex items-center gap-1.5 whitespace-nowrap">
												{meta && <StatusBadge variant={meta.cls} label={meta.label} />}
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

				<p className="text-xs text-muted-foreground">
					Showing <span className="font-semibold text-foreground tabular-nums">{visible.length}</span> of{" "}
					<span className="tabular-nums">{orders.length}</span> orders
				</p>
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
								<span className="text-[11px] font-mono text-muted-foreground">{reviewView.orderId}</span>
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
