import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { PhoneFrame } from "@/components/animation/PhoneFrame";
import type { Mockup } from "@/constants/content/mockups";
import { cn } from "@/lib/utils";

// A landscape device that slides in from the outer edge (the side away from the
// copy) as the row scrolls into view, resting half-bled off the page. The
// caller positions/oversizes it; this only drives the entrance slide + fade.

export function SlidePhone({
	mockup,
	side,
	className,
}: {
	mockup: Mockup;
	/** Edge the device enters from — should be opposite the copy. */
	side: "left" | "right";
	className?: string;
}) {
	const reduce = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "center center"],
	});

	const sign = side === "right" ? 1 : -1;
	const x = useTransform(scrollYProgress, [0, 1], [`${sign * 26}%`, "0%"]);
	const opacity = useTransform(scrollYProgress, [0, 0.55], [0, 1]);

	if (reduce) {
		return (
			<div ref={ref} className={className}>
				<PhoneFrame mockup={mockup} />
			</div>
		);
	}

	return (
		<motion.div
			ref={ref}
			style={{ x, opacity }}
			className={cn("will-change-transform", className)}
		>
			<PhoneFrame mockup={mockup} />
		</motion.div>
	);
}
