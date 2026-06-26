import { FixitWordmark } from "@/components/ui/FixitWordmark";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

export function Wordmark({
	tone = "dark",
	accent = "blue",
	withMark = true,
	className,
}: {
	tone?: Tone;
	// "blue" = brand primary (reads on white/black); "soft" = light blue so the
	// "It" stays visible when the bar itself is blue (over the hero).
	accent?: "blue" | "soft";
	withMark?: boolean;
	className?: string;
}) {
	// Over the blue hero the mark is a raw white "fxt" glyph that melts into the
	// gradient; once the bar goes solid it becomes the full colored FixIt logo.
	return (
		<span className={cn("inline-flex items-center gap-2.5", className)}>
			{withMark ? (
				<img
					src={tone === "light" ? "/fixit-mark-light.png" : "/fixit-icon.png"}
					alt=""
					aria-hidden
					width={32}
					height={32}
					className={cn(
						"h-8 w-8",
						tone === "light" ? "" : "rounded-[9px]",
					)}
				/>
			) : null}
			<FixitWordmark
				className={cn(
					"h-[1.15rem] w-auto",
					tone === "dark" ? "text-foreground" : "text-primary-foreground",
				)}
				accentClassName={accent === "soft" ? "text-primary-light" : "text-primary"}
			/>
		</span>
	);
}
