import type { ReactNode } from "react";
import { Reveal } from "@/components/animation/Reveal";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

export function SectionHeading({
	title,
	description,
	align = "center",
	tone = "dark",
	className,
}: {
	title: ReactNode;
	description?: ReactNode;
	align?: "center" | "left";
	tone?: Tone;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col gap-4",
				align === "center"
					? "items-center text-center"
					: "items-start text-left",
				className,
			)}
		>
			<Reveal delay={0.05}>
				<h2
					className={cn(
						"max-w-2xl text-balance font-display font-extrabold text-3xl leading-[1.05] tracking-tight sm:text-4xl md:text-[2.75rem]",
						tone === "dark" ? "text-foreground" : "text-primary-foreground",
					)}
				>
					{title}
				</h2>
			</Reveal>
			{description ? (
				<Reveal delay={0.1}>
					<p
						className={cn(
							"max-w-xl text-pretty text-base leading-relaxed sm:text-lg",
							tone === "dark"
								? "text-muted-foreground"
								: "text-primary-foreground/75",
						)}
					>
						{description}
					</p>
				</Reveal>
			) : null}
		</div>
	);
}
