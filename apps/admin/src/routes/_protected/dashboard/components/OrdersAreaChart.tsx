import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { useRangeFilter } from "../hooks/useRangeFilter";

type RangeFilterReturn = ReturnType<typeof useRangeFilter>;

interface OrdersAreaChartProps {
	range: RangeFilterReturn["range"];
	setRange: RangeFilterReturn["setRange"];
	series: RangeFilterReturn["series"];
}

const RANGES = [
	{ key: "7d", label: "7d" },
	{ key: "30d", label: "30d" },
	{ key: "90d", label: "90d" },
] as const;

export function OrdersAreaChart({ range, setRange, series }: OrdersAreaChartProps) {
	const data = series.days.map((day, i) => ({
		day: `Day ${day}`,
		homeowner: series.homeowner[i],
		technician: series.technician[i],
	}));

	return (
		<Card className="flex flex-col">
			<CardHeader className="flex-row items-center justify-between gap-4 pb-2 flex-wrap">
				<div>
					<CardTitle className="text-base">Orders Over Time</CardTitle>
					<p className="text-xs text-muted-foreground mt-0.5">Homeowner vs technician order volumes</p>
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
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
							<defs>
								<linearGradient id="gradHomeowner" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
								</linearGradient>
								<linearGradient id="gradTechnician" x1="0" y1="0" x2="0" y2="1">
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
							<Area type="monotone" dataKey="homeowner" name="Homeowners" stroke="#3b82f6" fill="url(#gradHomeowner)" strokeWidth={2} dot={false} />
							<Area type="monotone" dataKey="technician" name="Technicians" stroke="#10b981" fill="url(#gradTechnician)" strokeWidth={2} dot={false} />
						</AreaChart>
					</ResponsiveContainer>
				</div>
				<div className="flex items-center gap-4 mt-3">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<span className="h-2 w-4 rounded-full bg-blue-500" />
						Homeowners
					</div>
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<span className="h-2 w-4 rounded-full bg-emerald-500" />
						Technicians
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
