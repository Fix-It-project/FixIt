import type { ReactNode } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import type { ActiveTech } from "@/types";
import { CompletionPill } from "./CompletionPill";

interface TechCardListProps {
	techs: ActiveTech[];
	onView: (tech: ActiveTech) => void;
	actions?: (tech: ActiveTech) => ReactNode;
}

export function TechCardList({ techs, onView, actions }: TechCardListProps) {
	if (techs.length === 0) {
		return <p className="text-center text-muted-foreground py-8 text-sm">No technicians found.</p>;
	}

	return (
		<div className="flex flex-col gap-3">
			{techs.map((tech) => (
				<div key={tech.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
					<TechAvatar initials={tech.initials} color={tech.color} size="md" />
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-foreground truncate">{tech.name}</p>
						<div className="mt-0.5">
							<CategoryTag meta={getCategoryMetaBySpecialty(tech.specialty)} fallbackLabel={tech.specialty} size="sm" />
						</div>
						<div className="mt-1 flex items-center gap-2">
							<span className="text-xs text-muted-foreground">{tech.completed} jobs</span>
							<CompletionPill history={tech.history} />
						</div>
					</div>
					<div className="flex flex-col gap-1.5 flex-shrink-0">
						<Button size="sm" variant="outline" onClick={() => onView(tech)}>View</Button>
						{actions?.(tech)}
					</div>
				</div>
			))}
		</div>
	);
}
