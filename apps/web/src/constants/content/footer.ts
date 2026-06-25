export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: readonly FooterLink[] };

export const footerColumns: readonly FooterColumn[] = [
	{
		title: "Product",
		links: [
			{ label: "Features", href: "#features" },
			{ label: "How it works", href: "#how-it-works" },
			{ label: "For technicians", href: "#technicians" },
			{ label: "FAQ", href: "#faq" },
		],
	},
	{
		title: "Services",
		links: [
			{ label: "Air Condition", href: "#categories" },
			{ label: "Plumbing", href: "#categories" },
			{ label: "Electrical", href: "#categories" },
			{ label: "Home Cleaning", href: "#categories" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", href: "#" },
			{ label: "Contact", href: "#" },
			{ label: "Careers", href: "#technicians" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacy", href: "#" },
			{ label: "Terms", href: "#" },
		],
	},
];
