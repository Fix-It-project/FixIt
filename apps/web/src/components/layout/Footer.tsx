import { Github } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StoreChip } from "@/components/ui/StoreChip";
import { Wordmark } from "@/components/ui/Wordmark";
import { footerColumns } from "@/constants/content/footer";
import { site, stores } from "@/constants/content/site";

export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="bg-ink text-primary-foreground">
			<Container className="py-16">
				<div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
					<div className="flex flex-col gap-5">
						<Wordmark tone="light" />
						<p className="max-w-xs text-pretty text-primary-foreground/65 text-sm leading-relaxed">
							{site.description}. {site.tagline}
						</p>
						<div className="flex flex-wrap gap-3">
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

					<div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
						{footerColumns.map((col) => (
							<nav key={col.title} aria-label={col.title}>
								<h3 className="mb-3 font-sans font-semibold text-primary-foreground/50 text-xs uppercase tracking-wider">
									{col.title}
								</h3>
								<ul className="flex flex-col gap-2.5">
									{col.links.map((link) => (
										<li key={`${col.title}-${link.label}`}>
											<a
												href={link.href}
												className="text-primary-foreground/75 text-sm transition-colors hover:text-primary-foreground"
											>
												{link.label}
											</a>
										</li>
									))}
								</ul>
							</nav>
						))}
					</div>
				</div>

				<div className="mt-14 flex flex-col items-start justify-between gap-4 border-primary-foreground/10 border-t pt-7 sm:flex-row sm:items-center">
					<p className="text-primary-foreground/55 text-sm">
						© {year} {site.name}. {site.location} 🇪🇬
					</p>
					<a
						href={site.githubUrl}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-primary-foreground/75 text-sm ring-1 ring-primary-foreground/15 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
					>
						<Github className="h-4 w-4" aria-hidden />
						Star us on GitHub
					</a>
				</div>
			</Container>
		</footer>
	);
}
