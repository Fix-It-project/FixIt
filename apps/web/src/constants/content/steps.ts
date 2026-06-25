import { type Mockup, mockups } from "./mockups";

export type Step = {
	n: string;
	title: string;
	body: string;
	mockup: Mockup;
};

export const steps: readonly Step[] = [
	{
		n: "01",
		title: "Describe the problem",
		body: "Tell Ask FixIt what's wrong in your own words — type it, snap a photo, or send a voice note. It points you to the right service.",
		mockup: mockups.home,
	},
	{
		n: "02",
		title: "Match with a technician",
		body: "See technicians near you with real ratings, distance, and inspection fees — then compare EGP prices for the exact job.",
		mockup: mockups.browse,
	},
	{
		n: "03",
		title: "Book and pay",
		body: "Pick a service, choose your date and time slot, and confirm. Pay with cash on the day or by card.",
		mockup: mockups.techProfile,
	},
];
