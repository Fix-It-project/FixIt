import {
	motion,
	useMotionValue,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "motion/react";
import type { PointerEvent } from "react";
import { useRef } from "react";
import { PhoneFrame } from "@/components/animation/PhoneFrame";
import type { Mockup } from "@/constants/content/mockups";
import { cn } from "@/lib/utils";

// A device mockup presented with depth. Flat assets get a 3D tilt that enters
// leaning (direction per `flip`), settles flat as it crosses center, and drifts
// with a gentle parallax. Pre-angled assets (mockup.tilted) keep their baked
// perspective and only gain parallax, a sweeping glass sheen, and an optional
// pointer lean. A soft contact shadow grounds flat / on-dark phones. Replaces
// the old glow-blob + float bob.

const SPRING = { stiffness: 120, damping: 20, mass: 0.6 } as const;

export function TiltPhone({
	mockup,
	flip = false,
	pointerTilt = false,
	onDark = false,
	eager = false,
	className,
}: {
	mockup: Mockup;
	/** Tilt direction so alternating rows lean toward their copy. */
	flip?: boolean;
	/** Pointer-follow lean — for a focal hero phone. */
	pointerTilt?: boolean;
	/** Brand-glow contact shadow that reads on dark sections. */
	onDark?: boolean;
	eager?: boolean;
	className?: string;
}) {
	const reduce = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);
	const preTilted = mockup.tilted === true;
	const dir = flip ? -1 : 1;

	// 0 → 1 as the element travels from entering the bottom to leaving the top.
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	// Flat frames tilt then settle flat; pre-angled frames stay as rendered.
	const rotXScroll = useTransform(
		scrollYProgress,
		[0, 0.5, 1],
		preTilted ? [0, 0, 0] : [8, 0, -5],
	);
	const rotYScroll = useTransform(
		scrollYProgress,
		[0, 0.5, 1],
		preTilted ? [0, 0, 0] : [10 * dir, 0, -6 * dir],
	);
	const yScroll = useTransform(scrollYProgress, [0, 0.5, 1], [44, 0, -44]);
	const scaleScroll = useTransform(scrollYProgress, [0, 0.5, 1], [0.93, 1, 0.97]);

	// Pointer offsets (deg), added on top of the scroll tilt.
	const ptX = useMotionValue(0);
	const ptY = useMotionValue(0);

	const rotateX = useSpring(
		useTransform([rotXScroll, ptY], ([r = 0, p = 0]: number[]) => r + p),
		SPRING,
	);
	const rotateY = useSpring(
		useTransform([rotYScroll, ptX], ([r = 0, p = 0]: number[]) => r + p),
		SPRING,
	);
	const y = useSpring(yScroll, SPRING);
	const scale = useSpring(scaleScroll, SPRING);

	// Sheen sweeps once as the phone scrolls through the viewport.
	const sheenX = useTransform(scrollYProgress, [0.1, 0.9], ["130%", "-40%"]);
	const shadowScaleX = useTransform(rotateX, [-8, 8], [0.82, 1.08]);
	const shadowOpacity = useTransform(rotateX, [-8, 0, 8], [0.16, 0.34, 0.16]);

	// Flat phones cast a grounding shadow; pre-angled assets already include one,
	// so only add it on dark sections (as a brand glow) where they'd float.
	const showShadow = !preTilted || onDark;

	function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
		if (!pointerTilt || reduce) return;
		const el = ref.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const nx = (e.clientX - r.left) / r.width - 0.5;
		const ny = (e.clientY - r.top) / r.height - 0.5;
		ptX.set(nx * 10);
		ptY.set(-ny * 8);
	}
	function resetPointer() {
		ptX.set(0);
		ptY.set(0);
	}

	if (reduce) {
		return (
			<div ref={ref} className={cn("relative", className)}>
				<PhoneFrame mockup={mockup} eager={eager} />
			</div>
		);
	}

	return (
		<div
			ref={ref}
			onPointerMove={handlePointerMove}
			onPointerLeave={resetPointer}
			className={cn("relative [perspective:1200px]", className)}
		>
			{showShadow ? (
				<motion.div
					aria-hidden
					style={{ scaleX: shadowScaleX, opacity: shadowOpacity }}
					className={cn(
						"absolute inset-x-7 -bottom-5 -z-10 h-10 rounded-[50%] blur-2xl",
						onDark ? "bg-primary" : "bg-black",
					)}
				/>
			) : null}
			<motion.div
				style={{ rotateX, rotateY, y, scale, transformStyle: "preserve-3d" }}
				className="relative will-change-transform"
			>
				<PhoneFrame mockup={mockup} eager={eager} />
				{/* glass sheen — only on flat frames; pre-angled renders already
				    carry their own highlights and the sheen would streak across
				    their transparent margins. */}
				{!preTilted ? (
					<motion.div
						aria-hidden
						style={{ x: sheenX }}
						className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent [transform:skewX(-12deg)]"
					/>
				) : null}
			</motion.div>
		</div>
	);
}
