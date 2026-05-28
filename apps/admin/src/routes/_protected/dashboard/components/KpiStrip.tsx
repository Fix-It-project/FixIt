import { Activity, List, Star, Wallet } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

const ICONS: Record<string, React.ReactNode> = {
	list: <List className="h-4 w-4" />,
	activity: <Activity className="h-4 w-4" />,
	wallet: <Wallet className="h-4 w-4" />,
	star: <Star className="h-4 w-4" />,
};

export function KpiStrip() {
	const { data, isLoading } = useDashboardSummary();
	const kpis = data?.kpis ?? [];

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="h-[148px] animate-pulse rounded-xl bg-muted/50" />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{kpis.map((kpi) => {
				const up = kpi.delta >= 0;
				const sparkData = kpi.trend.map((v) => ({ v }));
				return (
					<Card key={kpi.label} className="p-0 overflow-hidden">
						<CardContent className="p-4 sm:p-5">
							<div className="flex items-start justify-between gap-2">
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
								<span className="h-8 w-8 rounded-[10px] bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
									{ICONS[kpi.icon] ?? <List className="h-4 w-4" />}
								</span>
							</div>

							<div className="mt-2 flex items-end justify-between gap-2">
								<p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{kpi.value}</p>
								<span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", up ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive")}>
									{up ? "+" : ""}{kpi.delta}%
								</span>
							</div>

							<div className="mt-3 h-8">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={sparkData}>
										<Line
											type="monotone"
											dataKey="v"
											stroke={up ? "#10b981" : "#ef4444"}
											strokeWidth={1.5}
											dot={false}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>

							<p className="mt-1 text-[11px] text-muted-foreground">
								{kpi.deltaLabel}
								{kpi.previous != null && <span className="ml-1">· last mo: {kpi.previous}</span>}
							</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
