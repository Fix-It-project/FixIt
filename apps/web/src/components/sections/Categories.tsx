import { Marquee } from "@/components/animation/Marquee";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { categories } from "@/constants/content/categories";

export function Categories() {
	return (
		<section id="categories" className="bg-background py-20 sm:py-24">
			<Container>
				<SectionHeading
					eyebrow="Every fix, one app"
					title="Ten home services, ready to book"
					description="From a dripping tap to a noisy AC, the right specialist is a few taps away."
				/>
			</Container>

			<div className="mt-12">
				<Marquee>
					{categories.map(({ label, icon: Icon }) => (
						<div key={label} className="mx-3 flex items-center gap-3 py-2">
							<span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-primary">
								<Icon className="h-6 w-6" aria-hidden />
							</span>
							<span className="whitespace-nowrap font-semibold text-base text-foreground">
								{label}
							</span>
						</div>
					))}
				</Marquee>
			</div>
		</section>
	);
}
