import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Infinite horizontal marquee. The row is duplicated so the -50% keyframe loops
// seamlessly. Pauses on hover; disabled under prefers-reduced-motion.
export function Marquee({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("group mask-fade-x flex overflow-hidden", className)}>
			<div className="flex w-max shrink-0 animate-marquee items-stretch motion-reduce:animate-none group-hover:[animation-play-state:paused]">
				{children}
				<span aria-hidden className="contents">
					{children}
				</span>
			</div>
		</div>
	);
}
