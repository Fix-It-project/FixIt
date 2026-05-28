import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OrderSeries, Range } from "@/types";

interface OrdersAreaChartProps {
	range: Range;
	setRange: (range: Range) => void;
	series: OrderSeries | undefined;
	isLoading?: boolean;
}

const RANGES = [
	{ key: "7d", label: "7d" },
	{ key: "30d", label: "30d" },
	{ key: "90d", label: "90d" },
] as const;

export function OrdersAreaChart({ range, setRange, series, isLoading }: OrdersAreaChartProps) {
	const data = (series?.days ?? []).map((day, i) => ({
		day,
		ordersMade: series?.ordersMade[i] ?? 0,
		accepted: series?.accepted[i] ?? 0,
		completed: series?.completed[i] ?? 0,
	}));

	return (
		<Card className="flex flex-col">
			<CardHeader className="flex-row items-center justify-between gap-4 pb-2 flex-wrap">
				<div>
					<CardTitle className="text-base">Orders Over Time</CardTitle>
					<p className="text-xs text-muted-foreground mt-0.5">Made vs accepted vs completed per day</p>
				</div>
				<div className="flex gap-1 flex-shrink-0">
					{RANGES.map(({ key, label }) => (
						<button
							key={key}
							type="button"
							onClick={() => setRange(key)}
							className={cn(
								"px-3 py-1 rounded-full text-xs font-semibold transition-colors",
								range === key
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground hover:bg-muted/80",
							)}
						>
							{label}
						</button>
					))}
				</div>
			</CardHeader>
			<CardContent className="flex-1 min-h-0 pt-2">
				<div className="h-[220px] sm:h-[260px]">
					{isLoading ? (
						<div className="h-full w-full animate-pulse rounded-lg bg-muted/50" />
					) : (
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
							<defs>
								<linearGradient id="gradMade" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
								</linearGradient>
								<linearGradient id="gradAccepted" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
									<stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
								</linearGradient>
								<linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
									<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
							<XAxis
								dataKey="day"
								tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
								tickLine={false}
								axisLine={false}
								interval="preserveStartEnd"
							/>
							<YAxis
								tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
								tickLine={false}
								axisLine={false}
							/>
							<Tooltip
								contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
								labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
							/>
							<Area type="monotone" dataKey="ordersMade" name="Made" stroke="#3b82f6" fill="url(#gradMade)" strokeWidth={2} dot={false} />
							<Area type="monotone" dataKey="accepted" name="Accepted" stroke="#f59e0b" fill="url(#gradAccepted)" strokeWidth={2} dot={false} />
							<Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="url(#gradCompleted)" strokeWidth={2} dot={false} />
						</AreaChart>
					</ResponsiveContainer>
					)}
				</div>
				<div className="flex items-center gap-4 mt-3 flex-wrap">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<span className="h-2 w-4 rounded-full bg-blue-500" />
						Made
					</div>
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<span className="h-2 w-4 rounded-full bg-amber-500" />
						Accepted
					</div>
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<span className="h-2 w-4 rounded-full bg-emerald-500" />
						Completed
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
