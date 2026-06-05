import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

interface CategoryFilterDropdownProps {
	/** "all" or a category name. */
	value: string;
	/** Distinct category names present in the list. */
	options: string[];
	onChange: (value: string) => void;
}

export function CategoryFilterDropdown({ value, options, onChange }: CategoryFilterDropdownProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

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

	const currentLabel =
		value === "all"
			? "All categories"
			: getCategoryMetaBySpecialty(value)?.label ?? value;

	const items = ["all", ...options];

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={cn(
					"inline-flex items-center gap-2 h-9 rounded-full border px-3.5 text-xs font-semibold transition-colors capitalize",
					open || value !== "all"
						? "border-primary/30 bg-primary/10 text-primary"
						: "border-border bg-muted text-muted-foreground hover:text-foreground",
				)}
				aria-expanded={open}
			>
				<SlidersHorizontal className="h-3.5 w-3.5" />
				{currentLabel}
				<ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
			</button>

			{open && (
				<div className="absolute right-0 z-50 mt-2 max-h-72 w-52 origin-top-right overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150">
					{items.map((opt) => {
						const active = opt === value;
						const label =
							opt === "all" ? "All categories" : getCategoryMetaBySpecialty(opt)?.label ?? opt;
						return (
							<button
								key={opt}
								type="button"
								onClick={() => {
									onChange(opt);
									setOpen(false);
								}}
								className={cn(
									"flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-left capitalize transition-colors",
									active
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								<Check className={cn("h-3.5 w-3.5 flex-shrink-0", active ? "opacity-100" : "opacity-0")} />
								{label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
