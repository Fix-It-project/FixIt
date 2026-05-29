import { useState } from "react";
import { StarRating } from "@/components/StarRating";
import { TechAvatar } from "@/components/TechAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { TechRankTab } from "@/types";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

export function TopTechniciansList() {
	const { data } = useDashboardSummary();
	const [tab, setTab] = useState<TechRankTab>("overall");
	const overall = data?.topTechnicians.overall ?? [];
	const byCategory = data?.topTechnicians.byCategory ?? [];

	return (
		<Card className="flex flex-col">
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Top Technicians</CardTitle>
				<div className="flex gap-1 mt-1">
					{(["overall", "category"] as TechRankTab[]).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setTab(t)}
							className={cn(
								"px-3 py-1 rounded-full text-xs font-semibold transition-colors capitalize",
								tab === t
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground hover:bg-muted/80",
							)}
						>
							{t === "overall" ? "Overall" : "By Category"}
						</button>
					))}
				</div>
			</CardHeader>

			<CardContent className="flex flex-col gap-3 flex-1">
				{tab === "overall" && (
					<>
						<p className="text-xs text-muted-foreground -mt-1">Ranked by revenue</p>
						{overall.map((tech, i) => (
							<div key={tech.name} className="flex items-center gap-3">
								<span className="w-5 text-xs font-bold text-muted-foreground tabular-nums">{i + 1}</span>
								<TechAvatar initials={tech.initials} color={tech.color} size="sm" />
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-foreground truncate">{tech.name}</p>
									<StarRating rating={tech.rating} />
								</div>
								<div className="text-right flex-shrink-0">
									<p className="text-sm font-bold tabular-nums text-foreground">EGP {tech.revenue}</p>
									<p className="text-[11px] text-muted-foreground">{tech.jobs} jobs</p>
								</div>
							</div>
						))}
					</>
				)}

				{tab === "category" && (
					<>
						<p className="text-xs text-muted-foreground -mt-1">Top earner per service category</p>
						{byCategory.map((tech) => {
							const meta = getCategoryMetaBySpecialty(tech.specialty);
							const Icon = meta?.icon;
							return (
								<div key={tech.specialty + tech.name} className="flex items-center gap-3">
									{Icon ? (
										<Icon className="h-4 w-4 flex-shrink-0" style={{ color: meta?.color ?? tech.color }} />
									) : (
										<span
											className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
											style={{ backgroundColor: meta?.color ?? tech.color }}
										/>
									)}
									<div className="flex-1 min-w-0">
										<p className="text-[11px] text-muted-foreground truncate capitalize">{tech.specialty}</p>
										<div className="flex items-center gap-1.5 mt-0.5">
											<TechAvatar initials={tech.initials} color={tech.color} size="sm" />
											<p className="text-sm font-semibold text-foreground truncate">{tech.name}</p>
										</div>
									</div>
									<div className="text-right flex-shrink-0">
										<p className="text-sm font-bold tabular-nums text-foreground">EGP {tech.revenue}</p>
										<p className="text-[11px] text-muted-foreground">{tech.jobs} jobs</p>
									</div>
								</div>
							);
						})}
					</>
				)}
			</CardContent>
		</Card>
	);
}
