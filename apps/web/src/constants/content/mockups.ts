// Device-frame mockups (real FixIt app screenshots composited into phone frames).
// Each entry pairs the image URL with descriptive alt text for accessibility/SEO.

import homeLandscape from "@/assets/apple-iphone-15-black-mockup/KiRNQVg0-landscape.png";
import homeTiltedLeft from "@/assets/apple-iphone-15-black-mockup/KiRNQVg0-left.png";
import homePortrait from "@/assets/apple-iphone-15-black-mockup/KiRNQVg0-portrait.webp";
import techDashLeft from "@/assets/apple-iphone-15-black-mockup1/gDma4fqt-left.png";
import techProfileLandscape from "@/assets/samsung-galaxy-s24-ultra-mockup3/GOTDs6XU-landscape.png";
import techProfilePortrait from "@/assets/samsung-galaxy-s24-ultra-mockup3/GOTDs6XU-portrait.webp";
import trackingPortrait from "@/assets/samsung-galaxy-s24-ultra-mockup4/2QPaqZWk-portrait.png";
import bookingPortrait from "@/assets/samsung-galaxy-s24-ultra-mockup5/AJsmh1sr-portrait.png";
import techJobsPortrait from "@/assets/samsung-galaxy-s24-ultra-mockup6/TaTwyTpl-portrait.png";
import techScheduleSetupPortrait from "@/assets/samsung-galaxy-s24-ultra-mockup7/anbczWFw-portrait.png";
import techCalendarPortrait from "@/assets/samsung-galaxy-s24-ultra-mockup8/nYlYCGZO-portrait.png";
import problemPortrait from "@/assets/samsung-galaxy-s24-ultra-mockup9/PmYDCghl-portrait.png";
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
	problem: {
		src: problemPortrait,
		alt: "FixIt search results for a described problem, listing matched technicians with distance and hourly rate",
		width: 1245,
		height: 2359,
	},
	booking: {
		src: bookingPortrait,
		alt: "FixIt date and time picker with a monthly calendar and morning and afternoon slots",
		width: 1245,
		height: 2359,
	},
	tracking: {
		src: trackingPortrait,
		alt: "FixIt live tracking map showing the technician on the way with a live ETA and distance",
		width: 1245,
		height: 2359,
	},
	techScheduleSetup: {
		src: techScheduleSetupPortrait,
		alt: "FixIt technician schedule setup with per-day availability toggles and visit-time slots",
		width: 1245,
		height: 2359,
	},
	techJobs: {
		src: techJobsPortrait,
		alt: "FixIt technician jobs screen with scheduled requests showing inspection fee and distance",
		width: 1245,
		height: 2359,
	},
	techCalendar: {
		src: techCalendarPortrait,
		alt: "FixIt technician schedule calendar showing bookings, the selected day, and unavailable days",
		width: 1245,
		height: 2359,
	},
} as const satisfies Record<string, Mockup>;
