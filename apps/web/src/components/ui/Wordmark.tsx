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
				<img
					src="/fixit-icon.png"
					alt=""
					aria-hidden
					width={32}
					height={32}
					className="h-8 w-8 rounded-[9px]"
				/>
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
