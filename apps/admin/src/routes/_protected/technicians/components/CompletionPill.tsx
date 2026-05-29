import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HistoryOrder } from "@/types";

interface CompletionPillProps {
	history: HistoryOrder[];
}

export function CompletionPill({ history }: CompletionPillProps) {
	const completed = history.filter((h) => h.status === "completed").length;
	const rate = history.length > 0 ? Math.round((completed / history.length) * 100) : 0;
	const low = rate < 50;

	return (
		<span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", low ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")}>
			{low && <AlertTriangle className="h-3 w-3" />}
			{rate}%
		</span>
	);
}
