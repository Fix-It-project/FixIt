import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AvailabilityFilter } from "@/types";

const OPTIONS: { key: AvailabilityFilter; label: string; dot: string }[] = [
	{ key: "all", label: "All status", dot: "bg-muted-foreground/50" },
	{ key: "online", label: "Online", dot: "bg-emerald-500" },
	{ key: "offline", label: "Offline", dot: "bg-muted-foreground/40" },
];

interface AvailabilityFilterDropdownProps {
	value: AvailabilityFilter;
	onChange: (value: AvailabilityFilter) => void;
}

export function AvailabilityFilterDropdown({ value, onChange }: AvailabilityFilterDropdownProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const current = OPTIONS.find((o) => o.key === value);

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

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={cn(
					"inline-flex items-center gap-2 h-9 rounded-full border px-3.5 text-xs font-semibold transition-colors",
					open || value !== "all"
						? "border-primary/30 bg-primary/10 text-primary"
						: "border-border bg-muted text-muted-foreground hover:text-foreground",
				)}
				aria-expanded={open}
			>
				<span className={cn("h-2 w-2 rounded-full", current?.dot)} />
				{current?.label ?? "Status"}
				<ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
			</button>

			{open && (
				<div className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150">
					{OPTIONS.map((opt) => {
						const active = opt.key === value;
						return (
							<button
								key={opt.key}
								type="button"
								onClick={() => {
									onChange(opt.key);
									setOpen(false);
								}}
								className={cn(
									"flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-left transition-colors",
									active
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								<Check className={cn("h-3.5 w-3.5 flex-shrink-0", active ? "opacity-100" : "opacity-0")} />
								<span className={cn("h-2 w-2 rounded-full", opt.dot)} />
								{opt.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
