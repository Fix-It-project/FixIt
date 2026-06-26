import { Marquee } from "@/components/animation/Marquee";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { categories } from "@/constants/content/categories";

export function Categories() {
	return (
		<section
			id="categories"
			data-nav-bg="background"
			className="bg-background py-20 sm:py-24"
		>
			<Container>
				<SectionHeading
					title="Ten home services, ready to book"
					description="From a dripping tap to a noisy AC, the right specialist is a few taps away."
				/>
			</Container>

			<div className="mt-12">
				<Marquee>
					{categories.map(({ label, icon: Icon }) => (
						<div key={label} className="mx-3 flex items-center gap-3 py-2">
							<span className="grid h-12 w-12 place-items-center text-primary">
								<Icon className="h-7 w-7" aria-hidden />
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
