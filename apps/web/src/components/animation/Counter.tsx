import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function Counter({
	to,
	suffix = "",
	duration = 1.3,
	className,
}: {
	to: number;
	suffix?: string;
	duration?: number;
	className?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: "-60px" });
	const reduce = useReducedMotion();
	const [value, setValue] = useState(0);

	useEffect(() => {
		if (!inView) {
			return;
		}
		if (reduce) {
			setValue(to);
			return;
		}
		const controls = animate(0, to, {
			duration,
			ease: "easeOut",
			onUpdate: (v) => setValue(v),
		});
		return () => controls.stop();
	}, [inView, to, duration, reduce]);

	return (
		<span ref={ref} className={className}>
			{Math.round(value)}
			{suffix}
		</span>
	);
}
