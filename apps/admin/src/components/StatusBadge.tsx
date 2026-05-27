import { cn } from "@/lib/utils";

type Variant = "success" | "warn" | "danger" | "muted";

interface StatusBadgeProps {
	variant: Variant;
	label: string;
	className?: string;
}

const variantClasses: Record<Variant, string> = {
	success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	danger: "bg-destructive/10 text-destructive",
	muted: "bg-muted text-muted-foreground",
};

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
	return (
		<span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap capitalize", variantClasses[variant], className)}>
			{label}
		</span>
	);
}
