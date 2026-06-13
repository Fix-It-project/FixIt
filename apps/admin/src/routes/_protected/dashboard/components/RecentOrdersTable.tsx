import { useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusDropdown } from "@/components/StatusDropdown";
import { TechAvatar } from "@/components/TechAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	matchesOrderFilter,
	statusVariant,
} from "@/lib/order-status";
import type { OrdersPageFilter } from "@/types";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

const FILTER_KEYS: { key: OrdersPageFilter; label: string }[] = [
	{ key: "all", label: "All statuses" },
	{ key: "pending", label: "Pending" },
	{ key: "accepted", label: "Accepted" },
	{ key: "active", label: "Active" },
	{ key: "completed", label: "Completed" },
	{ key: "cancelled", label: "Cancelled" },
];

export function RecentOrdersTable() {
	const { data, isLoading } = useDashboardSummary();
	const [filter, setFilter] = useState<OrdersPageFilter>("all");
	const [detailId, setDetailId] = useState<string | null>(null);

	const orders = data?.recentOrders ?? [];
	const visible = orders.filter((o) => matchesOrderFilter(o.status, filter));

	return (
		<>
			<Card className="flex min-h-0 flex-col">
				<CardHeader className="pb-3">
					<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
						<CardTitle className="text-base">Recent Orders</CardTitle>
						<StatusDropdown
							value={filter}
							options={FILTER_KEYS.map(({ key, label }) => ({
								key,
								label,
								count:
									key === "all"
										? orders.length
										: orders.filter((o) => matchesOrderFilter(o.status, key))
												.length,
							}))}
							onChange={setFilter}
						/>
					</div>
				</CardHeader>
				<CardContent className="overflow-x-auto p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-4 sm:pl-6">Order</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead className="hidden sm:table-cell">Tech</TableHead>
								<TableHead className="hidden md:table-cell">Category</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="hidden pr-4 text-right sm:table-cell sm:pr-6">
									Amount
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && (
								<TableRow>
									<TableCell
										colSpan={6}
										className="py-8 text-center text-muted-foreground"
									>
										Loading…
									</TableCell>
								</TableRow>
							)}
							{!isLoading && visible.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={6}
										className="py-8 text-center text-muted-foreground"
									>
										No orders for this filter.
									</TableCell>
								</TableRow>
							)}
							{visible.map((order) => {
								const cat = getCategoryMetaBySpecialty(order.category);
								return (
									<TableRow
										key={order.id}
										onClick={() => setDetailId(order.id)}
										className="cursor-pointer transition-colors hover:bg-muted/30"
									>
										<TableCell className="pl-4 sm:pl-6">
											<div>
												<p className="font-semibold text-foreground text-xs">
													{order.id.slice(0, 8)}
												</p>
												<p className="text-[11px] text-muted-foreground">
													{order.when}
												</p>
											</div>
										</TableCell>
										<TableCell className="text-sm">{order.customer}</TableCell>
										<TableCell className="hidden sm:table-cell">
											<div className="flex items-center gap-2">
												<TechAvatar
													initials={order.techInitials}
													color={order.techColor}
													size="sm"
												/>
												<span className="hidden text-foreground text-xs lg:block">
													{order.tech}
												</span>
											</div>
										</TableCell>
										<TableCell className="hidden md:table-cell">
											<CategoryTag
												meta={cat}
												fallbackLabel={order.category}
												size="sm"
											/>
										</TableCell>
										<TableCell>
											<StatusBadge
												variant={statusVariant(order.status)}
												label={humanizeStatus(order.status)}
											/>
										</TableCell>
										<TableCell className="hidden pr-4 text-right font-medium text-sm tabular-nums sm:table-cell sm:pr-6">
											{order.amount > 0
												? `EGP ${order.amount.toLocaleString()}`
												: "—"}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<OrderDetailModal
				orderId={detailId}
				open={!!detailId}
				onClose={() => setDetailId(null)}
			/>
		</>
	);
}
