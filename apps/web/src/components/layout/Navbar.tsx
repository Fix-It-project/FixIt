import { Github, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/ui/Wordmark";
import { navLinks, site } from "@/constants/content/site";
import { cn } from "@/lib/utils";

export function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 16);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Lock scroll while the mobile menu is open.
	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	// Light treatment while sitting transparent over the blue hero.
	const light = !scrolled && !open;

	return (
		<header className="fixed inset-x-0 top-0 z-50">
			<div
				className={cn(
					"transition-colors duration-300",
					light
						? "border-transparent border-b bg-transparent"
						: "border-border/70 border-b bg-background/80 backdrop-blur-xl",
				)}
			>
				<Container className="flex h-16 items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
					<a
						href="#top"
						aria-label="FixIt home"
						className="rounded-lg focus-visible:outline-none md:justify-self-start"
					>
						<Wordmark tone={light ? "light" : "dark"} />
					</a>

					<nav
						aria-label="Primary"
						className="hidden items-center gap-1 md:flex md:justify-self-center"
					>
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className={cn(
									"rounded-full px-3.5 py-2 font-medium text-sm transition-colors",
									light
										? "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
										: "text-muted-foreground hover:bg-surface hover:text-foreground",
								)}
							>
								{link.label}
							</a>
						))}
					</nav>

					<div className="hidden items-center gap-2 md:flex md:justify-self-end">
						<Button
							variant={light ? "onDarkGhost" : "ghost"}
							size="sm"
							href={site.githubUrl}
							target="_blank"
							rel="noreferrer"
							aria-label="View FixIt on GitHub"
						>
							<Github className="h-4 w-4" aria-hidden />
							GitHub
						</Button>
						<Button
							variant={light ? "onDark" : "primary"}
							size="sm"
							href="#get"
						>
							Get the app
						</Button>
					</div>

					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						aria-label={open ? "Close menu" : "Open menu"}
						aria-expanded={open}
						className={cn(
							"grid h-10 w-10 place-items-center rounded-full md:hidden",
							light
								? "text-primary-foreground hover:bg-primary-foreground/10"
								: "text-foreground hover:bg-surface",
						)}
					>
						{open ? (
							<X className="h-5 w-5" aria-hidden />
						) : (
							<Menu className="h-5 w-5" aria-hidden />
						)}
					</button>
				</Container>
			</div>

			<AnimatePresence>
				{open ? (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2 }}
						className="border-border border-b bg-background/95 backdrop-blur-xl md:hidden"
					>
						<Container className="flex flex-col gap-1 py-4">
							{navLinks.map((link) => (
								<a
									key={link.href}
									href={link.href}
									onClick={() => setOpen(false)}
									className="rounded-xl px-3 py-3 font-medium text-base text-foreground hover:bg-surface"
								>
									{link.label}
								</a>
							))}
							<div className="mt-2 flex flex-col gap-2">
								<Button
									variant="secondary"
									href={site.githubUrl}
									target="_blank"
									rel="noreferrer"
									onClick={() => setOpen(false)}
								>
									<Github className="h-4 w-4" aria-hidden />
									GitHub
								</Button>
								<Button
									variant="primary"
									href="#get"
									onClick={() => setOpen(false)}
								>
									Get the app
								</Button>
							</div>
						</Container>
					</motion.div>
				) : null}
			</AnimatePresence>
		</header>
	);
}
