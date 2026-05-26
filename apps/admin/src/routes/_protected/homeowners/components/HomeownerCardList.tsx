import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import type { Homeowner } from "@/types/domain";

interface HomeownerCardListProps {
	homeowners: Homeowner[];
	onView: (homeowner: Homeowner) => void;
}

export function HomeownerCardList({ homeowners, onView }: HomeownerCardListProps) {
	if (homeowners.length === 0) {
		return <p className="text-center text-muted-foreground py-8 text-sm">No homeowners found.</p>;
	}

	return (
		<div className="flex flex-col gap-3">
			{homeowners.map((h) => (
				<div key={h.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
					<TechAvatar initials={h.initials} color={h.color} size="md" />
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-foreground truncate">{h.name}</p>
						<p className="text-xs text-muted-foreground">{h.city}</p>
						<div className="mt-1 flex items-center gap-3 text-xs">
							<span className="text-muted-foreground">{h.totalOrders} orders</span>
							<span className="text-foreground font-medium tabular-nums">EGP {h.spend}</span>
						</div>
					</div>
					<Button size="sm" variant="outline" onClick={() => onView(h)}>View</Button>
				</div>
			))}
		</div>
	);
}
