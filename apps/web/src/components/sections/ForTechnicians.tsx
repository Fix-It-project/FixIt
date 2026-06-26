import { CalendarClock, LineChart, Wallet } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { TiltPhone } from "@/components/animation/TiltPhone";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { mockups } from "@/constants/content/mockups";
import { site } from "@/constants/content/site";

const perks = [
	{
		icon: Wallet,
		title: "Track your earnings",
		body: "See today's income, lifetime totals, platform fees, and a full transaction history per job.",
	},
	{
		icon: CalendarClock,
		title: "Own your schedule",
		body: "Set your availability, accept the jobs you want, and send quotes straight from the app.",
	},
	{
		icon: LineChart,
		title: "Know your numbers",
		body: "Watch your acceptance rate, cancellation rate, weekly rating, and jobs completed at a glance.",
	},
];

export function ForTechnicians() {
	return (
		<section
			id="technicians"
			data-nav-bg="ink"
			className="relative overflow-hidden bg-ink text-primary-foreground"
		>
			<div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden />
			<div
				aria-hidden
				className="absolute top-10 -right-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
			/>

			<Container className="relative grid items-center gap-16 py-24 sm:py-32 lg:grid-cols-2">
				<div className="flex flex-col gap-8">
					<SectionHeading
						align="left"
						tone="light"
						title="Turn your skills into steady work"
						description="FixIt brings the jobs to you. Get matched with nearby customers, quote your price, and get paid: cash or card."
					/>

					<ul className="flex flex-col gap-5">
						{perks.map((perk) => (
							<li key={perk.title}>
								<Reveal>
									<div className="flex items-start gap-4">
										<span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/15">
											<perk.icon className="h-5 w-5" aria-hidden />
										</span>
										<div>
											<h3 className="font-bold font-display text-lg">
												{perk.title}
											</h3>
											<p className="mt-1 max-w-md text-primary-foreground/70 text-sm leading-relaxed">
												{perk.body}
											</p>
										</div>
									</div>
								</Reveal>
							</li>
						))}
					</ul>

					<div>
						<Button
							variant="onDark"
							size="lg"
							href={site.githubUrl}
							target="_blank"
							rel="noreferrer"
						>
							Become a technician
						</Button>
					</div>
				</div>

				<div className="relative mx-auto w-full max-w-sm">
					<TiltPhone mockup={mockups.techDash} pointerTilt onDark />
				</div>
			</Container>
		</section>
	);
}
