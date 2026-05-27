import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES, CATEGORY_SHARE } from "@/data/mockData";

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const data = CATEGORY_SHARE.map((s) => ({
	name: CATEGORY_MAP[s.id]?.name ?? s.id,
	value: s.pct,
	color: CATEGORY_MAP[s.id]?.color ?? "#94a3b8",
}));

export function CategoryDonutChart() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Category Share</CardTitle>
				<p className="text-xs text-muted-foreground">Distribution of completed orders</p>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col sm:flex-row items-center gap-4">
					<div className="h-[160px] w-[160px] flex-shrink-0">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={data}
									cx="50%"
									cy="50%"
									innerRadius={50}
									outerRadius={75}
									paddingAngle={2}
									dataKey="value"
								>
									{data.map((entry) => (
										<Cell key={entry.name} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									formatter={(val: number) => [`${val}%`, "Share"]}
									contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
						{data.slice(0, 5).map((entry) => (
							<div key={entry.name} className="flex items-center gap-2 text-xs">
								<span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
								<span className="flex-1 text-foreground truncate">{entry.name}</span>
								<span className="text-muted-foreground font-medium">{entry.value}%</span>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
