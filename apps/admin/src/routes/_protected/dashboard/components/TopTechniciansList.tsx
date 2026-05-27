import { useState } from "react";
import { StarRating } from "@/components/StarRating";
import { TechAvatar } from "@/components/TechAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACTIVE_TECHS, CATEGORIES, TOP_TECHS } from "@/data/mockData";
import { cn } from "@/lib/utils";
import type { ActiveTech, Category } from "@/types/domain";

const SPECIALTY_TO_CATEGORY_ID: Record<string, string> = {
	"Plumbing": "plumb",
	"Air Conditioning": "ac",
	"Electrician": "elec",
	"Electrical": "elec",
	"Home Cleaning": "clean",
	"Painter": "paint",
	"Painting": "paint",
	"Carpentry": "carp",
	"Oven & Cooker": "oven",
	"Fridge / Freezer": "fridge",
	"Dish Installation": "ac",
};

function parseRevenue(r: string): number {
	return parseFloat(r.replace("k", "")) * 1000;
}

function getTopByCategory(techs: ActiveTech[], categories: Category[]) {
	const active = techs.filter((t) => !t.blocked);
	return categories
		.map((cat) => {
			const matching = active.filter((t) => SPECIALTY_TO_CATEGORY_ID[t.specialty] === cat.id);
			if (matching.length === 0) return null;
			const top = matching.reduce((best, t) =>
				parseRevenue(t.revenue) > parseRevenue(best.revenue) ? t : best,
			);
			return { category: cat, tech: top };
		})
		.filter((x): x is { category: Category; tech: ActiveTech } => x !== null);
}

type Tab = "overall" | "category";

export function TopTechniciansList() {
	const [tab, setTab] = useState<Tab>("overall");
	const byCategory = getTopByCategory(ACTIVE_TECHS, CATEGORIES);

	return (
		<Card className="flex flex-col">
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Top Technicians</CardTitle>
				<div className="flex gap-1 mt-1">
					{(["overall", "category"] as Tab[]).map((t) => (
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
						<p className="text-xs text-muted-foreground -mt-1">Ranked by revenue this month</p>
						{TOP_TECHS.map((tech, i) => (
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
						{byCategory.map(({ category, tech }) => (
							<div key={category.id} className="flex items-center gap-3">
								<span
									className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
									style={{ backgroundColor: category.color }}
								/>
								<div className="flex-1 min-w-0">
									<p className="text-[11px] text-muted-foreground truncate">{category.name}</p>
									<div className="flex items-center gap-1.5 mt-0.5">
										<TechAvatar initials={tech.initials} color={tech.color} size="sm" />
										<p className="text-sm font-semibold text-foreground truncate">{tech.name}</p>
									</div>
								</div>
								<div className="text-right flex-shrink-0">
									<p className="text-sm font-bold tabular-nums text-foreground">EGP {tech.revenue}</p>
									<p className="text-[11px] text-muted-foreground">{tech.completed} jobs</p>
								</div>
							</div>
						))}
					</>
				)}
			</CardContent>
		</Card>
	);
}
