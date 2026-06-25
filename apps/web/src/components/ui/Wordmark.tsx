import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

export function Wordmark({
	tone = "dark",
	withMark = true,
	className,
}: {
	tone?: Tone;
	withMark?: boolean;
	className?: string;
}) {
	return (
		<span className={cn("inline-flex items-center gap-2.5", className)}>
			{withMark ? (
				<span
					aria-hidden
					className={cn(
						"grid h-8 w-8 place-items-center rounded-[10px] font-display font-extrabold text-base leading-none",
						tone === "dark"
							? "bg-hero text-primary-foreground"
							: "bg-primary-foreground text-primary",
					)}
				>
					F
				</span>
			) : null}
			<span
				className={cn(
					"font-display font-extrabold text-xl tracking-tight",
					tone === "dark" ? "text-foreground" : "text-primary-foreground",
				)}
			>
				Fix
				<span
					className={tone === "dark" ? "text-primary" : "text-primary-light"}
				>
					It
				</span>
			</span>
		</span>
	);
}
