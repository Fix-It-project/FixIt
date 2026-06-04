import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AmountBucket, DateRangePreset } from "@/types";

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
	{ value: "all", label: "All time" },
	{ value: "today", label: "Today" },
	{ value: "7d", label: "Last 7 days" },
	{ value: "30d", label: "Last 30 days" },
	{ value: "90d", label: "Last 90 days" },
];

const AMOUNT_BUCKETS: { value: AmountBucket; label: string }[] = [
	{ value: "all", label: "Any amount" },
	{ value: "lt100", label: "Under 100 EGP" },
	{ value: "100_500", label: "100 – 500 EGP" },
	{ value: "500_1000", label: "500 – 1000 EGP" },
	{ value: "gt1000", label: "1000+ EGP" },
];

interface OrdersFiltersProps {
	datePreset: DateRangePreset;
	onDatePreset: (value: DateRangePreset) => void;
	amountBucket: AmountBucket;
	onAmountBucket: (value: AmountBucket) => void;
}

function OptionRow<T extends string>({
	options,
	value,
	onChange,
}: {
	options: { value: T; label: string }[];
	value: T;
	onChange: (v: T) => void;
}) {
	return (
		<div className="flex flex-col gap-0.5">
			{options.map((opt) => {
				const active = opt.value === value;
				return (
					<button
						key={opt.value}
						type="button"
						onClick={() => onChange(opt.value)}
						className={cn(
							"flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-left transition-colors",
							active
								? "bg-primary/10 text-primary"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						{opt.label}
						{active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
					</button>
				);
			})}
		</div>
	);
}

export function OrdersFilters({
	datePreset,
	onDatePreset,
	amountBucket,
	onAmountBucket,
}: OrdersFiltersProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const activeCount = (datePreset !== "all" ? 1 : 0) + (amountBucket !== "all" ? 1 : 0);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onEsc);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onEsc);
		};
	}, [open]);

	const clearAll = () => {
		onDatePreset("all");
		onAmountBucket("all");
	};

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={cn(
					"inline-flex items-center gap-2 h-9 rounded-full border px-3.5 text-xs font-semibold transition-colors",
					open || activeCount > 0
						? "border-primary/30 bg-primary/10 text-primary"
						: "border-border bg-muted text-muted-foreground hover:text-foreground",
				)}
				aria-expanded={open}
			>
				<SlidersHorizontal className="h-3.5 w-3.5" />
				Filters
				{activeCount > 0 && (
					<span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
						{activeCount}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute left-0 z-50 mt-2 w-60 origin-top-left rounded-xl border border-border bg-card p-3 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150">
					<div className="flex items-center justify-between pb-2">
						<p className="text-xs font-semibold text-foreground">Filters</p>
						<button
							type="button"
							onClick={clearAll}
							disabled={activeCount === 0}
							className="text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
						>
							Clear all
						</button>
					</div>

					<div className="flex flex-col gap-3">
						<div>
							<p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
							<OptionRow options={DATE_PRESETS} value={datePreset} onChange={onDatePreset} />
						</div>
						<div className="border-t border-border pt-2">
							<p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</p>
							<OptionRow options={AMOUNT_BUCKETS} value={amountBucket} onChange={onAmountBucket} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
