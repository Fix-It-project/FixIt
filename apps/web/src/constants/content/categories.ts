import {
	AirVent,
	CookingPot,
	Droplets,
	Fan,
	Hammer,
	type LucideIcon,
	Paintbrush,
	Refrigerator,
	SatelliteDish,
	SprayCan,
	Zap,
} from "lucide-react";

export type Category = {
	label: string;
	icon: LucideIcon;
};

// The 10 real service categories shipped in the app.
export const categories: readonly Category[] = [
	{ label: "Air Condition", icon: AirVent },
	{ label: "Plumbing", icon: Droplets },
	{ label: "Electrical", icon: Zap },
	{ label: "Carpentry", icon: Hammer },
	{ label: "Painter", icon: Paintbrush },
	{ label: "Home Cleaning", icon: SprayCan },
	{ label: "Oven & Cooker", icon: CookingPot },
	{ label: "Fridge & Freezer", icon: Refrigerator },
	{ label: "Dish", icon: SatelliteDish },
	{ label: "Fan", icon: Fan },
];
