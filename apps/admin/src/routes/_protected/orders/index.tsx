import { createFileRoute } from "@tanstack/react-router";
import { ORDERS } from "@/data/mockData";
import { OrdersTable } from "./components/OrdersTable";

export const Route = createFileRoute("/_protected/orders/")({
	component: OrdersPage,
});

function OrdersPage() {
	const completedCount = ORDERS.filter((o) => o.status === "completed").length;
	const cancelledCount = ORDERS.filter((o) => o.status === "cancelled").length;

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Orders</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{ORDERS.length} total · {completedCount} completed · {cancelledCount} cancelled
				</p>
			</div>
			<OrdersTable orders={ORDERS} />
		</div>
	);
}
