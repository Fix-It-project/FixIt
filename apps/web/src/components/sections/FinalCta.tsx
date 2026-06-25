import { Github } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StoreChip } from "@/components/ui/StoreChip";
import { site, stores } from "@/constants/content/site";

export function FinalCta() {
	return (
		<section id="get" className="bg-background pt-4 pb-24 sm:pb-28">
			<Container>
				<div className="relative overflow-hidden rounded-2xl bg-hero px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-20">
					<div
						className="absolute inset-0 bg-blueprint opacity-50"
						aria-hidden
					/>
					<div
						aria-hidden
						className="absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-foreground/10 blur-3xl"
					/>

					<div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
						<Reveal>
							<h2 className="text-balance font-display font-extrabold text-4xl leading-[1.05] tracking-tight sm:text-5xl">
								Find, book, and fix.
							</h2>
						</Reveal>
						<Reveal delay={0.05}>
							<p className="max-w-lg text-pretty text-lg text-primary-foreground/80">
								Your next home repair is a few taps away. Get the code, follow
								along, and see FixIt in action.
							</p>
						</Reveal>
						<Reveal delay={0.1}>
							<div className="flex flex-col items-center gap-5">
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
								<div className="flex flex-wrap justify-center gap-3">
									{stores.map((s) => (
										<StoreChip
											key={s.platform}
											platform={s.platform}
											note={s.note}
											tone="dark"
										/>
									))}
								</div>
							</div>
						</Reveal>
					</div>
				</div>
			</Container>
		</section>
	);
}
