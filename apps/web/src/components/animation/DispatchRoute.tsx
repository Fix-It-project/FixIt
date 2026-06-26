import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// The How-it-works timeline: a vertical track that fills solid blue from the top
// as you scroll the section, like a progress bar, and recedes when you scroll
// back up. A plain height-driven fill - no SVG dash math, so it stays crisp.
export function DispatchRoute({ className }: { className?: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 0.6", "end 0.5"],
	});
	const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
	// Node dots brighten as the fill reaches them.
	const n1 = useTransform(scrollYProgress, [0.08, 0.18], [0.25, 1]);
	const n2 = useTransform(scrollYProgress, [0.42, 0.55], [0.25, 1]);
	const n3 = useTransform(scrollYProgress, [0.78, 0.92], [0.25, 1]);

	const fade =
		"linear-gradient(to bottom, transparent, #000 5%, #000 95%, transparent)";

	return (
		<div ref={ref} className={cn("pointer-events-none", className)}>
			<div
				className="relative h-full w-full"
				style={{ maskImage: fade, WebkitMaskImage: fade }}
			>
				{/* faint full-height track */}
				<div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-primary/15" />
				{/* progress fill */}
				<motion.div
					aria-hidden
					style={{ height: reduce ? "100%" : height }}
					className="absolute top-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.55)]"
				/>
			</div>
			{/* node markers aligned to thirds */}
			{[
				{ top: "16.6%", o: n1 },
				{ top: "50%", o: n2 },
				{ top: "83.3%", o: n3 },
			].map((node) => (
				<motion.span
					key={node.top}
					aria-hidden
					style={{ top: node.top, opacity: reduce ? 1 : node.o }}
					className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-[3px] ring-background"
				/>
			))}
		</div>
	);
}
