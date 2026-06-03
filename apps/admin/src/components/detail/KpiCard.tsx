import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
	value: ReactNode;
	label: ReactNode;
	valueClassName?: string;
	className?: string;
}

/** Shared KPI cell for entity detail-page metric strips. */
export function KpiCard({ value, label, valueClassName, className }: KpiCardProps) {
	return (
		<div className={cn("rounded-lg border border-border px-4 py-3 bg-card", className)}>
			<p className={cn("text-2xl font-bold text-foreground tabular-nums leading-tight", valueClassName)}>{value}</p>
			<p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
		</div>
	);
}
