// Device-frame mockups (real FixIt app screenshots composited into phone frames).
// Each entry pairs the image URL with descriptive alt text for accessibility/SEO.

import homePortrait from "@/assets/apple-iphone-15-black-mockup/KiRNQVg0-portrait.webp";
import techDashPortrait from "@/assets/apple-iphone-15-black-mockup1/gDma4fqt-portrait.webp";
import techProfilePortrait from "@/assets/samsung-galaxy-s24-ultra-mockup3/GOTDs6XU-portrait.webp";
import browsePortrait from "@/assets/samsung-galaxy-s24-ultra-mockupand/YwSBAiJq-portrait.webp";

export type Mockup = {
	src: string;
	alt: string;
};

export const mockups = {
	home: {
		src: homePortrait,
		alt: "FixIt home screen showing search, browse-services categories, and recommended technicians",
	},
	browse: {
		src: browsePortrait,
		alt: "FixIt technician list for plumbing with ratings, distance, inspection fees, and book buttons",
	},
	techProfile: {
		src: techProfilePortrait,
		alt: "FixIt technician profile with services and EGP price ranges",
	},
	techDash: {
		src: techDashPortrait,
		alt: "FixIt technician dashboard showing today's earnings, weekly chart, and performance stats",
	},
} as const satisfies Record<string, Mockup>;
