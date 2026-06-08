import { createFileRoute } from "@tanstack/react-router";
import { recentOrderStatusBucket } from "@/lib/order-status";
import { OrdersTable } from "./components/OrdersTable";
import { useOrders } from "./hooks/useOrders";

export const Route = createFileRoute("/_protected/orders/")({
	component: OrdersPage,
});

function OrdersPage() {
	const { data, isLoading } = useOrders();
	const orders = data ?? [];
	const completedCount = orders.filter(
		(o) => recentOrderStatusBucket(o.status) === "completed",
	).length;
	const cancelledCount = orders.filter(
		(o) => recentOrderStatusBucket(o.status) === "cancelled",
	).length;

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Orders</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{orders.length} total · {completedCount} completed · {cancelledCount} cancelled
				</p>
			</div>
			<OrdersTable orders={orders} isLoading={isLoading} />
		</div>
	);
}
