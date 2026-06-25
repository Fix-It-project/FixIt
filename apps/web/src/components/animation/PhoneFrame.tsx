import type { Mockup } from "@/constants/content/mockups";
import { cn } from "@/lib/utils";

// Renders a device-frame mockup with an optional ambient glow and float.
export function PhoneFrame({
	mockup,
	className,
	imgClassName,
	glow = false,
	float = false,
	eager = false,
}: {
	mockup: Mockup;
	className?: string;
	imgClassName?: string;
	glow?: boolean;
	float?: boolean;
	eager?: boolean;
}) {
	return (
		<div className={cn("relative", className)}>
			{glow ? (
				<div
					aria-hidden
					className="absolute inset-x-6 top-12 bottom-8 -z-10 rounded-[40%] bg-primary/35 blur-3xl"
				/>
			) : null}
			<img
				src={mockup.src}
				alt={mockup.alt}
				loading={eager ? "eager" : "lazy"}
				fetchPriority={eager ? "high" : "auto"}
				decoding="async"
				draggable={false}
				className={cn(
					"h-auto w-full select-none drop-shadow-2xl",
					float && "animate-float motion-reduce:animate-none",
					imgClassName,
				)}
			/>
		</div>
	);
}
