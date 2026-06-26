export type Faq = {
	q: string;
	a: string;
};

export const faqs: readonly Faq[] = [
	{
		q: "Where does FixIt work?",
		a: "FixIt is built for Egypt and matches you with technicians near your location for the 10 service categories in the app.",
	},
	{
		q: "How do I pay?",
		a: "Your choice: pay with cash on the day of the job, or pay by card through the app at checkout.",
	},
	{
		q: "How does matching work?",
		a: "Describe the problem with Ask FixIt and it suggests the right service, then shows technicians near you with their ratings, distance, and inspection fee so you can compare and pick.",
	},
	{
		q: "Will I know the price beforehand?",
		a: "Yes. Every service shows a clear EGP price range, and you choose the exact job before you book, with no hidden costs.",
	},
	{
		q: "Is the app available in Arabic?",
		a: "Yes. FixIt is fully bilingual (English and Arabic) with complete right-to-left support.",
	},
	{
		q: "Can I work as a technician on FixIt?",
		a: "Absolutely. Sign up as a technician to receive jobs, set your schedule, send quotes, and track your earnings and performance in one place.",
	},
];
