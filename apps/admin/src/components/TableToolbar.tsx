import { Download, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ToolbarFilter<K extends string = string> {
	key: K;
	label: string;
	count: number;
}

interface TableToolbarProps<K extends string = string> {
	searchValue: string;
	onSearchChange: (value: string) => void;
	searchPlaceholder?: string;
	filters?: ToolbarFilter<K>[];
	activeFilter?: K;
	onFilterChange?: (key: K) => void;
	onExport?: () => void;
	exportLabel?: string;
	/** Extra controls rendered in the toolbar bar, right-aligned next to Export. */
	trailing?: ReactNode;
}

export function TableToolbar<K extends string = string>({
	searchValue,
	onSearchChange,
	searchPlaceholder = "Search…",
	filters,
	activeFilter,
	onFilterChange,
	onExport,
	exportLabel = "Export CSV",
	trailing,
}: TableToolbarProps<K>) {
	return (
		<div className="flex flex-col lg:flex-row lg:items-center gap-3 bg-card border border-border rounded-xl p-3 shadow-sm">
			<div className="relative flex-1 min-w-0 lg:max-w-xs">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder={searchPlaceholder}
					value={searchValue}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-9 h-9 bg-background"
				/>
			</div>

			{filters && filters.length > 0 && onFilterChange && (
				<div className="flex gap-1 flex-wrap lg:flex-nowrap items-center">
					{filters.map(({ key, label, count }) => (
						<button
							key={key}
							type="button"
							onClick={() => onFilterChange(key)}
							className={cn(
								"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
								activeFilter === key
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{label}
							<span
								className={cn(
									"tabular-nums text-[10px] font-bold px-1.5 py-0.5 rounded-full",
									activeFilter === key
										? "bg-primary-foreground/20 text-primary-foreground"
										: "bg-background text-muted-foreground",
								)}
							>
								{count}
							</span>
						</button>
					))}
				</div>
			)}

			{(trailing || onExport) && (
				<div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:ml-auto">
					{trailing}
					{onExport && (
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5 flex-shrink-0 h-9"
							onClick={onExport}
						>
							<Download className="h-4 w-4" />
							{exportLabel}
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
