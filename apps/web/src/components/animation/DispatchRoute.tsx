import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// Signature element: a "dispatch route" that draws itself as you scroll the
// How-it-works timeline — the line that connects a problem to a fixed home.
// Stretches to its container; stroke stays crisp via non-scaling-stroke.
export function DispatchRoute({ className }: { className?: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 0.85", "end 0.4"],
	});
	const pathLength = reduce ? 1 : scrollYProgress;
	// Node dots brighten as the route reaches them.
	const n1 = useTransform(scrollYProgress, [0.08, 0.18], [0.25, 1]);
	const n2 = useTransform(scrollYProgress, [0.42, 0.55], [0.25, 1]);
	const n3 = useTransform(scrollYProgress, [0.78, 0.92], [0.25, 1]);

	const fade =
		"linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent)";

	return (
		<div ref={ref} className={cn("pointer-events-none", className)}>
			<div
				className="h-full w-full"
				style={{ maskImage: fade, WebkitMaskImage: fade }}
			>
				<svg
					className="h-full w-full"
					viewBox="0 0 24 100"
					preserveAspectRatio="none"
					fill="none"
					aria-hidden
				>
					<title>Dispatch route illustration</title>
					<defs>
						<linearGradient id="route" x1="0" y1="0" x2="0" y2="100">
							<stop offset="0" stopColor="hsl(var(--hero-start))" />
							<stop offset="0.6" stopColor="hsl(var(--primary))" />
							<stop offset="1" stopColor="hsl(var(--accent-cyan))" />
						</linearGradient>
					</defs>
					{/* faint full-height track */}
					<path
						d="M12 0 V100"
						stroke="hsl(var(--primary) / 0.12)"
						strokeWidth={2}
						strokeLinecap="round"
						vectorEffect="non-scaling-stroke"
					/>
					{/* route that draws itself as you scroll */}
					<motion.path
						d="M12 0 V100"
						stroke="url(#route)"
						strokeWidth={2.5}
						strokeLinecap="round"
						vectorEffect="non-scaling-stroke"
						style={{
							pathLength,
							filter: "drop-shadow(0 0 5px hsl(var(--primary) / 0.45))",
						}}
					/>
				</svg>
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
					className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-background"
				/>
			))}
		</div>
	);
}
