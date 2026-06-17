import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { PAGE_SIZE } from "@/components/Pagination";
import type { OrdersCounts, OrdersListParams } from "@/types";
import { OrdersTable } from "./components/OrdersTable";
import { useOrders } from "./hooks/useOrders";

export const Route = createFileRoute("/_protected/orders/")({
	component: OrdersPage,
});

const EMPTY_COUNTS: OrdersCounts = {
	all: 0,
	pending: 0,
	accepted: 0,
	active: 0,
	completed: 0,
	cancelled: 0,
};

const INITIAL_PARAMS: OrdersListParams = {
	page: 1,
	pageSize: PAGE_SIZE,
	status: "all",
	search: "",
	date: "all",
	amount: "all",
};

function OrdersPage() {
	const [params, setParams] = useState<OrdersListParams>(INITIAL_PARAMS);
	const { data, isLoading, isFetching } = useOrders(params);

	const orders = data?.data ?? [];
	const total = data?.total ?? 0;
	const counts = data?.counts ?? EMPTY_COUNTS;

	// Any filter/search change resets to page 1; page changes keep the rest.
	const onParamsChange = useCallback((patch: Partial<OrdersListParams>) => {
		setParams((prev) => ({
			...prev,
			...patch,
			page: "page" in patch ? (patch.page ?? 1) : 1,
		}));
	}, []);

	return (
		<div className="flex flex-col gap-6 p-4 pb-12 sm:p-6 lg:p-8">
			<div>
				<h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
					Orders
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					{counts.all} total · {counts.completed} completed · {counts.cancelled}{" "}
					cancelled
				</p>
			</div>
			<OrdersTable
				orders={orders}
				total={total}
				counts={counts}
				isLoading={isLoading}
				isFetching={isFetching}
				params={params}
				onParamsChange={onParamsChange}
			/>
		</div>
	);
}
