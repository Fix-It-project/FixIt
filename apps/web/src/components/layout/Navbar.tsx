import { Github, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/ui/Wordmark";
import { navLinks, site } from "@/constants/content/site";
import { cn } from "@/lib/utils";

const NAV_HEIGHT = 64;

type NavBg = "hero" | "background" | "surface" | "ink";

// Per-section the bar adopts a SOLID base color (these cross-fade via
// transition-colors) and a text tone. The hero is special: its base is white,
// and a viewport-anchored gradient overlay is faded in on top - so leaving the
// hero fades the gradient out to reveal white, matching the smoothness of every
// other (colour→colour) hop. base must be a background-color, never an image.
const VARIANTS: Record<NavBg, { base: string; tone: "light" | "dark" }> = {
	hero: { base: "bg-background", tone: "light" },
	background: { base: "bg-background", tone: "dark" },
	surface: { base: "bg-surface", tone: "dark" },
	ink: { base: "bg-ink", tone: "light" },
};

export function Navbar() {
	const [bg, setBg] = useState<NavBg>("hero");
	const [open, setOpen] = useState(false);
	const [hovered, setHovered] = useState<string | null>(null);

	// Paint whatever section sits directly under the bar: sample the pixel just
	// below it and read the nearest `data-nav-bg`. rAF-throttled on scroll.
	useEffect(() => {
		let raf = 0;
		const sample = () => {
			raf = 0;
			const el = document.elementFromPoint(
				window.innerWidth / 2,
				NAV_HEIGHT + 2,
			);
			const token = el
				?.closest<HTMLElement>("[data-nav-bg]")
				?.dataset.navBg as NavBg | undefined;
			if (token && token in VARIANTS) setBg(token);
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(sample);
		};
		sample();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	// Lock scroll while the mobile menu is open.
	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	const variant = VARIANTS[bg];
	// An open mobile menu forces a solid, readable bar regardless of section.
	const overHero = !open && bg === "hero";
	const light = open ? false : variant.tone === "light";
	const baseClass = open ? "bg-background" : variant.base;
	// On the blue hero bar, the "It" accent must lighten so it doesn't vanish.
	const accent = overHero ? "soft" : "blue";

	return (
		<header className="fixed inset-x-0 top-0 z-50">
			<div className="relative">
				{/* solid base - cross-fades smoothly between every section colour */}
				<div
					aria-hidden
					className={cn(
						"absolute inset-0 transition-colors duration-300",
						baseClass,
					)}
				/>
				{/* hero gradient overlay - fades its opacity, so leaving the hero
				    dissolves blue into the white base instead of snapping */}
				<div
					aria-hidden
					className={cn(
						"absolute inset-0 bg-hero bg-fixed transition-opacity duration-300",
						overHero ? "opacity-100" : "opacity-0",
					)}
				/>
				<Container className="relative flex h-16 max-w-[100rem] items-center justify-between gap-4 px-6 sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr] lg:px-10">
					<a
						href="#top"
						aria-label="FixIt home"
						className="rounded-lg focus-visible:outline-none md:justify-self-start"
					>
						<Wordmark
							tone={light ? "light" : "dark"}
							accent={accent}
							withMark={false}
						/>
					</a>

					<nav
						aria-label="Primary"
						onMouseLeave={() => setHovered(null)}
						className="hidden items-center gap-1.5 md:flex md:justify-self-center"
					>
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onMouseEnter={() => setHovered(link.href)}
								className={cn(
									"relative rounded-full px-4 py-2 font-medium text-sm transition-colors",
									light
										? "text-primary-foreground/80 hover:text-primary-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{hovered === link.href ? (
									<motion.span
										layoutId="nav-pill"
										aria-hidden
										transition={{ type: "spring", stiffness: 400, damping: 32 }}
										className={cn(
											"absolute inset-0 -z-10 rounded-full",
											light ? "bg-primary-foreground/10" : "bg-surface",
										)}
									/>
								) : null}
								<span className="relative">{link.label}</span>
							</a>
						))}
					</nav>

					<div className="hidden items-center gap-3 md:flex md:justify-self-end">
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
						className="bg-background/95 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] backdrop-blur-xl md:hidden"
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
