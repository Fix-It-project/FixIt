import { Eye } from "lucide-react";
import { useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { StatusBadge } from "@/components/StatusBadge";
import { TechAvatar } from "@/components/TechAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RECENT_ORDERS, STATUS_META } from "@/data/mockData";
import { getCategoryMetaById } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/domain";

type Filter = "all" | "active" | "completed" | "cancelled";

const FILTERS: { key: Filter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "active", label: "Active" },
	{ key: "completed", label: "Completed" },
	{ key: "cancelled", label: "Cancelled" },
];

function filterOrders(orders: Order[], f: Filter) {
	if (f === "all") return orders;
	if (f === "active") return orders.filter((o) => o.status === "in_progress" || o.status === "accepted");
	return orders.filter((o) => o.status === f);
}

export function RecentOrdersTable() {
	const [filter, setFilter] = useState<Filter>("all");
	const [expandedReason, setExpandedReason] = useState<string | null>(null);

	const visible = filterOrders(RECENT_ORDERS, filter);

	return (
		<>
			<Card className="flex flex-col min-h-0">
				<CardHeader className="pb-3">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<CardTitle className="text-base">Recent Orders</CardTitle>
						<div className="flex gap-1 flex-wrap">
							{FILTERS.map(({ key, label }) => (
								<button
									key={key}
									type="button"
									onClick={() => setFilter(key)}
									className={cn(
										"px-3 py-1 rounded-full text-xs font-semibold transition-colors",
										filter === key
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground hover:bg-muted/80",
									)}
								>
									{label}
								</button>
							))}
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0 overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-4 sm:pl-6">Order</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead className="hidden sm:table-cell">Tech</TableHead>
								<TableHead className="hidden md:table-cell">Category</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="hidden sm:table-cell text-right pr-4 sm:pr-6">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{visible.length === 0 && (
								<TableRow>
									<TableCell colSpan={6} className="text-center text-muted-foreground py-8">
										No orders for this filter.
									</TableCell>
								</TableRow>
							)}
							{visible.map((order) => {
								const meta = STATUS_META[order.status];
								const cat = getCategoryMetaById(order.category);
								return (
									<TableRow key={order.id}>
										<TableCell className="pl-4 sm:pl-6">
											<div>
												<p className="text-xs font-semibold text-foreground">{order.id}</p>
												<p className="text-[11px] text-muted-foreground">{order.when}</p>
											</div>
										</TableCell>
										<TableCell className="text-sm">{order.customer}</TableCell>
										<TableCell className="hidden sm:table-cell">
											<div className="flex items-center gap-2">
												<TechAvatar initials={order.techInitials} color={order.techColor} size="sm" />
												<span className="text-xs text-foreground hidden lg:block">{order.tech}</span>
											</div>
										</TableCell>
										<TableCell className="hidden md:table-cell">
											<CategoryTag meta={cat} fallbackLabel={order.category} size="sm" />
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1.5 whitespace-nowrap">
												{meta && <StatusBadge variant={meta.cls} label={meta.label} />}
												{order.cancelReason && (
													<button
														type="button"
														onClick={() => setExpandedReason(order.cancelReason ?? null)}
														className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0"
														aria-label="View cancellation reason"
														title="View cancellation reason"
													>
														<Eye className="h-3.5 w-3.5" />
													</button>
												)}
											</div>
										</TableCell>
										<TableCell className="hidden sm:table-cell text-right text-sm font-medium tabular-nums pr-4 sm:pr-6">
											{order.amount > 0 ? `EGP ${order.amount.toLocaleString()}` : "—"}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Dialog open={!!expandedReason} onOpenChange={() => setExpandedReason(null)}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Cancellation Reason</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground leading-relaxed">{expandedReason}</p>
				</DialogContent>
			</Dialog>
		</>
	);
}
