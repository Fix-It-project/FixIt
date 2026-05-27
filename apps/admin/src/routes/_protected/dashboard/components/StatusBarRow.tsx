import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_SHARE } from "@/data/mockData";

const total = STATUS_SHARE.reduce((s, x) => s + x.count, 0);

export function StatusBarRow() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Order status mix</CardTitle>
				<p className="text-xs text-muted-foreground">All orders this month · {total.toLocaleString()} total</p>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{/* Stacked bar */}
				<div className="flex h-3 w-full rounded-full overflow-hidden">
					{STATUS_SHARE.map((s) => (
						<div
							key={s.key}
							style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
							title={`${s.label}: ${s.count}`}
						/>
					))}
				</div>
				{/* Legend */}
				<div className="flex flex-col gap-1.5">
					{STATUS_SHARE.map((s) => {
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
			</CardContent>
		</Card>
	);
}
