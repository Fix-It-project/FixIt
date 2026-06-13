import { TechAvatar } from "@/components/TechAvatar";
import { cn } from "@/lib/utils";
import type { AdminServiceRequest } from "@/types";

interface RequestQueueProps {
	requests: AdminServiceRequest[];
	selectedId: string | null;
	onSelect: (id: string) => void;
}

function relativeAge(iso: string): string {
	const diffMs = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diffMs / 60000);
	if (mins < 60) return `${Math.max(mins, 1)}m`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	return `${days}d`;
}

function priceRange(r: AdminServiceRequest): string {
	return `EGP ${r.minPrice.toLocaleString("en-US")}–${r.maxPrice.toLocaleString("en-US")}`;
}

export function RequestQueue({
	requests,
	selectedId,
	onSelect,
}: RequestQueueProps) {
	return (
		<div className="flex flex-col">
			{requests.map((r) => {
				const active = r.id === selectedId;
				return (
					<button
						key={r.id}
						type="button"
						onClick={() => onSelect(r.id)}
						className={cn(
							"flex w-full items-start gap-3 border-border border-b px-4 py-3 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
							active
								? "bg-primary/5 ring-1 ring-primary/20 ring-inset"
								: "hover:bg-muted/40",
						)}
					>
						<TechAvatar
							initials={r.technicianInitials}
							color={r.color}
							size="sm"
						/>
						<div className="min-w-0 flex-1">
							<p
								className={cn(
									"truncate font-medium text-sm",
									active ? "text-primary" : "text-foreground",
								)}
							>
								{r.name}
							</p>
							<p className="truncate text-muted-foreground text-xs">
								{r.technicianName}
								{r.categoryName ? ` · ${r.categoryName}` : ""}
							</p>
							<p className="mt-1 text-muted-foreground text-xs tabular-nums">
								{priceRange(r)}
							</p>
						</div>
						<span className="whitespace-nowrap text-[11px] text-muted-foreground tabular-nums">
							{relativeAge(r.createdAt)}
						</span>
					</button>
				);
			})}
		</div>
	);
}
