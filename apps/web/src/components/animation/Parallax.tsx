import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

// Gentle scroll-linked vertical drift. Falls back to a static wrapper when the
// user prefers reduced motion.
export function Parallax({
	children,
	distance = 60,
	className,
}: {
	children: ReactNode;
	distance?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

	if (reduce) {
		return (
			<div ref={ref} className={className}>
				{children}
			</div>
		);
	}

	return (
		<motion.div ref={ref} style={{ y }} className={className}>
			{children}
		</motion.div>
	);
}
