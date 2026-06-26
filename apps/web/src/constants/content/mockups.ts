// Device-frame mockups (real FixIt app screenshots composited into phone frames).
// Each entry pairs the image URL with descriptive alt text for accessibility/SEO.

import homeLandscape from "@/assets/apple-iphone-15-black-mockup/KiRNQVg0-landscape.png";
import homeTiltedLeft from "@/assets/apple-iphone-15-black-mockup/KiRNQVg0-left.png";
import homePortrait from "@/assets/apple-iphone-15-black-mockup/KiRNQVg0-portrait.webp";
import techDashLeft from "@/assets/apple-iphone-15-black-mockup1/gDma4fqt-left.png";
import techProfileLandscape from "@/assets/samsung-galaxy-s24-ultra-mockup3/GOTDs6XU-landscape.png";
import techProfilePortrait from "@/assets/samsung-galaxy-s24-ultra-mockup3/GOTDs6XU-portrait.webp";
import browseLandscape from "@/assets/samsung-galaxy-s24-ultra-mockupand/YwSBAiJq-landscape.png";
import browsePortrait from "@/assets/samsung-galaxy-s24-ultra-mockupand/YwSBAiJq-portrait.webp";

export type Mockup = {
	src: string;
	alt: string;
	// Intrinsic pixel size of the asset. Passed to the <img> so the browser
	// reserves the correct box before the (lazy) image loads - no layout shift.
	width: number;
	height: number;
	// True for assets already rendered at a 3D angle, so TiltPhone skips its own
	// rotation (which would double up) and only adds parallax/sheen/pointer lean.
	tilted?: boolean;
};

export const mockups = {
	home: {
		src: homePortrait,
		alt: "FixIt home screen showing search, browse-services categories, and recommended technicians",
		width: 820,
		height: 1616,
	},
	homeTilted: {
		src: homeTiltedLeft,
		alt: "FixIt home screen showing search, browse-services categories, and recommended technicians",
		width: 1857,
		height: 3096,
		tilted: true,
	},
	homeLandscape: {
		src: homeLandscape,
		alt: "FixIt home screen showing search, browse-services categories, and recommended technicians",
		width: 2796,
		height: 1419,
	},
	browse: {
		src: browsePortrait,
		alt: "FixIt technician list for plumbing with ratings, distance, inspection fees, and book buttons",
		width: 820,
		height: 1554,
	},
	browseLandscape: {
		src: browseLandscape,
		alt: "FixIt technician list for plumbing with ratings, distance, inspection fees, and book buttons",
		width: 2359,
		height: 1245,
	},
	techProfile: {
		src: techProfilePortrait,
		alt: "FixIt technician profile with services and EGP price ranges",
		width: 820,
		height: 1554,
	},
	techProfileLandscape: {
		src: techProfileLandscape,
		alt: "FixIt technician profile with services and EGP price ranges",
		width: 2359,
		height: 1245,
	},
	techDash: {
		src: techDashLeft,
		alt: "FixIt technician dashboard showing today's earnings, weekly chart, and performance stats",
		width: 1857,
		height: 3096,
		tilted: true,
	},
} as const satisfies Record<string, Mockup>;
