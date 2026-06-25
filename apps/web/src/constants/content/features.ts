import {
	BellRing,
	type LucideIcon,
	ReceiptText,
	Sparkles,
	Users,
} from "lucide-react";
import { type Mockup, mockups } from "./mockups";

export type Feature = {
	id: string;
	eyebrow: string;
	title: string;
	body: string;
	points: readonly string[];
	icon: LucideIcon;
	mockup: Mockup;
};

export const features: readonly Feature[] = [
	{
		id: "ask-fixit",
		eyebrow: "Ask FixIt",
		title: "Describe it once. Get matched.",
		body: "Not sure who to call? Tell FixIt what's going wrong — in writing, with a photo, or a quick voice note — and it points you to the right service and nearby technicians.",
		points: [
			"Text, photo, or voice — whatever's easiest",
			"Suggests the service that fits the problem",
			"Surfaces technicians near you",
		],
		icon: Sparkles,
		mockup: mockups.home,
	},
	{
		id: "compare",
		eyebrow: "Browse & compare",
		title: "See who's near you, side by side.",
		body: "Every technician shows their rating, distance, and inspection fee up front. Sort by recommended, top rated, or nearest, and pick the one that fits.",
		points: [
			"Real star ratings and reviews",
			"Distance and inspection fee shown first",
			"Sort by recommended, top rated, or nearest",
		],
		icon: Users,
		mockup: mockups.browse,
	},
	{
		id: "prices",
		eyebrow: "Clear EGP pricing",
		title: "Know the price before you book.",
		body: "Each service lists a clear EGP range — low water pressure, a leaking toilet, an AC tune-up — so you can choose with no guessing and no surprises.",
		points: [
			"Per-service price ranges in EGP",
			"Pick the exact job you need",
			"Pay with cash on the day or by card",
		],
		icon: ReceiptText,
		mockup: mockups.techProfile,
	},
	{
		id: "updates",
		eyebrow: "Stay in the loop",
		title: "Follow every step to your door.",
		body: "Push notifications keep you posted from booking to done, and you'll see how far away your technician is in real time — distance and ETA, live. Available in English and Arabic.",
		points: [
			"Order updates by push notification",
			"Real-time distance and ETA",
			"Full English and Arabic, right-to-left",
		],
		icon: BellRing,
		mockup: mockups.home,
	},
];
