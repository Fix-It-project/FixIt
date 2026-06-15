import { AlertTriangle, ArrowRight } from "lucide-react";
import { TechAvatar } from "@/components/TechAvatar";
import { cn } from "@/lib/utils";
import type { AdminReport } from "@/types";
import { ReasonChip } from "./ReasonChip";
import { roleColor } from "./RoleChip";

interface ReportQueueProps {
	reports: AdminReport[];
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

/** Days since a report was filed — drives the triage urgency tint. */
function ageDays(iso: string): number {
	return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

/** Small role-ringed avatar so the queue shows who-vs-who at a glance. */
function RingAvatar({
	initials,
	color,
	ring,
}: {
	initials: string;
	color: string;
	ring: string;
}) {
	return (
		<span
			className="inline-flex rounded-full"
			style={{ boxShadow: `0 0 0 1.5px ${ring}` }}
		>
			<TechAvatar initials={initials} color={color} size="sm" />
		</span>
	);
}

export function ReportQueue({
	reports,
	selectedId,
	onSelect,
}: ReportQueueProps) {
	return (
		<div className="flex flex-col">
			{reports.map((r) => {
				const active = r.id === selectedId;
				const stale = r.status === "open" && ageDays(r.createdAt) >= 7;
				return (
					<button
						key={r.id}
						type="button"
						onClick={() => onSelect(r.id)}
						className={cn(
							"w-full border-border border-b px-4 py-3.5 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
							active
								? "bg-primary/5 ring-1 ring-primary/30 ring-inset"
								: "hover:bg-muted/40",
						)}
					>
						<div className="flex items-center justify-between gap-2">
							<div className="flex min-w-0 items-center gap-1.5">
								<RingAvatar
									initials={r.reporterInitials}
									color={r.reporterColor}
									ring={roleColor(r.reporterRole)}
								/>
								<ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
								<RingAvatar
									initials={r.reportedInitials}
									color={r.reportedColor}
									ring={roleColor(r.reportedRole)}
								/>
							</div>
							<span
								className={cn(
									"whitespace-nowrap text-[11px] tabular-nums",
									stale
										? "font-semibold text-destructive"
										: "text-muted-foreground",
								)}
							>
								{relativeAge(r.createdAt)}
							</span>
						</div>
						<div className="mt-2.5 flex flex-wrap items-center gap-2">
							<ReasonChip label={r.label} labelText={r.labelText} />
							{r.warnedAt && (
								<span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 font-semibold text-[10px] text-amber-600">
									<AlertTriangle className="h-2.5 w-2.5" /> Warned
								</span>
							)}
						</div>
						<p className="mt-1.5 line-clamp-1 text-foreground text-sm">
							{r.summary}
						</p>
						<p className="mt-0.5 truncate text-muted-foreground text-xs">
							{r.reporterName} → {r.reportedName}
						</p>
					</button>
				);
			})}
		</div>
	);
}
