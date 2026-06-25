import { Check } from "lucide-react";
import { Parallax } from "@/components/animation/Parallax";
import { PhoneFrame } from "@/components/animation/PhoneFrame";
import { Reveal } from "@/components/animation/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { type Feature, features } from "@/constants/content/features";
import { cn } from "@/lib/utils";

function FeatureRow({ feature, flip }: { feature: Feature; flip: boolean }) {
	const Icon = feature.icon;
	return (
		<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
			<div className={cn("flex flex-col gap-5", flip && "lg:order-2")}>
				<Reveal>
					<span className="inline-flex items-center gap-2 font-sans font-semibold text-primary text-xs uppercase tracking-[0.16em]">
						<span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-light text-primary">
							<Icon className="h-5 w-5" aria-hidden />
						</span>
						{feature.eyebrow}
					</span>
				</Reveal>
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
								<span className="text-[0.95rem] text-foreground/80">
									{point}
								</span>
							</li>
						))}
					</ul>
				</Reveal>
			</div>

			<div className={cn("flex justify-center", flip && "lg:order-1")}>
				<Parallax distance={36} className="w-full max-w-[260px]">
					<PhoneFrame mockup={feature.mockup} glow />
				</Parallax>
			</div>
		</div>
	);
}

export function FeatureShowcase() {
	return (
		<section id="features" className="bg-surface py-24 sm:py-32">
			<Container>
				<SectionHeading
					eyebrow="Features"
					title="Everything you need to get it fixed"
					description="Built around the way you actually find help at home — clear, quick, and honest about price."
				/>

				<div className="mt-20 flex flex-col gap-24 lg:gap-32">
					{features.map((feature, i) => (
						<FeatureRow key={feature.id} feature={feature} flip={i % 2 === 1} />
					))}
				</div>
			</Container>
		</section>
	);
}
