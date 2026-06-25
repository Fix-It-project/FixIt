import { DispatchRoute } from "@/components/animation/DispatchRoute";
import { PhoneFrame } from "@/components/animation/PhoneFrame";
import { Reveal } from "@/components/animation/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { type Step, steps } from "@/constants/content/steps";
import { cn } from "@/lib/utils";

function StepRow({ step, flip }: { step: Step; flip: boolean }) {
	return (
		<div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
			<div className={cn("flex justify-center", flip && "lg:order-2")}>
				<Reveal className="w-full max-w-[230px]">
					<PhoneFrame mockup={step.mockup} />
				</Reveal>
			</div>
			<div className={cn("flex flex-col gap-3", flip && "lg:order-1")}>
				<Reveal>
					<span className="font-display font-extrabold text-6xl text-primary/15 leading-none">
						{step.n}
					</span>
				</Reveal>
				<Reveal delay={0.05}>
					<h3 className="font-bold font-display text-2xl text-foreground sm:text-3xl">
						{step.title}
					</h3>
				</Reveal>
				<Reveal delay={0.1}>
					<p className="max-w-md text-pretty text-base text-muted-foreground leading-relaxed">
						{step.body}
					</p>
				</Reveal>
			</div>
		</div>
	);
}

export function HowItWorks() {
	return (
		<section id="how-it-works" className="bg-background py-24 sm:py-32">
			<Container>
				<SectionHeading
					eyebrow="How it works"
					title="From “what’s wrong?” to fixed"
					description="Three steps, no phone calls, no haggling at the door."
				/>

				<div className="relative mt-16 lg:mt-24">
					<DispatchRoute className="absolute top-0 left-1/2 hidden h-full w-4 -translate-x-1/2 lg:block" />
					<div className="flex flex-col gap-16 lg:gap-28">
						{steps.map((step, i) => (
							<StepRow key={step.n} step={step} flip={i % 2 === 1} />
						))}
					</div>
				</div>
			</Container>
		</section>
	);
}
