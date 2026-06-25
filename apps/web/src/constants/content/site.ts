export const site = {
	name: "FixIt",
	tagline: "Find, book, and fix. From your phone.",
	description: "On-Demand Home Maintenance Platform for Egypt",
	// TODO: swap for the real repository URL.
	githubUrl: "https://github.com/Fix-It-project/FixIt",
	location: "Made in Egypt",
} as const;

export type NavLink = { label: string; href: string };

export const navLinks: readonly NavLink[] = [
	{ label: "Features", href: "#features" },
	{ label: "How it works", href: "#how-it-works" },
	{ label: "For technicians", href: "#technicians" },
	{ label: "FAQ", href: "#faq" },
];

// The apps are not listed yet — these render as disabled "Coming soon" chips,
// never official store badges.
export const stores = [
	{ platform: "App Store", note: "Coming soon" },
	{ platform: "Google Play", note: "Coming soon" },
] as const;
