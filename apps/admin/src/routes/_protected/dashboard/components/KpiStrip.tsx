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
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{[0, 1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-[148px] animate-pulse rounded-xl bg-muted/50"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{kpis.map((kpi) => {
				const up = (kpi.delta ?? 0) >= 0;
				const sparkData = kpi.trend.map((v) => ({ v }));
				return (
					<Card key={kpi.label} className="overflow-hidden p-0">
						<CardContent className="p-4 sm:p-5">
							<div className="flex items-start justify-between gap-2">
								<p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
									{kpi.label}
								</p>
								<span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
									{ICONS[kpi.icon] ?? <List className="h-4 w-4" />}
								</span>
							</div>

							<div className="mt-2 flex items-end justify-between gap-2">
								<p className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
									{kpi.value}
								</p>
								{kpi.delta != null && (
									<span
										className={cn(
											"inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-xs",
											up
												? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
												: "bg-destructive/10 text-destructive",
										)}
									>
										{up ? "+" : ""}
										{kpi.delta}%
									</span>
								)}
							</div>

							{sparkData.length > 0 && (
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
							)}

							<div className="mt-3 space-y-0.5">
								<p className="text-[11px] text-muted-foreground">
									{kpi.deltaLabel}
								</p>
								{kpi.previous != null && (
									<p className="text-[11px] text-muted-foreground">
										{kpi.previousLabel ?? "last mo"}:{" "}
										<span className="font-semibold text-foreground">
											{kpi.previous}
										</span>
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
