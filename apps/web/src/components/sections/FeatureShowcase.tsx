import { Check } from "lucide-react";
import { PhoneFrame } from "@/components/animation/PhoneFrame";
import { Reveal } from "@/components/animation/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { type Feature, features } from "@/constants/content/features";
import { cn } from "@/lib/utils";
import { POPOUTS } from "./FeaturePopouts";

function FeatureRow({ feature, flip }: { feature: Feature; flip: boolean }) {
	const Popout = POPOUTS[feature.id];
	return (
		<Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
			<div className={cn("flex flex-col gap-5", flip && "lg:order-2")}>
				<Reveal delay={0.05}>
					<h3 className="max-w-md text-balance font-bold font-display text-2xl text-foreground sm:text-3xl">
						{feature.title}
					</h3>
				</Reveal>
				<Reveal delay={0.1}>
					<p className="max-w-md text-pretty text-base text-muted-foreground leading-relaxed">
						{feature.body}
					</p>
				</Reveal>
				<Reveal delay={0.15}>
					<ul className="flex flex-col gap-2.5">
						{feature.points.map((point) => (
							<li key={point} className="flex items-start gap-2.5">
								<Check
									className="mt-0.5 h-5 w-5 shrink-0 text-primary"
									aria-hidden
								/>
								<span className="text-[0.95rem] text-foreground/80">{point}</span>
							</li>
						))}
					</ul>
				</Reveal>
			</div>

			{/* Portrait device with one real component popped out toward the copy. */}
			<div className={cn("relative flex justify-center", flip && "lg:order-1")}>
				<div className="relative mx-auto w-full max-w-[260px]">
					<Reveal y={24}>
						<PhoneFrame mockup={feature.mockup} glow />
					</Reveal>
					{Popout ? (
						<div
							className={cn(
								"absolute bottom-8 left-1/2 z-10 w-[82%] max-w-[212px] -translate-x-1/2 lg:bottom-14",
								flip
									? "lg:left-auto lg:right-0 lg:translate-x-[36%]"
									: "lg:left-0 lg:translate-x-[-36%]",
							)}
						>
							<Reveal y={28} delay={0.1}>
								<Popout />
							</Reveal>
						</div>
					) : null}
				</div>
			</div>
		</Container>
	);
}

export function FeatureShowcase() {
	return (
		<section
			id="features"
			data-nav-bg="surface"
			className="relative overflow-hidden bg-surface py-24 sm:py-32"
		>
			<Container>
				<SectionHeading
					title="Everything you need to get it fixed"
					description="Built around the way you actually find help at home: clear, quick, and honest about price."
				/>
			</Container>

			<div className="mt-16 flex flex-col gap-20 lg:mt-24 lg:gap-28">
				{features.map((feature, i) => (
					<FeatureRow key={feature.id} feature={feature} flip={i % 2 === 1} />
				))}
			</div>
		</section>
	);
}
