import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
	page: number;
	pageCount: number;
	pageSize: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	className?: string;
}

function buildPageList(page: number, pageCount: number): (number | "gap")[] {
	if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
	const set = new Set<number>([1, pageCount, page - 1, page, page + 1]);
	const sorted = [...set].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
	const result: (number | "gap")[] = [];
	let prev = 0;
	for (const n of sorted) {
		if (n - prev > 1) result.push("gap");
		result.push(n);
		prev = n;
	}
	return result;
}

export function Pagination({ page, pageCount, pageSize, totalItems, onPageChange, className }: PaginationProps) {
	if (pageCount <= 1 && totalItems <= pageSize) {
		return (
			<p className={cn("text-xs text-muted-foreground", className)}>
				Showing <span className="font-semibold text-foreground tabular-nums">{totalItems}</span> of{" "}
				<span className="tabular-nums">{totalItems}</span>
			</p>
		);
	}

	const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, totalItems);
	const pages = buildPageList(page, pageCount);

	return (
		<div className={cn("relative flex items-center justify-center gap-3 flex-wrap", className)}>
			<p className="text-xs text-muted-foreground sm:absolute sm:left-0">
				Showing <span className="font-semibold text-foreground tabular-nums">{from}–{to}</span> of{" "}
				<span className="tabular-nums">{totalItems}</span>
			</p>
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => onPageChange(page - 1)}
					disabled={page === 1}
					className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
					aria-label="Previous page"
				>
					<ChevronLeft className="h-3.5 w-3.5" />
				</button>
				{pages.map((p, i) =>
					p === "gap" ? (
						<span key={`gap-${i}`} className="px-1.5 text-xs text-muted-foreground select-none">…</span>
					) : (
						<button
							key={p}
							type="button"
							onClick={() => onPageChange(p)}
							aria-current={p === page ? "page" : undefined}
							className={cn(
								"inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-md text-xs font-semibold transition-colors tabular-nums",
								p === page
									? "bg-primary text-primary-foreground"
									: "border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{p}
						</button>
					),
				)}
				<button
					type="button"
					onClick={() => onPageChange(page + 1)}
					disabled={page === pageCount}
					className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
					aria-label="Next page"
				>
					<ChevronRight className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}

export const PAGE_SIZE = 20;
