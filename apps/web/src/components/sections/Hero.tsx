import { ArrowRight, Github } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Counter } from "@/components/animation/Counter";
import { TiltPhone } from "@/components/animation/TiltPhone";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StoreChip } from "@/components/ui/StoreChip";
import { mockups } from "@/constants/content/mockups";
import { site, stores } from "@/constants/content/site";

const ease = "easeOut" as const;

export function Hero() {
	const reduce = useReducedMotion();

	return (
		<section
			id="top"
			data-nav-bg="hero"
			className="relative overflow-hidden bg-hero bg-fixed text-primary-foreground"
		>
			<div className="absolute inset-0 bg-blueprint opacity-60" aria-hidden />
			{/* Glow pushed clear of the top so the opaque navbar never clips it -
			    a clipped blob is what broke the blend along the bar's left edge. */}
			<div
				aria-hidden
				className="absolute top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-primary-foreground/10 blur-3xl"
			/>
			<div
				aria-hidden
				className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"
			/>

			<Container className="relative grid items-center gap-12 pt-28 pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pt-36 lg:pb-32">
				{/* Copy */}
				<div className="flex flex-col items-start gap-7">
					<motion.h1
						initial={reduce ? false : { opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease, delay: 0.05 }}
						className="text-balance font-display font-extrabold text-[2.75rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-[4rem]"
					>
						Find, book, and{" "}
						fix.
						<br />
						From your phone.
					</motion.h1>

					<motion.p
						initial={reduce ? false : { opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease, delay: 0.12 }}
						className="max-w-xl text-pretty text-lg text-primary-foreground/80 leading-relaxed"
					>
						Describe the problem, get matched to a trusted technician near you,
						and see real prices before you book. Plumbing to AC, painting to
						cleaning, sorted in a few taps.
					</motion.p>

					<motion.div
						initial={reduce ? false : { opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease, delay: 0.18 }}
						className="flex flex-wrap items-center gap-3"
					>
						<Button
							variant="onDark"
							size="lg"
							href={site.githubUrl}
							target="_blank"
							rel="noreferrer"
						>
							<Github className="h-5 w-5" aria-hidden />
							Get it on GitHub
						</Button>
						<Button variant="onDarkGhost" size="lg" href="#how-it-works">
							See how it works
							<ArrowRight className="h-4 w-4" aria-hidden />
						</Button>
					</motion.div>

					<motion.div
						initial={reduce ? false : { opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease, delay: 0.24 }}
						className="flex flex-wrap gap-3"
					>
						{stores.map((s) => (
							<StoreChip
								key={s.platform}
								platform={s.platform}
								note={s.note}
								tone="dark"
							/>
						))}
					</motion.div>

					<div className="mt-1 flex items-center gap-6 text-primary-foreground/85">
						<div className="flex flex-col">
							<span className="font-display font-extrabold text-2xl">
								<Counter to={10} />
							</span>
							<span className="text-primary-foreground/60 text-xs">
								service categories
							</span>
						</div>
						<span className="h-8 w-px bg-primary-foreground/20" aria-hidden />
						<div className="flex flex-col">
							<span className="font-display font-extrabold text-2xl">Cash</span>
							<span className="text-primary-foreground/60 text-xs">
								or card payment
							</span>
						</div>
						<span className="h-8 w-px bg-primary-foreground/20" aria-hidden />
						<div className="flex flex-col">
							<span className="font-display font-extrabold text-2xl">
								EN · AR
							</span>
							<span className="text-primary-foreground/60 text-xs">
								Arabic & RTL
							</span>
						</div>
					</div>
				</div>

				{/* Phone */}
				<div className="relative mx-auto w-full max-w-sm lg:max-w-md">
					<motion.div
						initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.7, ease, delay: 0.1 }}
						className="relative"
					>
						<TiltPhone
							mockup={mockups.homeTilted}
							pointerTilt
							eager
							className="w-full"
						/>
					</motion.div>
				</div>
			</Container>
		</section>
	);
}
