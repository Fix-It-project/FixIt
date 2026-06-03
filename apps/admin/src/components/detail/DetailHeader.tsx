import type { ReactNode } from "react";
import { TechAvatar } from "@/components/TechAvatar";

interface DetailHeaderProps {
	initials: string;
	color: string;
	title: string;
	subtitle?: ReactNode;
	badges?: ReactNode;
	action?: ReactNode;
}

/** Shared header band for entity detail pages (homeowner, technician, …). */
export function DetailHeader({ initials, color, title, subtitle, badges, action }: DetailHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
			<TechAvatar initials={initials} color={color} size="lg" />
			<div className="flex-1 min-w-0">
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
				{subtitle && <div className="text-sm text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">{subtitle}</div>}
				{badges && <div className="flex items-center gap-2 mt-2">{badges}</div>}
			</div>
			{action && <div className="flex-shrink-0">{action}</div>}
		</div>
	);
}
