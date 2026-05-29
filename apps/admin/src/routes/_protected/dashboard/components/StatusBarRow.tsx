import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

export function StatusBarRow() {
	const { data, isLoading } = useDashboardSummary();
	const statusShare = data?.statusShare ?? [];
	const total = statusShare.reduce((s, x) => s + x.count, 0);

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Order status mix</CardTitle>
				<p className="text-xs text-muted-foreground">All orders · {total.toLocaleString()} total</p>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{isLoading ? (
					<div className="h-24 w-full animate-pulse rounded-lg bg-muted/50" />
				) : total === 0 ? (
					<p className="text-center text-muted-foreground py-8 text-sm">No order data.</p>
				) : (
				<>
				{/* Stacked bar */}
				<div className="flex h-3 w-full rounded-full overflow-hidden">
					{statusShare.map((s) => (
						<div
							key={s.key}
							style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
							title={`${s.label}: ${s.count}`}
						/>
					))}
				</div>
				{/* Legend */}
				<div className="flex flex-col gap-1.5">
					{statusShare.map((s) => {
						const pct = (s.count / total) * 100;
						return (
							<div key={s.key} className="flex items-center gap-2 text-xs">
								<span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
								<span className="text-foreground font-medium truncate">{s.label}</span>
								<span className="ml-auto text-muted-foreground tabular-nums">
									{s.count.toLocaleString()} · {pct.toFixed(1)}%
								</span>
							</div>
						);
					})}
				</div>
				</>
				)}
			</CardContent>
		</Card>
	);
}
