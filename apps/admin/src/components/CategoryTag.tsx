import type { CategoryMeta } from "@/lib/category-icons";

interface CategoryTagProps {
	meta?: CategoryMeta;
	fallbackLabel?: string;
	size?: "sm" | "md";
	hideLabel?: boolean;
}

export function CategoryTag({ meta, fallbackLabel, size = "md", hideLabel = false }: CategoryTagProps) {
	if (!meta) {
		return <span className="text-xs text-muted-foreground">{fallbackLabel ?? "—"}</span>;
	}
	const Icon = meta.icon;
	const box = size === "sm" ? "h-6 w-6" : "h-7 w-7";
	const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
	const textSize = size === "sm" ? "text-xs" : "text-sm";
	return (
		<div className="flex items-center gap-2 min-w-0">
			<span
				className={`inline-flex items-center justify-center rounded-md flex-shrink-0 ${box}`}
				style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
			>
				<Icon className={iconSize} />
			</span>
			{!hideLabel && <span className={`${textSize} text-foreground truncate`}>{meta.label}</span>}
		</div>
	);
}
