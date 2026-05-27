import { createFileRoute } from "@tanstack/react-router";
import { CategoryDonutChart } from "./components/CategoryDonutChart";
import { KpiStrip } from "./components/KpiStrip";
import { OrdersAreaChart } from "./components/OrdersAreaChart";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import { StatusBarRow } from "./components/StatusBarRow";
import { TopTechniciansList } from "./components/TopTechniciansList";
import { useRangeFilter } from "./hooks/useRangeFilter";

export const Route = createFileRoute("/_protected/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const { range, setRange, series } = useRangeFilter();

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			{/* Page header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
					<p className="text-sm text-muted-foreground mt-1">Welcome back — here's what's happening today.</p>
				</div>
			</div>

			{/* KPI cards */}
			<KpiStrip />

			{/* Charts row */}
			<div className="grid grid-cols-1 lg:grid-cols-[2.4fr_1fr] gap-4">
				<OrdersAreaChart range={range} setRange={setRange} series={series} />
				<div className="flex flex-col gap-4">
					<CategoryDonutChart />
					<StatusBarRow />
				</div>
			</div>

			{/* Tables row */}
			<div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
				<RecentOrdersTable />
				<TopTechniciansList />
			</div>
		</div>
	);
}
